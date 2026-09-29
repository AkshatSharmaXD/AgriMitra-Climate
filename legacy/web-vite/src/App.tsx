import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Settings } from "lucide-react"

// Types
type Language = "en" | "gu" | "hi";

const text = {
  en: {
    title: "AgriMitra",
    subtitle: "Your AI Farming Assistant",
    cropDiagnosis: "Diagnose Crop Diseases",
    cropDesc: "Take a photo to identify plant diseases",
    marketPrices: "Check Market Prices",
    marketDesc: "Get real-time crop prices",
    govSchemes: "Government Schemes",
    schemesDesc: "Find subsidies and benefits",
    voiceAssistant: "Voice Assistant",
    voiceDesc: "Ask me anything about farming",
    offline: "Offline Mode",
    online: "Online",
  },
  gu: {
    title: "ફસલ કેર",
    subtitle: "તમારો AI ખેડૂત મિત્ર",
    cropDiagnosis: "પાક રોગ નિદાન",
    cropDesc: "છોડના રોગો ઓળખવા માટે ફોટો લો",
    marketPrices: "બજાર ભાવ તપાસો",
    marketDesc: "પાકના રીયલ-ટાઇમ ભાવ મેળવો",
    govSchemes: "સરકારી યોજનાઓ",
    schemesDesc: "સબસિડી અને લાભો શોધો",
    voiceAssistant: "વોઇસ આસિસ્ટન્ટ",
    voiceDesc: "ખેતી વિશે કંઈ પણ પૂછો",
    offline: "ઓફલાઇન મોડ",
    online: "ઓનલાઇન",
  },
  hi: {
    title: "फसल केयर",
    subtitle: "आपका एआई खेती सहायक",
    cropDiagnosis: "फसल रोग निदान",
    cropDesc: "पौधों के रोगों की पहचान के लिए फोटो लें",
    marketPrices: "बाजार भाव देखें",
    marketDesc: "फसलों के रियल-टाइम भाव प्राप्त करें",
    govSchemes: "सरकारी योजनाएं",
    schemesDesc: "सब्सिडी और लाभ खोजें",
    voiceAssistant: "वॉयस असिस्टेंट",
    voiceDesc: "खेती के बारे में कुछ भी पूछें",
    offline: "ऑफलाइन मोड",
    online: "ऑनलाइन",
  }
}

