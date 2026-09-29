import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Satellite, Zap, CloudLightning, Phone, ArrowLeft, Star, ShieldCheck } from "lucide-react"

// Simulated Satellite Map Component
const SatelliteMapDemo = () => {
    const [scanning, setScanning] = useState(true)
    const [healthData, setHealthData] = useState<boolean>(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setScanning(false)
            setHealthData(true)
        }, 3000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
            {/* Base Map Layer (Simulated) */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-70 grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105" />

            {/* Sci-Fi Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />

            {/* Health Heatmap Overlay */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${healthData ? 'opacity-80' : 'opacity-0'}`}>
                <div className="absolute top-10 left-10 w-40 h-40 bg-green-500/40 blur-3xl rounded-full mix-blend-overlay" />
                <div className="absolute bottom-10 right-10 w-48 h-24 bg-emerald-600/40 blur-3xl rounded-full mix-blend-overlay" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-500/30 blur-2xl rounded-full animate-pulse mix-blend-overlay" />
                <div className="absolute top-5 right-5 w-20 h-20 bg-red-600/40 blur-2xl rounded-full animate-ping mix-blend-overlay" />
            </div>

            {/* Scanning Scanline */}
            {scanning && (
                <div className="absolute inset-0 z-20">
                    <div className="w-full h-full bg-gradient-to-b from-transparent via-green-400/20 to-transparent translate-y-[-100%] animate-[scan_3s_ease-in-out_infinite]" />
                    <div className="absolute top-4 left-4 font-mono text-xs text-green-400 tracking-widest animate-pulse">
                        ● SATELLITE LINK ESTABLISHED
                    </div>
                </div>
            )}

            {/* HUD Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-end z-30">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-blue-300">
                        <Satellite className="w-3 h-3" />
                        <span>SENTINEL-2 FEED</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">LAT: 23.0225° N | LNG: 72.5714° E</div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="bg-black/50 border-white/20 text-white text-[10px] h-5">NDVI ANALYSIS</Badge>
                    <div className="flex gap-2 mt-1">
                        <div className="flex items-center gap-1 text-[9px] text-white"><span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]" /> Healthy</div>
                        <div className="flex items-center gap-1 text-[9px] text-white"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]" /> Stress</div>
                        <div className="flex items-center gap-1 text-[9px] text-white"><span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]" /> Risk</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SubscriptionPage() {
    const navigate = useNavigate()
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white pb-20 selection:bg-green-500/30">

            {/* Navbar */}
            <div className="px-4 py-4 flex items-center gap-4 sticky top-0 z-50 bg-black/10 backdrop-blur-xl border-b border-white/5">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        AgriMitra Pro
                    </h1>
                </div>
                <div className="ml-auto">
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">v2.0</Badge>
                </div>
            </div>

            <div className="p-4 max-w-lg mx-auto space-y-8 mt-2">

                {/* Hero Section */}
                <div className="text-center space-y-2">
                    <Badge className="bg-black/50 border border-emerald-500/30 text-emerald-300 px-3 py-1 mb-2">
                        <Star className="w-3 h-3 mr-1 fill-emerald-300" /> Professional Farming
                    </Badge>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        See your farm like <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">never before.</span>
                    </h2>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
                        Unlock satellite diagnostics, expert consultations, and unlimited AI scans.
                    </p>
                </div>

                {/* Satellite Demo Card */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-black/40 backdrop-blur-sm rounded-2xl p-1 border border-white/10">
                        <SatelliteMapDemo />
                    </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { icon: Zap, color: "text-amber-400", title: "Instant AI", desc: "2x specific disease detection" },
                        { icon: CloudLightning, color: "text-blue-400", title: "Smart Weather", desc: "Hyper-local storm alerts" },
                        { icon: Phone, color: "text-green-400", title: "Agri-Expert", desc: "24/7 Priority support chat" },
                        { icon: ShieldCheck, color: "text-purple-400", title: "Crop Protect", desc: "Advanced pest forecasting" },
                    ].map((feature, i) => (
                        <Card key={i} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                            <CardContent className="p-4 flex flex-col gap-2">
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                <div>
                                    <h3 className="font-semibold text-slate-200 text-sm">{feature.title}</h3>
                                    <p className="text-[11px] text-slate-500 leading-tight">{feature.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pricing Section */}
                <div className="space-y-6">
                    {/* Toggle */}
                    <div className="flex justify-center">
                        <div className="bg-black/40 p-1 rounded-full border border-white/10 flex relative">
                            <div className={`absolute top-1 bottom-1 w-1/2 bg-white/10 rounded-full transition-all duration-300 ${billingCycle === 'monthly' ? 'left-1' : 'left-[48%]'}`}></div>
                            <button
                                onClick={() => setBillingCycle("monthly")}
                                className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === "monthly" ? "text-white" : "text-slate-500"}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle("yearly")}
                                className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors ${billingCycle === "yearly" ? "text-white" : "text-slate-500"}`}
                            >
                                Yearly <span className="text-[10px] text-emerald-400 ml-1">-20%</span>
                            </button>
                        </div>
                    </div>

                    {/* Main Pricing Card */}
                    <Card className="relative overflow-hidden border-0 bg-transparent">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-2xl blur-xl" />

                        <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
                            <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-400 to-orange-500 text-[10px] font-bold text-black px-3 py-1 rounded-bl-xl shadow-lg">
                                BEST VALUE
                            </div>

                            <div className="text-center space-y-1">
                                <div className="flex items-end justify-center gap-1">
                                    <span className="text-4xl font-bold text-white tracking-tight">
                                        {billingCycle === "monthly" ? "₹99" : "₹999"}
                                    </span>
                                    <span className="text-slate-400 mb-1">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                                </div>
                                <p className="text-xs text-slate-500">Less than ₹3 per day for complete protection</p>
                            </div>

                            <div className="h-px bg-white/10" />

                            <div className="space-y-3">
                                {["Unlimited Satellite Scans", "Priority Disease Diagnosis", "Expert Agronomist Chat", "Ad-Free Farming", "Data Export & Reports"].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                            <Check className="w-3 h-3 text-emerald-400" />
                                        </div>
                                        <span className="text-sm text-slate-300">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <Button className="w-full h-12 bg-white text-black font-bold text-lg hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                                Try Pro Free for 7 Days
                            </Button>
                        </div>
                    </Card>

                    <p className="text-center text-[10px] text-slate-600">
                        Secure payment via UPI / Card. Cancel anytime from Settings.
                    </p>
                </div>

            </div>
        </div>
    )
}
