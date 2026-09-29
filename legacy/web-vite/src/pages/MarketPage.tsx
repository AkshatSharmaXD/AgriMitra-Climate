import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"

interface MarketPrice {
    district: string;
    market_name: string;
    modal_price: number;
    arrival_date: string;
}

export default function MarketPage() {
    const [isListening, setIsListening] = useState(false)
    const [query, setQuery] = useState("Wheat")
    const [selectedCrop, setSelectedCrop] = useState<string | null>(null)

    // Real Data State
    const [marketData, setMarketData] = useState<MarketPrice[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [marketSummary, setMarketSummary] = useState<string | null>(null)

    const fetchPrices = async (commodity: string) => {
        setLoading(true)
        setError(null)
        setMarketSummary(null)
        try {
            // Defaulting to Gujarat for now as per user request
            const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
            const response = await fetch(`${API_URL}/api/market?state=Gujarat&commodity=${commodity}`)
            const data = await response.json()

            if (response.ok) {
                setMarketData(data.prices)
                setMarketSummary(data.summary)
            } else {
                setError(data.error || "Failed to fetch prices")
                setMarketData([])
            }
        } catch (err) {
            setError("Network error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchPrices(query)
    }, [])

    const handleSearch = () => {
        if (query.trim()) {
            fetchPrices(query)
        }
    }

    const handleVoiceSearch = () => {
        setIsListening(true)
        setTimeout(() => {
            setIsListening(false)
            const voiceQuery = "Mustard" // Simulation
            setQuery(voiceQuery)
            fetchPrices(voiceQuery)
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
            {/* Header */}
            <div className="bg-green-600 text-white p-4 shadow-lg">
                <div className="flex items-center gap-3 max-w-md mx-auto">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold">💰 Market Prices</h1>
                        <p className="text-green-100 text-sm">Real-time (Agmarknet)</p>
                    </div>
                </div>
            </div>

            <div className="p-4 max-w-md mx-auto space-y-4">
                {/* Search Section */}
                <Card className="border-green-200">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Input
                                    placeholder="Search crop (e.g., Wheat, Mustard)..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="pr-10"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-0 top-0 h-full text-gray-400 hover:text-green-600"
                                    onClick={handleSearch}
                                >
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="text-center">
                            <Button
                                onClick={handleVoiceSearch}
                                className={`w-full ${isListening ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"} transition-colors`}
                                disabled={isListening}
                            >
                                {isListening ? (
                                    <>
                                        <div className="w-4 h-4 bg-white rounded-full animate-pulse mr-2"></div>
                                        Listening...
                                    </>
                                ) : (
                                    <>🎤 Voice Search</>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Market Summary */}
                {marketSummary && !loading && (
                    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                        <CardHeader>
                            <CardTitle className="text-amber-700 text-sm flex items-center gap-2">📊 Market Insight</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-800">{marketSummary}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Loading / Error / Data */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-green-700 flex items-center gap-2">
                        📈 Live Prices (Gujarat)
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    </h3>

                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    {!loading && !error && marketData.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No price data found. Try searching for "Rice", "Bajra", or "Wheat".</p>
                    )}

                    {!loading && marketData.map((price, index) => (
                        <Card
                            key={index}
                            className={`border-green-200 hover:shadow-md transition-shadow cursor-pointer ${selectedCrop === price.district ? "ring-2 ring-green-500 bg-green-50" : ""
                                }`}
                            onClick={() => setSelectedCrop(selectedCrop === price.district ? null : price.district)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-800">{price.district}</h4>
                                        </div>
                                        <div className="text-xs text-gray-500">{price.market_name}</div>
                                        <div className="text-xs text-gray-400 mt-1">{price.arrival_date}</div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-800">
                                            ₹{price.modal_price}
                                            <span className="text-sm font-normal text-gray-500">/qtl</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