function HomePage() {
  const [language, setLanguage] = useState<Language>("en")

  const toggleLanguage = () => {
    setLanguage(prev => {
      if (prev === "en") return "hi";
      if (prev === "hi") return "gu";
      return "en";
    })
  }

  const getLangLabel = () => {
    if (language === "en") return "हिंदी";
    if (language === "hi") return "ગુજરાતી";
    return "English";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3 w-3/4">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden border border-white">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover scale-105" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-bold leading-none mb-1">{text[language].title}</h1>
              <p className="text-green-100 text-xs leading-none">{text[language].subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-white hover:bg-green-700 font-bold border border-white/20"
            >
              {getLangLabel()}
            </Button>
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="text-white hover:bg-green-700">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-md mx-auto space-y-4 pb-20">
        {/* Top Quick Actions Row */}
        <div className="grid grid-cols-4 gap-2">
          {/* Weather */}
          <Link to="/weather" className="flex flex-col items-center gap-1 group">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-blue-100 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform group-hover:shadow-md">
              🌦️
            </div>
            <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">
              {language === "en" ? "Weather" : (language === "hi" ? "मौसम" : "હવામાન")}
            </span>
          </Link>
          {/* Store */}
          <Link to="/shop" className="flex flex-col items-center gap-1 group">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform group-hover:shadow-md">
              🛒
            </div>
            <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">
              {language === "en" ? "Store" : (language === "hi" ? "स्टोर" : "સ્ટોર")}
            </span>
          </Link>
          {/* Drone */}
          <div className="flex flex-col items-center gap-1 group opacity-80 cursor-not-allowed grayscale">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-blue-100 flex items-center justify-center text-2xl relative">
              🚁
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] font-bold px-1 rounded-sm">SOON</div>
            </div>
            <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">
              {language === "en" ? "Drone" : (language === "hi" ? "ड्रोन" : "ડ્રોન")}
            </span>
          </div>
          {/* Pro */}
          <Link to="/subscription" className="flex flex-col items-center gap-1 group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-sm border border-purple-200 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform group-hover:shadow-md relative">
              👑
            </div>
            <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">
              {language === "en" ? "Pro" : (language === "hi" ? "प्रो" : "પ્રો")}
            </span>
          </Link>
          {/* Farm Profile Entry */}
          <Link to="/farm-profile" className="flex flex-col items-center gap-1 group">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-green-200 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform group-hover:shadow-md">
              🌱
            </div>
            <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">
              {language === "en" ? "My Farm" : (language === "hi" ? "मेरा खेत" : "મારું ખેતર")}
            </span>
          </Link>
        </div>

        {/* HERO: Crop Diagnosis */}
        <Card className="bg-gradient-to-r from-green-600 to-emerald-700 text-white border-0 shadow-lg overflow-hidden relative">
          {/* Decorative Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full -ml-12 -mb-12 blur-xl" />

          <CardContent className="p-6 text-center relative z-10">
            <div className="mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/30 backdrop-blur-sm">
                <span className="text-4xl">📷</span>
              </div>
              <h2 className="text-xl font-bold mb-1">{text[language].cropDiagnosis}</h2>
              <p className="text-green-100 text-sm mb-4 opacity-90">{text[language].cropDesc}</p>
            </div>
            <Link to="/diagnosis">
              <Button className="bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-6 rounded-full shadow-lg hover:scale-105 transition-transform w-full text-md">
                {language === "en" ? "Scan Now" : (language === "hi" ? "अभी स्कैन करें" : "હવે સ્કેન કરો")} 📸
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Secondary Tools Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Market Prices */}
          <Link to="/market" className="block col-span-1">
            <Card className="hover:shadow-lg transition-shadow border-green-200 hover:border-green-300 h-full">
              <CardHeader className="p-3">
                <CardTitle className="flex flex-col items-center text-center gap-2 text-green-700">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">💰</div>
                  <div>
                    <div className="font-semibold text-xs leading-tight whitespace-pre-line">{language === "en" ? "Market\nPrices" : (language === "hi" ? "बाजार\nभाव" : "બજાર\nભાવ")}</div>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>

          {/* Schemes */}
          <Link to="/schemes" className="block col-span-1">
            <Card className="hover:shadow-lg transition-shadow border-green-200 hover:border-green-300 h-full">
              <CardHeader className="p-3">
                <CardTitle className="flex flex-col items-center text-center gap-2 text-green-700">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl">🧾</div>
                  <div>
                    <div className="font-semibold text-xs leading-tight">{language === "en" ? "Schemes" : (language === "hi" ? "योजनाएं" : "યોજનાઓ")}</div>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>

          {/* District Intelligence */}
          <Link to="/district" className="block col-span-1">
            <Card className="hover:shadow-lg transition-shadow border-green-200 hover:border-green-300 h-full">
              <CardHeader className="p-3">
                <CardTitle className="flex flex-col items-center text-center gap-2 text-green-700">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">📊</div>
                  <div>
                    <div className="font-semibold text-xs leading-tight">{language === "en" ? "District" : (language === "hi" ? "जिला" : "જિલ્લો")}</div>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Top Agri News */}
        <div className="mt-6 mb-2">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            📰 {language === "en" ? "Top Agri News" : (language === "hi" ? "शीर्ष कृषि समाचार" : "ટોચના કૃષિ સમાચાર")}
          </h3>
          <div className="space-y-3">
            {[
              {
                id: 1,
                title: language === "en" ? "Government announces new subsidy for solar pumps under PM-KUSUM" : (language === "hi" ? "सरकार ने पीएम-कुसुम के तहत सोलर पंपों के लिए नई सब्सिडी की घोषणा की" : "સરકારે PM-KUSUM અંતર્ગત સોલાર પંપ માટે નવી સબસિડીની જાહેરાત કરી"),
                source: "AgriNews Today",
                time: "2 hours ago",
                img: "☀️",
                color: "bg-orange-50"
              },
              {
                id: 2,
                title: language === "en" ? "Monsoon expected to arrive early this year in central farming regions" : (language === "hi" ? "मध्य कृषि क्षेत्रों में इस साल मानसून जल्दी आने की उम्मीद" : "આ વર્ષે મધ્ય ખેતી વિસ્તારોમાં ચોમાસું વહેલું આવવાની સંભાવના છે"),
                source: "Weather Dept",
                time: "5 hours ago",
                img: "🌧️",
                color: "bg-blue-50"
              },
              {
                id: 3,
                title: language === "en" ? "Wheat prices hitting record high in major mandis ahead of harvest season" : (language === "hi" ? "कटाई के मौसम से पहले प्रमुख मंडियों में गेहूं की कीमतें रिकॉर्ड ऊंचाई पर" : "લણણીની સિઝન પહેલા મોટી મંડીઓમાં ઘઉંના ભાવ રેકોર્ડ ઉંચાઈએ પહોંચ્યા"),
                source: "Market Watch",
                time: "1 day ago",
                img: "🌾",
                color: "bg-yellow-50"
              }
            ].map(news => (
              <Card key={news.id} className="border border-green-100 hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-3 flex gap-4 items-center">
                  <div className={`w-14 h-14 ${news.color} rounded-xl flex items-center justify-center text-3xl flex-shrink-0`}>
                    {news.img}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug">{news.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500 font-medium">
                      <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-sm">{news.source}</span>
                      <span>•</span>
                      <span>{news.time}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Floating Voice Assistant Button (FAB) */}
        <Link to="/voice">
          <div className="fixed bottom-6 right-6 z-50 animate-bounce-slow">
            <Button className="w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 shadow-xl shadow-green-300 border-4 border-white flex items-center justify-center hover:scale-110 transition-transform">
              <Mic className="w-8 h-8 text-white" />
            </Button>
            {/* Tooltip/Label */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
              Voice Assistant
            </div>
          </div>
        </Link>

      </div>
    </div>
  )
}

import FarmProfilePage from "./pages/FarmProfilePage";
import FarmDashboardPage from "./pages/FarmDashboardPage";
import CropSuitabilityPage from "./pages/CropSuitabilityPage";
import AdvisoryPage from "./pages/AdvisoryPage";
import DistrictDashboardPage from "./pages/DistrictDashboardPage";
import DiagnosisPage from "./pages/DiagnosisPage";
import MarketPage from "./pages/MarketPage";
import SchemesPage from "./pages/SchemesPage";
import WeatherPage from "./pages/WeatherPage";
import ForumPage from "./pages/ForumPage";

import SettingsPage from "./pages/SettingsPage";
import VoicePage from "./pages/VoicePage";

import SubscriptionPage from "./pages/SubscriptionPage";
import ShopPage from "./pages/ShopPage";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center p-8">
        <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
          <div className="w-32 h-32 mb-6 rounded-full bg-white shadow-xl flex items-center justify-center p-4 border-4 border-green-500 overflow-hidden relative">
            <img src="/logo.jpg" alt="AgriMitra Logo" className="w-full h-full object-contain relative z-10" />
            <div className="absolute inset-0 bg-green-500/20 animate-ping rounded-full z-0"></div>
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-500 tracking-tight drop-shadow-sm mb-2">AgriMitra</h1>
          <p className="text-green-700 font-medium">Your AI Farming Assistant</p>
        </div>
        <div className="pb-8 pt-4 flex flex-col items-center gap-1 opacity-80 animate-bounce">
          <span className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">Made in India</span>
          <span className="text-2xl">🇮🇳</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen pb-4 relative animate-in fade-in duration-700">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/farm-profile" element={<FarmProfilePage />} />
          <Route path="/farm-dashboard/:id" element={<FarmDashboardPage />} />
          <Route path="/crop-suitability/:id" element={<CropSuitabilityPage />} />
          <Route path="/advisory/:id" element={<AdvisoryPage />} />
          <Route path="/district" element={<DistrictDashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/voice" element={<VoicePage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/diagnosis" element={<DiagnosisPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/shop" element={<ShopPage />} />
        </Routes>

        {/* Global Footer */}
        <div className="text-center p-2 text-[10px] text-green-600 opacity-60 mt-4 font-medium">
          Developed by DeepPro
        </div>
      </div>
    </Router>
  )
}
