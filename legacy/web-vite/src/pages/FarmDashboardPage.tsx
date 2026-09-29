import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ShieldAlert, CloudRain } from "lucide-react";
import { RiskGauge } from "../components/RiskGauge";

export default function FarmDashboardPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [farm, setFarm] = useState<any>(null);
    const [risk, setRisk] = useState<any>(null);
    const [weather, setWeather] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const farmRes = await fetch(`${API_BASE}/api/farms/${id}`);
                const farmData = await farmRes.json();
                if (!farmRes.ok) throw new Error("Farm not found");
                setFarm(farmData);

                const riskRes = await fetch(`${API_BASE}/api/farms/${id}/risk`);
                const riskData = await riskRes.json();
                setRisk(riskData);

                const weatherRes = await fetch(`${API_BASE}/api/weather?lat=${farmData.location.lat}&lng=${farmData.location.lng}`);
                const weatherData = await weatherRes.json();
                setWeather(weatherData);

            } catch (err) {
                console.error(err);
                alert("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!farm) {
        return (
            <div className="min-h-screen bg-green-50 p-4 text-center">
                <p>Farm not found.</p>
                <Link to="/"><Button className="mt-4">Go Home</Button></Link>
            </div>
        );
    }

    const getRiskColor = (level: string) => {
        if (level === 'LOW') return 'text-green-600';
        if (level === 'MEDIUM') return 'text-yellow-600';
        if (level === 'HIGH') return 'text-orange-600';
        if (level === 'CRITICAL') return 'text-red-600';
        return 'text-gray-800';
    };

    return (
        <div className="min-h-screen bg-green-50 p-4 font-sans pb-20">
            <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="hover:bg-green-100">
                            <ArrowLeft className="w-5 h-5 text-green-700" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-green-800">Farm Dashboard</h1>
                </div>

                <Card className="border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex justify-between items-center">
                            <span>{farm.district}, {farm.state}</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">{farm.crop}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600 space-y-1">
                        <p>Area: {farm.area} acres</p>
                        <p>Soil: {farm.soil.type}</p>
                        <p>Irrigation: {farm.irrigation}</p>
                    </CardContent>
                </Card>

                {risk && (
                    <Card className="border-green-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ShieldAlert className="w-5 h-5" /> 
                                Farm Risk: <span className={`font-bold ${getRiskColor(risk.level)}`}>{risk.level}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-center mb-2">{risk.overallScore} <span className="text-lg text-gray-500 font-normal">/ 100</span></div>
                            <RiskGauge subScores={{
                                waterStress: risk.waterStress,
                                heatStress: risk.heatStress,
                                diseaseRisk: risk.diseaseRisk,
                                rainfallRisk: risk.rainfallRisk,
                                vegetationRisk: risk.vegetationRisk
                            }} />
                            {risk.assumptions && risk.assumptions.length > 0 && (
                                <div className="mt-4 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                                    <strong>Notes:</strong>
                                    <ul className="list-disc pl-4 mt-1">
                                        {risk.assumptions.map((a: string, i: number) => <li key={i}>{a}</li>)}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {weather && (
                    <Card className="border-green-200">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Weather Forecast</CardTitle>
                            {weather.degraded && (
                                <span className="text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded">Degraded Mode</span>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="flex overflow-x-auto gap-3 pb-2 snap-x">
                                {weather.forecast.map((day: any, i: number) => (
                                    <div key={i} className="flex-shrink-0 w-24 bg-white border border-gray-100 rounded-lg p-2 text-center snap-center shadow-sm">
                                        <div className="text-xs text-gray-500 mb-1">
                                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                        <div className="font-bold text-sm mb-1">{day.tempMax}°</div>
                                        <div className="text-xs text-gray-400 mb-1">{day.tempMin}°</div>
                                        <div className="flex items-center justify-center gap-1 text-[10px] text-blue-500">
                                            <CloudRain className="w-3 h-3" /> {day.precipitation}mm
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                    <Link to={`/advisory/${id}`} className="block">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-md flex flex-col items-center">
                            <span>Get AI Advisory</span>
                        </Button>
                    </Link>
                    <Link to={`/crop-suitability/${id}`} className="block">
                        <Button variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50 py-6 text-md flex flex-col items-center">
                            <span>Crop Suitability</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
