import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Link } from "react-router-dom"
import { ArrowLeft, Search, ChevronDown, ExternalLink } from "lucide-react"
import schemesData from "@/lib/data/schemes.json"

interface Scheme {
    id: string;
    type: string;
    name: string;
    description: string;
    eligibility_criteria?: { [key: string]: any };
    link: string;
    category: string;
    benefit?: string;
}

export default function SchemesPage() {
    const [isListening, setIsListening] = useState(false)
    const [query, setQuery] = useState("")
    const [openSchemes, setOpenSchemes] = useState<string[]>([])
    const [userState] = useState("Gujarat") // Default state

    // Combine Schemes from JSON
    const nationalSchemes = schemesData.national_schemes.map((s, i) => ({ ...s, id: `nat-${i}`, type: 'National' }))

    // Safe access for state schemes
    const stateSpecificSchemes = schemesData.state_specific_schemes as { [key: string]: any[] };
    const stateSchemesData = stateSpecificSchemes[userState] || [];
    const stateSchemes = stateSchemesData.map((s: any, i: number) => ({ ...s, id: `state-${i}`, type: 'State' })) || []

    const allSchemes: Scheme[] = [...nationalSchemes, ...stateSchemes]

    const handleVoiceSearch = () => {
        setIsListening(true)
        setTimeout(() => {
            setIsListening(false)
            setQuery("Insurance")
        }, 2000)
    }

    const toggleScheme = (schemeId: string) => {
        setOpenSchemes((prev) => (prev.includes(schemeId) ? prev.filter((id) => id !== schemeId) : [...prev, schemeId]))
    }

    const filteredSchemes = allSchemes.filter(
        (scheme) =>
            scheme.name.toLowerCase().includes(query.toLowerCase()) ||
            scheme.description.toLowerCase().includes(query.toLowerCase()) ||
            (scheme.category && scheme.category.toLowerCase().includes(query.toLowerCase()))
    )

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
                        <h1 className="text-lg font-bold">🧾 Government Schemes</h1>
                        <p className="text-green-100 text-sm">Find subsidies and benefits</p>
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
                                    placeholder="Search schemes... (e.g., Insurance)"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="pr-10"
                                />
                                <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
                            </div>
                        </div>

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
                                <>🎤 Ask About Schemes</>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Quick Categories */}
                <Card className="border-green-200">
                    <CardHeader>
                        <CardTitle className="text-green-700 text-sm">🏷️ Popular Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {["Insurance", "Loans", "Income Support", "Seed Production"].map((category) => (
                            <Badge
                                key={category}
                                variant="outline"
                                className="cursor-pointer hover:bg-green-50 border-green-300"
                                onClick={() => setQuery(category)}
                            >
                                {category}
                            </Badge>
                        ))}
                    </CardContent>
                </Card>

                {/* Schemes List */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-green-700 flex items-center gap-2">
                        📋 Available Schemes ({userState})
                        <Badge variant="secondary" className="text-xs">
                            {filteredSchemes.length} found
                        </Badge>
                    </h3>

                    {filteredSchemes.map((scheme) => (
                        <Card key={scheme.id} className="border-green-200">
                            <Collapsible>
                                <CollapsibleTrigger className="w-full" onClick={() => toggleScheme(scheme.id)}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="text-left">
                                                <CardTitle className="text-sm font-semibold text-gray-800 mb-1">{scheme.name}</CardTitle>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {scheme.type}
                                                    </Badge>
                                                    {scheme.benefit && (
                                                        <Badge variant="outline" className="text-xs text-green-700">
                                                            {scheme.benefit}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronDown
                                                className={`w-5 h-5 text-gray-400 transition-transform ${openSchemes.includes(scheme.id) ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </div>
                                    </CardHeader>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <CardContent className="pt-0 space-y-4">
                                        <div className="text-sm text-gray-600">{scheme.description}</div>

                                        <div className="space-y-3">
                                            <div>
                                                <h4 className="font-semibold text-sm text-gray-800 mb-2">✅ Eligibility</h4>
                                                <div className="text-sm text-gray-600">
                                                    {Object.entries(scheme.eligibility_criteria || {}).map(([key, value]) => (
                                                        <div key={key} className="capitalize">
                                                            • {key.replace(/_/g, ' ')}: {String(value)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                onClick={() => window.open(scheme.link, "_blank")}
                                            >
                                                <ExternalLink className="w-4 h-4 mr-1" />
                                                Apply Online
                                            </Button>
                                            <Button size="sm" variant="outline" className="border-green-300 text-green-700 bg-transparent">
                                                💬 Get Help
                                            </Button>
                                        </div>
                                    </CardContent>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
