import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, AlertTriangle, CheckCircle, ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"

interface DiagnosisResult {
    disease: string;
    confidence: number;
    severity: string;
    description: string;
    symptoms?: string[];
    remedies?: string[];
}

export default function DiagnosisPage() {
    const [step, setStep] = useState<"upload" | "analyzing" | "result">("upload")
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [result, setResult] = useState<DiagnosisResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Helper to get sanitized URL
    const getApiUrl = () => {
        const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return raw.replace(/\/$/, '');
    }

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setSelectedImage(event.target?.result as string)
                setStep("analyzing")
                analyzeImage(file)
            }
            reader.readAsDataURL(file)
        }
    }

    const analyzeImage = async (file: File) => {
        setError(null)
        const formData = new FormData()
        formData.append("image", file)

        try {
            const API_URL = getApiUrl();
            // Connect to the Express Server (Proxy)
            const response = await fetch(`${API_URL}/api/diagnose`, {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to analyze image. Check server logs.")
            }

            if (data.error) {
                throw new Error(data.error)
            }

            setResult({
                disease: data.class || "Unknown",
                confidence: data.confidence ? Math.round(data.confidence * 100) : 0,
                severity: "Medium",
                description: data.recommendation || "No recommendation available.",
                symptoms: [],
                remedies: [data.recommendation]
            })
            setStep("result")
        } catch (err: any) {
            console.error("Diagnosis Error:", err)
            setError(err.message || "Failed to connect to Diagnosis Server. Please try again later.")
            setStep("upload") // Return to upload screen so they can see the error
        }
    }

    const resetDiagnosis = () => {
        setStep("upload")
        setSelectedImage(null)
        setResult(null)
        setError(null)
    }

    return (
        <div className="min-h-screen bg-green-50 p-4 font-sans">
            <div className="max-w-md mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="hover:bg-green-100">
                            <ArrowLeft className="w-5 h-5 text-green-700" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-green-800">Crop Doctor</h1>
                </div>

                {step === "upload" && (
                    <Card className="border-green-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-center text-green-800">Upload Plant Photo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <label className="cursor-pointer">
                                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
                                    <div className="flex flex-col items-center justify-center h-32 bg-green-100 rounded-lg hover:bg-green-200 transition-colors border-2 border-dashed border-green-300">
                                        <Camera className="w-8 h-8 text-green-600 mb-2" />
                                        <span className="text-sm font-medium text-green-700">Camera</span>
                                    </div>
                                </label>
                                <label className="cursor-pointer">
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                    <div className="flex flex-col items-center justify-center h-32 bg-white rounded-lg hover:bg-gray-50 transition-colors border-2 border-dashed border-green-300">
                                        <Upload className="w-8 h-8 text-green-600 mb-2" />
                                        <span className="text-sm font-medium text-green-700">Gallery</span>
                                    </div>
                                </label>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                                <p className="font-semibold mb-1">Tips:</p>
                                <ul className="list-disc list-inside space-y-1 opacity-80">
                                    <li>Ensure good lighting</li>
                                    <li>Focus on the affected area</li>
                                    <li>Keep the image steady</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === "analyzing" && (
                    <Card className="border-green-200 shadow-sm">
                        <CardContent className="pt-6 pb-8 text-center space-y-6">
                            <div className="relative w-32 h-32 mx-auto">
                                {selectedImage && <img src={selectedImage} alt="Analyzing" className="w-full h-full object-cover rounded-lg opacity-50" />}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-green-800">Analyzing Crop...</h2>
                                <p className="text-sm text-gray-500">Identifying potential diseases and remedies</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === "result" && result && (
                    <div className="space-y-4">
                        {/* Main Result Card */}
                        <Card className="border-green-200 shadow-md overflow-hidden">
                            <div className="relative h-48 bg-gray-100">
                                {selectedImage && <img src={selectedImage} alt="Result" className="w-full h-full object-cover" />}
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <h2 className="text-white text-xl font-bold">{result.disease}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={result.severity === 'High' ? "destructive" : "secondary"} className="text-xs">
                                            Severity: {result.severity}
                                        </Badge>
                                        <Badge variant="outline" className="text-white border-white/50 text-xs text-black bg-white/40">
                                            {result.confidence}% Confidence
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <p className="text-gray-700 leading-relaxed">{result.description}</p>
                            </CardContent>
                        </Card>

                        {/* Details Cards */}
                        {result.symptoms && result.symptoms.length > 0 && (
                            <Card className="border-orange-100 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Symptoms
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-1">
                                        {result.symptoms.map((s: string, i: number) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {result.remedies && result.remedies.length > 0 && (
                            <Card className="border-green-100 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold text-green-700 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Remedies
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {result.remedies.map((r: string, i: number) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                <span className="bg-green-100 text-green-700 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5">{i + 1}</span>
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        <Button onClick={resetDiagnosis} className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                            <RefreshCw className="w-4 h-4 mr-2" /> Analyze Another
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
