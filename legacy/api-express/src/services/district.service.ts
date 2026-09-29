import Farm from '../models/farm.model';

export async function getDistrictSummaries() {
    const pipeline = [
        {
            $lookup: {
                from: 'farmrisks',
                localField: '_id',
                foreignField: 'farmId',
                as: 'risks'
            }
        },
        {
            $lookup: {
                from: 'diseaseanalyses',
                localField: '_id',
                foreignField: 'farmId',
                as: 'diseases'
            }
        },
        {
            $group: {
                _id: "$district",
                farms: { $push: "$$ROOT" }
            }
        }
    ];

    const aggregated = await Farm.aggregate(pipeline);

    const summaries = aggregated.map(group => {
        const district = group._id;
        const farms = group.farms;

        let riskBandCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
        let cropCounts: Record<string, number> = {};
        let totalWaterStress = 0;
        let riskCount = 0;
        let diseaseOccurrences: Record<string, number> = {};

        farms.forEach((f: any) => {
            cropCounts[f.crop] = (cropCounts[f.crop] || 0) + 1;

            if (f.risks && f.risks.length > 0) {
                const latestRisk = f.risks.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                const level = latestRisk.level as keyof typeof riskBandCounts;
                if (riskBandCounts[level] !== undefined) {
                    riskBandCounts[level]++;
                }
                totalWaterStress += (latestRisk.waterStress || 0);
                riskCount++;
            }

            if (f.diseases && f.diseases.length > 0) {
                f.diseases.forEach((d: any) => {
                    if (d.disease !== 'healthy' && d.disease !== 'Not a plant') {
                        diseaseOccurrences[d.disease] = (diseaseOccurrences[d.disease] || 0) + 1;
                    }
                });
            }
        });

        const dominantCrop = Object.keys(cropCounts).sort((a, b) => cropCounts[b] - cropCounts[a])[0] || 'Unknown';
        
        const avgWaterStress = riskCount > 0 ? (totalWaterStress / riskCount) : 0;
        let waterStressLevel = 'LOW';
        if (avgWaterStress > 70) waterStressLevel = 'HIGH';
        else if (avgWaterStress > 40) waterStressLevel = 'MEDIUM';

        return {
            district,
            farmCount: farms.length,
            riskBandCounts,
            dominantCrop,
            waterStressLevel,
            diseaseOccurrences
        };
    });

    return summaries.sort((a, b) => a.district.localeCompare(b.district));
}
