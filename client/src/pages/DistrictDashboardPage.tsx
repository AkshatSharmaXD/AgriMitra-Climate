import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { DistrictMap } from "../components/DistrictMap";

export default function DistrictDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [summaries, setSummaries] = useState<any[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
    const [interventions, setInterventions] = useState<any>(null);
    const [loadingInterventions, setLoadingInterventions] = useState(false);

    useEffect(() => {
        const fetchSummaries = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/district/summary`);
                const data = await res.json();
                setSummaries(data);
                if (data.length > 0) {
                    setSelectedDistrict(data[0]);
                }
            } catch (err) {
                console.error(err);
                alert("Failed to load district summaries");
            } finally {
                setLoading(false);
            }
        };
        fetchSummaries();
    }, []);

    const fetchInterventions = async (districtData: any) => {
        setLoadingInterventions(true);
        try {
            const res = await fetch(`${API_BASE}/api/district/interventions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ district: districtData.district, data: districtData })
            });
            const data = await res.json();
            setInterventions(data);
        } catch (err) {
            console.error(err);
            alert("Failed to load interventions");
        } finally {
            setLoadingInterventions(false);
        }
    };

    const getRiskColor = (level: string) => {
        if (level === 'LOW') return 'text-green-600';
        if (level === 'MEDIUM') return 'text-yellow-600';
        if (level === 'HIGH') return 'text-orange-600';
        if (level === 'CRITICAL') return 'text-red-600';
        return 'text-gray-800';
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans pb-20">
            <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800">District Intelligence</h1>
                </div>
                
                <div className="mb-4">
                    <DistrictMap districts={summaries} />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                    {summaries.map(s => (
                        <Button 
                            key={s.district} 
                            variant={selectedDistrict?.district === s.district ? "default" : "outline"}
                            onClick={() => { setSelectedDistrict(s); setInterventions(null); }}
                            className="snap-center whitespace-nowrap"
                        >
                            {s.district}
                        </Button>
                    ))}
                </div>

                {selectedDistrict && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Overview: {selectedDistrict.district}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-gray-700">
                                <p><strong>Total Farms:</strong> {selectedDistrict.farmCount}</p>
                                <p><strong>Dominant Crop:</strong> {selectedDistrict.dominantCrop}</p>
                                <p><strong>Water Stress:</strong> {selectedDistrict.waterStressLevel}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Risk Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm font-bold">
                                <div className="flex justify-between"><span className={getRiskColor("CRITICAL")}>CRITICAL</span> <span>{selectedDistrict.riskBandCounts.CRITICAL}</span></div>
                                <div className="flex justify-between"><span className={getRiskColor("HIGH")}>HIGH</span> <span>{selectedDistrict.riskBandCounts.HIGH}</span></div>
                                <div className="flex justify-between"><span className={getRiskColor("MEDIUM")}>MEDIUM</span> <span>{selectedDistrict.riskBandCounts.MEDIUM}</span></div>
                                <div className="flex justify-between"><span className={getRiskColor("LOW")}>LOW</span> <span>{selectedDistrict.riskBandCounts.LOW}</span></div>
                            </CardContent>
                        </Card>
                        
                        <div className="md:col-span-2">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => fetchInterventions(selectedDistrict)} disabled={loadingInterventions}>
                                {loadingInterventions ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate AI Interventions"}
                            </Button>
                        </div>

                        {interventions && (
                            <div className="md:col-span-2 space-y-4">
                                {interventions.disclaimer && (
                                    <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                                        {interventions.disclaimer}
                                    </div>
                                )}
                                {interventions.interventions?.map((inv: any, i: number) => (
                                    <Card key={i} className="border-l-4 border-blue-500">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-md flex justify-between">
                                                {inv.action}
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">Priority: {inv.priority}</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm text-gray-700">
                                            {inv.reasoning}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
