import { Progress } from "@/components/ui/progress";

interface RiskGaugeProps {
    subScores: {
        waterStress: number;
        heatStress: number;
        diseaseRisk: number;
        rainfallRisk: number;
        vegetationRisk: number;
    }
}

export function RiskGauge({ subScores }: RiskGaugeProps) {
    const getColor = (val: number) => {
        if (val <= 30) return "bg-green-500";
        if (val <= 60) return "bg-yellow-500";
        if (val <= 80) return "bg-orange-500";
        return "bg-red-500";
    };

    return (
        <div className="space-y-3 mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Risk Breakdown</h4>
            
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Water Stress</span>
                    <span>{subScores.waterStress}%</span>
                </div>
                <Progress value={subScores.waterStress} className="h-2 bg-green-100" indicatorClassName={getColor(subScores.waterStress)} />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Heat Stress</span>
                    <span>{subScores.heatStress}%</span>
                </div>
                <Progress value={subScores.heatStress} className="h-2 bg-green-100" indicatorClassName={getColor(subScores.heatStress)} />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Disease Risk</span>
                    <span>{subScores.diseaseRisk}%</span>
                </div>
                <Progress value={subScores.diseaseRisk} className="h-2 bg-green-100" indicatorClassName={getColor(subScores.diseaseRisk)} />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Rainfall Anomaly</span>
                    <span>{subScores.rainfallRisk}%</span>
                </div>
                <Progress value={subScores.rainfallRisk} className="h-2 bg-green-100" indicatorClassName={getColor(subScores.rainfallRisk)} />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Vegetation Risk</span>
                    <span>{subScores.vegetationRisk}%</span>
                </div>
                <Progress value={subScores.vegetationRisk} className="h-2 bg-green-100" indicatorClassName={getColor(subScores.vegetationRisk)} />
            </div>
        </div>
    );
}
