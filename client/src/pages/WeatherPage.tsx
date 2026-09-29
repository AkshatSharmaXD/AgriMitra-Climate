import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"
import { ArrowLeft, CloudRain, Sun, Wind, Droplets, MapPin, Loader2, Search } from "lucide-react"
import { API_BASE } from "../lib/api"


export default function WeatherPage() {
    const [loading, setLoading] = useState(false)
    const [weather, setWeather] = useState<any>(null)
    const [city, setCity] = useState("Ahmedabad")
    const [language, setLanguage] = useState<"en" | "gu">("en")

    const fetchWeather = async () => {
        if (!city.trim()) return;
        setLoading(true)
        try {
            // 1. Geocoding
            const geoRes = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
            );
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                alert("City not found. Please try again.");
                setLoading(false);
                return;
            }

            const { latitude, longitude, name, admin1, country } = geoData.results[0];
            // Update city name to match found location for better UX
            setCity(`${name}, ${admin1 || country || ""}`);

            // 2. Weather
            const weatherRes = await fetch(`${API_BASE}/api/weather?lat=${latitude}&lng=${longitude}`);
            const weatherData = await weatherRes.json();
            
            // Map our backend structure back to the component's expected structure
            setWeather({
                current: {
                    weather_code: weatherData.current.weatherCode || 0,
                    temperature_2m: weatherData.current.temperature,
                    wind_speed_10m: weatherData.current.windSpeed,
                    relative_humidity_2m: weatherData.current.humidity,
                    precipitation: weatherData.current.rainfall
                },
                daily: {
                    time: weatherData.forecast.map((d: any) => d.date),
                    weather_code: weatherData.forecast.map((d: any) => d.weatherCode || 0),
                    temperature_2m_max: weatherData.forecast.map((d: any) => d.tempMax),
                    temperature_2m_min: weatherData.forecast.map((d: any) => d.tempMin),
                    precipitation_sum: weatherData.forecast.map((d: any) => d.precipitation)
                },
                degraded: weatherData.degraded
            });
        } catch (e) {
            console.error(e);
            alert("Failed to fetch weather data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchWeather();
    }, [])

    const getWeatherIcon = (code: number) => {
        if (code === 0 || code === 1) return <Sun className="w-12 h-12 text-yellow-500" />;
        if (code > 50) return <CloudRain className="w-12 h-12 text-blue-500" />;
        return <Sun className="w-12 h-12 text-gray-400" />; // Default/Cloudy
    }

    const getWeatherDesc = (code: number) => {
        if (code === 0) return language === "en" ? "Clear Sky" : "સ્વચ્છ આકાશ";
        if (code > 0 && code < 4) return language === "en" ? "Partly Cloudy" : "શરતી વાદળછાયું";
        if (code >= 51) return language === "en" ? "Rainy" : "વરસાદી";
        return language === "en" ? "Cloudy" : "વાદળછાયું";
    }

    return (
        <div className="min-h-screen bg-green-50 p-4 font-sans">
            <div className="max-w-md mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/">
                            <Button variant="ghost" size="icon" className="hover:bg-green-100">
                                <ArrowLeft className="w-5 h-5 text-green-700" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold text-green-800">
                            {language === "en" ? "Live Weather" : "હવામાન"}
                        </h1>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLanguage(language === "en" ? "gu" : "en")}
                        className="bg-white text-green-700 border-green-200"
                    >
                        {language === "en" ? "ગુજરાતી" : "English"}
                    </Button>
                </div>

                {/* Search */}
                <div className="flex gap-2">
                    <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city (e.g., Surat)"
                        className="bg-white"
                    />
                    <Button onClick={fetchWeather} className="bg-green-600 hover:bg-green-700">
                        <Search className="w-4 h-4" />
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                ) : weather && (
                    <div className="space-y-4">
                        {/* Current Weather Card */}
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                            <CardContent className="p-6 text-center">
                                <div className="flex items-center justify-center gap-2 mb-4 opacity-90">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm font-medium">{city}</span>
                                </div>

                                <div className="mb-4">
                                    {getWeatherIcon(weather.current.weather_code)}
                                </div>

                                <div className="text-5xl font-bold mb-2">
                                    {weather.current.temperature_2m}°
                                </div>
                                <div className="text-lg font-medium opacity-90 mb-6">
                                    {getWeatherDesc(weather.current.weather_code)}
                                </div>

                                <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-4">
                                    <div>
                                        <div className="text-blue-100 text-xs mb-1">Wind</div>
                                        <div className="font-bold flex items-center justify-center gap-1">
                                            <Wind className="w-3 h-3" />
                                            {weather.current.wind_speed_10m}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-blue-100 text-xs mb-1">Humidity</div>
                                        <div className="font-bold flex items-center justify-center gap-1">
                                            <Droplets className="w-3 h-3" />
                                            {weather.current.relative_humidity_2m}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-blue-100 text-xs mb-1">Precip</div>
                                        <div className="font-bold flex items-center justify-center gap-1">
                                            <CloudRain className="w-3 h-3" />
                                            {weather.current.precipitation}mm
                                        </div>
                                    </div>
                                </div>
                                {weather.degraded && (
                                    <div className="mt-4 text-xs text-red-200 bg-red-900/30 p-1 rounded inline-block">
                                        Data might be inaccurate (Service Degraded)
                                    </div>
                                )}
                            </CardContent>

                        </Card>

                        {/* Forecast */}
                        <h3 className="font-semibold text-green-800">
                            {language === "en" ? "5-Day Forecast" : "૫ દિવસની આગાહી"}
                        </h3>

                        <div className="grid gap-2">
                            {weather.daily.time.slice(1, 6).map((time: string, i: number) => (
                                <Card key={time} className="border-green-100">
                                    <CardContent className="p-3 flex items-center justify-between">
                                        <div className="text-sm font-medium text-gray-600">
                                            {new Date(time).toLocaleDateString(language === 'en' ? 'en-US' : 'gu-IN', { weekday: 'long' })}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {getWeatherIcon(weather.daily.weather_code[i + 1])}
                                            <div className="text-right">
                                                <div className="font-bold text-gray-800">
                                                    {weather.daily.temperature_2m_max[i + 1]}° / {weather.daily.temperature_2m_min[i + 1]}°
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {getWeatherDesc(weather.daily.weather_code[i + 1])}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
