import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function AdvisoryPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [advisory, setAdvisory] = useState<any>(null);
    const [lang, setLang] = useState<"en"|"hi"|"gu">("en");

    const fetchAdvisory = async (language: string) => {
        setLoading(true);
        try {
            const farmRes = await fetch(`${API_BASE}/api/farms/${id}`);
            const farm = await farmRes.json();
            
            const riskRes = await fetch(`${API_BASE}/api/farms/${id}/risk`);
            const risk = await riskRes.json();
            
            const weatherRes = await fetch(`${API_BASE}/api/weather?lat=${farm.location.lat}&lng=${farm.location.lng}`);
            const weather = await weatherRes.json();

            const satRes = await fetch(`${API_BASE}/api/satellite?lat=${farm.location.lat}&lng=${farm.location.lng}&district=${farm.district}`);
            const sat = await satRes.json();

            const context = {
                location: `${farm.district}, ${farm.state}`,
                crop: farm.crop,
                soil: farm.soil.type,
                waterAvailability: farm.irrigation,
                temperature: weather.current?.temperature,
                humidity: weather.current?.humidity,
                rainfallForecast: weather.forecast && weather.forecast.length > 0 ? weather.forecast[0].precipitation : 0,
                vegetationHealth: sat.vegetationStatus || "Unknown",
                farmRisk: risk.level || "Unknown",
                language
            };

            const advRes = await fetch(`${API_BASE}/api/advisory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(context)
            });
            const data = await advRes.json();
            setAdvisory(data);
        } catch (err) {
            console.error(err);
            alert("Failed to load advisory");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchAdvisory(lang);
    }, [id, lang]);

    if (loading && !advisory) return <div className="min-h-screen bg-green-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="min-h-screen bg-green-50 p-4 font-sans pb-20">
            <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Link to={`/farm-dashboard/${id}`}>
                            <Button variant="ghost" size="icon" className="hover:bg-green-100">
                                <ArrowLeft className="w-5 h-5 text-green-700" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold text-green-800">AI Advisory</h1>
                    </div>
                    <div className="flex gap-1">
                        <Button size="sm" variant={lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}>EN</Button>
                        <Button size="sm" variant={lang === "hi" ? "default" : "outline"} onClick={() => setLang("hi")}>HI</Button>
                        <Button size="sm" variant={lang === "gu" ? "default" : "outline"} onClick={() => setLang("gu")}>GU</Button>
                    </div>
                </div>

                {loading && <div className="flex justify-center my-4"><Loader2 className="w-6 h-6 animate-spin text-green-600" /></div>}

                {!loading && advisory && (
                    <div className="space-y-4">
                        {(advisory.source === "fallback-template" || advisory.source === "seeded-demo") && (
                            <div className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                                Demo Mode: {advisory.source}
                            </div>
                        )}
                        <Card className="border-green-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-green-800">Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-gray-700">
                                {advisory.summary}
                            </CardContent>
                        </Card>

                        <Card className="border-red-200 bg-red-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-red-800">Key Risks</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-gray-700">
                                <ul className="list-disc pl-4 space-y-1">
                                    {advisory.risks?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-blue-200 bg-blue-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-blue-800">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-gray-700">
                                <ul className="list-disc pl-4 space-y-1">
                                    {advisory.actions?.map((a: string, i: number) => <li key={i}>{a}</li>)}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-green-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-green-800">Irrigation & Weather</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-gray-700 space-y-2">
                                <p><strong>Irrigation:</strong> {advisory.irrigationAdvice}</p>
                                <p><strong>Weather:</strong> {advisory.weatherAdvice}</p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
