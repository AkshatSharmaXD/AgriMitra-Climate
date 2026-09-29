import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CropSuitabilityPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [disclaimer, setDisclaimer] = useState("");

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const farmRes = await fetch(`${API_BASE}/api/farms/${id}`);
                const farm = await farmRes.json();
                
                const weatherRes = await fetch(`${API_BASE}/api/weather?lat=${farm.location.lat}&lng=${farm.location.lng}`);
                const weatherData = await weatherRes.json();

                const context = {
                    season: farm.season,
                    soilType: farm.soil.type,
                    irrigation: farm.irrigation,
                    temperature: weatherData.current?.temperature || 25,
                    rainfall: weatherData.current?.rainfall || 100
                };

                const res = await fetch(`${API_BASE}/api/recommendations/crops`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(context)
                });
                const data = await res.json();
                setRecommendations(data.recommendations || []);
                setDisclaimer(data.disclaimer || "");
            } catch (err) {
                console.error(err);
                alert("Failed to load crop recommendations");
            } finally {
                setLoading(false);
            }
        };
        fetchRecs();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-green-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="min-h-screen bg-green-50 p-4 font-sans pb-20">
            <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Link to={`/farm-dashboard/${id}`}>
                        <Button variant="ghost" size="icon" className="hover:bg-green-100">
                            <ArrowLeft className="w-5 h-5 text-green-700" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-green-800">Crop Suitability</h1>
                </div>

                {disclaimer && (
                    <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                        {disclaimer}
                    </div>
                )}

                {recommendations.map((rec, i) => (
                    <Card key={i} className="border-green-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex justify-between items-center">
                                <span>{rec.crop}</span>
                                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">{rec.matchPercentage}% Match</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-600">
                            <ul className="list-disc pl-4 space-y-1">
                                {rec.matchBreakdown.map((b: string, j: number) => (
                                    <li key={j}>{b}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
