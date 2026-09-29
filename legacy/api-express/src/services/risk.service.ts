import mongoose from 'mongoose';
import FarmRisk from '../models/farmRisk.model';

export function calculateWaterStress(irrigation: string, soilMoisture: string | undefined): number {
    let score = 50; // neutral
    const irg = irrigation.toLowerCase();
    if (irg.includes('limited') || irg.includes('rainfed')) score += 30;
    else if (irg.includes('good') || irg.includes('well')) score -= 20;

    const sm = (soilMoisture || '').toLowerCase();
    if (sm === 'low') score += 20;
    else if (sm === 'high') score -= 20;

    return Math.max(0, Math.min(100, score));
}

export function calculateHeatStress(temperature: number): number {
    let score = 0;
    if (temperature > 35) {
        score = 80 + (temperature - 35) * 4;
    } else if (temperature > 30) {
        score = 40 + (temperature - 30) * 8;
    } else {
        score = Math.max(0, temperature);
    }
    return Math.max(0, Math.min(100, score));
}

export function calculateDiseaseRisk(diseaseConfidence: number | undefined): number {
    if (diseaseConfidence !== undefined) {
        return Math.max(0, Math.min(100, diseaseConfidence * 100));
    }
    return 30; // Neutral low risk default
}

export function calculateRainfallRisk(rainfall: number): number {
    if (rainfall < 1) return 60; // drought risk
    if (rainfall > 50) return 80; // flood risk
    if (rainfall > 20) return 40;
    return 20; // ideal
}

export function calculateVegetationRisk(ndvi: number | undefined): number {
    if (ndvi !== undefined) {
        const risk = 100 - (ndvi - 0.2) * (100 / 0.6);
        return Math.max(0, Math.min(100, Math.round(risk)));
    }
    return 50; // Neutral default
}

export async function computeAndSaveFarmRisk(
    farmId: string,
    farmData: any,
    weatherData: any,
    satelliteData?: any,
    diseaseData?: any
) {
    const assumptions: string[] = [];

    const waterStress = calculateWaterStress(farmData.irrigation, farmData.soil?.moisture);
    const heatStress = calculateHeatStress(weatherData?.current?.temperature || 25);
    
    let diseaseRisk;
    if (diseaseData && diseaseData.confidence) {
        diseaseRisk = calculateDiseaseRisk(diseaseData.confidence);
    } else {
        diseaseRisk = calculateDiseaseRisk(undefined);
        assumptions.push("No recent disease analysis found; assuming default low risk (30).");
    }

    const rainfallRisk = calculateRainfallRisk(weatherData?.current?.rainfall || 0);

    let vegetationRisk;
    if (satelliteData && satelliteData.ndvi !== undefined) {
        vegetationRisk = calculateVegetationRisk(satelliteData.ndvi);
    } else {
        vegetationRisk = calculateVegetationRisk(undefined);
        assumptions.push("No satellite NDVI data found; assuming default neutral vegetation risk (50).");
    }

    const overallScore = Math.round(
        (waterStress * 0.30) +
        (heatStress * 0.20) +
        (diseaseRisk * 0.20) +
        (rainfallRisk * 0.15) +
        (vegetationRisk * 0.15)
    );

    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (overallScore <= 30) level = 'LOW';
    else if (overallScore <= 60) level = 'MEDIUM';
    else if (overallScore <= 80) level = 'HIGH';
    else level = 'CRITICAL';

    const riskDoc = new FarmRisk({
        farmId: new mongoose.Types.ObjectId(farmId),
        waterStress,
        heatStress,
        rainfallRisk,
        diseaseRisk,
        vegetationRisk,
        overallScore,
        level,
        timestamp: new Date()
    });

    await riskDoc.save();

    return {
        ...riskDoc.toObject(),
        assumptions
    };
}
