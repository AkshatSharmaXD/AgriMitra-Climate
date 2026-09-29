import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export interface CropData {
    crop: string;
    season: string[];
    soil: string[];
    waterRequirement: string;
    temperatureRange: { min: number; max: number };
    rainfallRequirement: { min: number; max: number };
}

export function loadCrops(): CropData[] {
    const filePath = path.join(__dirname, '../data/crops.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

export function calculateSuitability(
    cropData: CropData,
    farmContext: {
        season: string;
        soilType: string;
        irrigation: string;
        temperature: number;
        rainfall: number;
    }
) {
    let score = 0;
    const breakdown: string[] = [];
    const maxScore = 5;

    // 1. Season match
    if (cropData.season.includes(farmContext.season)) {
        score += 1;
        breakdown.push(`Season (${farmContext.season}) matches optimal growing periods.`);
    } else {
        breakdown.push(`Season (${farmContext.season}) is not ideal for this crop.`);
    }

    // 2. Soil match
    if (cropData.soil.includes(farmContext.soilType)) {
        score += 1;
        breakdown.push(`Soil type (${farmContext.soilType}) is suitable.`);
    } else {
        breakdown.push(`Soil type (${farmContext.soilType}) is sub-optimal.`);
    }

    // 3. Water/Irrigation match
    const irg = (farmContext.irrigation || '').toLowerCase();
    const req = cropData.waterRequirement.toLowerCase();
    
    if (req === 'low') {
        score += 1;
        breakdown.push(`Water requirement is low, easily met by current irrigation.`);
    } else if (req === 'high') {
        if (irg.includes('good') || irg.includes('well') || irg.includes('full')) {
            score += 1;
            breakdown.push(`High water requirement met by good irrigation.`);
        } else {
            breakdown.push(`High water requirement may not be met by limited irrigation.`);
        }
    } else { // Moderate
        if (irg.includes('limited') || irg.includes('rainfed')) {
            score += 0.5;
            breakdown.push(`Moderate water requirement partially met by limited irrigation.`);
        } else {
            score += 1;
            breakdown.push(`Moderate water requirement met by current irrigation.`);
        }
    }

    // 4. Temperature match
    if (farmContext.temperature >= cropData.temperatureRange.min && farmContext.temperature <= cropData.temperatureRange.max) {
        score += 1;
        breakdown.push(`Current temperature (${farmContext.temperature}°C) is within ideal range.`);
    } else {
        breakdown.push(`Current temperature (${farmContext.temperature}°C) is outside ideal range.`);
    }

    // 5. Rainfall match
    if (farmContext.rainfall >= cropData.rainfallRequirement.min && farmContext.rainfall <= cropData.rainfallRequirement.max) {
        score += 1;
        breakdown.push(`Rainfall is within optimal range.`);
    } else if (farmContext.rainfall < cropData.rainfallRequirement.min) {
        if (farmContext.rainfall >= cropData.rainfallRequirement.min / 2) {
             score += 0.5;
             breakdown.push(`Rainfall is slightly below optimal range.`);
        } else {
             breakdown.push(`Rainfall is significantly below optimal range.`);
        }
    } else {
        breakdown.push(`Rainfall is above optimal range.`);
    }

    const matchPercentage = Math.round((score / maxScore) * 100);

    return {
        crop: cropData.crop,
        matchPercentage,
        matchBreakdown: breakdown,
        requirements: {
            water: cropData.waterRequirement,
            temp: `${cropData.temperatureRange.min}-${cropData.temperatureRange.max}°C`,
            rain: `${cropData.rainfallRequirement.min}-${cropData.rainfallRequirement.max}mm`
        }
    };
}

export function recommendCrops(farmContext: any) {
    const crops = loadCrops();
    const results = crops.map(c => calculateSuitability(c, farmContext));
    results.sort((a, b) => b.matchPercentage - a.matchPercentage);
    return results;
}
