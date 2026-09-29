import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function FarmProfilePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        farmerId: "650000000000000000000000",
        lat: "27.55",
        lng: "76.63",
        state: "Rajasthan",
        district: "Alwar",
        area: "2",
        crop: "Wheat",
        season: "Rabi",
        soilType: "Loamy",
        irrigation: "Limited irrigation"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/farms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    farmerId: formData.farmerId,
                    location: { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) },
                    state: formData.state,
                    district: formData.district,
                    area: parseFloat(formData.area),
                    crop: formData.crop,
                    season: formData.season,
                    soil: { type: formData.soilType },
                    irrigation: formData.irrigation
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save farm');
            
            navigate(`/farm-dashboard/${data._id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to create farm profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 p-4 font-sans pb-20">
            <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center gap-2 mb-6">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="hover:bg-green-100">
                            <ArrowLeft className="w-5 h-5 text-green-700" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-green-800">Farm Profile</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Register Your Farm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Crop</Label>
                                <Input value={formData.crop} onChange={e => setFormData({...formData, crop: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Area (Acres)</Label>
                                <Input type="number" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Soil Type</Label>
                                <Input value={formData.soilType} onChange={e => setFormData({...formData, soilType: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Irrigation</Label>
                                <Input value={formData.irrigation} onChange={e => setFormData({...formData, irrigation: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <Label>District</Label>
                                <Input value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Latitude</Label>
                                    <Input value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Longitude</Label>
                                    <Input value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 mt-4" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
