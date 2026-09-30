"use client";

import Link from "next/link";
import * as React from "react";
import { 
  FileText, Bug, Map, Bot, CloudSun, BookOpen, ArrowRight,
  Sprout, ScanLine, BarChart3, Newspaper, ExternalLink, ChevronLeft, ChevronRight,
  Smartphone, Shield, Droplets, IndianRupee, Leaf, Pause, Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language";

/* ─── SERVICE CARDS (the 6-card row identical to PMFBY) ─── */
const SERVICE_CARDS = [
  {
    id: "assessment",
    title: { en: "Farm Risk Assessment", hi: "खेत जोखिम मूल्यांकन", gu: "ખેતર જોખમ મૂલ્યાંકન", te: "పొలం రిస్క్ అంచనా" },
    subtitle: { en: "Know your application status on every step", hi: "हर कदम पर अपनी स्थिति जानें", gu: "દરેક પગલે તમારી સ્થિતિ જાણો", te: "ప్రతి దశలో మీ స్థితి తెలుసుకోండి" },
    color: "bg-[#00b4d8]",
    icon: FileText,
    href: "/farm/new",
    action: { en: "Check Now", hi: "अभी जांचें", gu: "હવે તપાસો", te: "ఇప్పుడు చెక్ చేయండి" },
  },
  {
    id: "scan",
    title: { en: "AI Disease Scanner (KRPH)", hi: "एआई रोग स्कैनर (KRPH)", gu: "એઆઈ રોગ સ્કેનર (KRPH)", te: "AI వ్యాధి స్కానర్ (KRPH)" },
    subtitle: { en: "Tell us about your Grievances & Report loss of Crop.", hi: "अपनी शिकायतें बताएं और फसल हानि की रिपोर्ट करें।", gu: "તમારી ફરિયાદો જણાવો અને પાક નુકસાનની જાણ કરો.", te: "మీ ఫిర్యాదులు చెప్పండి & పంట నష్టాన్ని నివేదించండి." },
    color: "bg-[#9d4edd]",
    icon: Bug,
    href: "/scan",
    action: { en: "Explore Now", hi: "अभी खोजें", gu: "હવે શોધો", te: "ఇప్పుడు అన్వేషించండి" },
  },
  {
    id: "advisory",
    title: { en: "Learning Management System (LMS)", hi: "शिक्षण प्रबंधन प्रणाली (LMS)", gu: "શિક્ષણ વ્યવસ્થાપન સિસ્ટમ (LMS)", te: "లెర్నింగ్ మేనేజ్‌మెంట్ సిస్టమ్ (LMS)" },
    subtitle: { en: "Your Gateway to Smarter Farming & Insurance Learning.", hi: "स्मार्ट खेती और बीमा सीखने का प्रवेश द्वार।", gu: "સ્માર્ટ ફાર્મિંગ અને ઇન્શ્યોરન્સ શીખવાનો પ્રવેશદ્વાર.", te: "స్మార్ట్ ఫార్మింగ్ & ఇన్సూరెన్స్ లెర్నింగ్ గేట్‌వే." },
    color: "bg-[#e63946]",
    icon: BookOpen,
    href: "/advisory",
    action: { en: "Explore Now", hi: "अभी खोजें", gu: "હવે શોધો", te: "ఇప్పుడు అన్వేషించండి" },
  },
  {
    id: "yestech",
    title: { en: "YESTECH - Live crop observations & photographs", hi: "YESTECH - फसल की तस्वीरें और लाइव अवलोकन", gu: "YESTECH - લાઇવ પાક અવલોકન અને ફોટોગ્રાફ્સ", te: "YESTECH - లైవ్ పంట పరిశీలనలు & ఫోటోలు" },
    subtitle: { en: "Yield Estimation System based on Technology", hi: "प्रौद्योगिकी आधारित उपज अनुमान प्रणाली", gu: "ટેકનોલોજી આધારિત ઉપજ અંદાજ સિસ્ટમ", te: "టెక్నాలజీ ఆధారిత దిగుబడి అంచనా వ్యవస్థ" },
    color: "bg-[#ff4d6d]",
    icon: ScanLine,
    href: "/scan",
    action: { en: "Explore Now", hi: "अभी खोजें", gu: "હવે શોધો", te: "ఇప్పుడు అన్వేషించండి" },
  },
  {
    id: "weather",
    title: { en: "Weather Information Network Data System (WINDS)", hi: "मौसम सूचना नेटवर्क डेटा प्रणाली (WINDS)", gu: "હવામાન માહિતી નેટવર્ક ડેટા સિસ્ટમ (WINDS)", te: "వాతావరణ సమాచార నెట్‌వర్క్ డేటా సిస్టమ్ (WINDS)" },
    subtitle: { en: "Know your Area's Weather Updates", hi: "अपने क्षेत्र के मौसम अपडेट जानें", gu: "તમારા વિસ્તારના હવામાન અપડેટ્સ જાણો", te: "మీ ప్రాంత వాతావరణ అప్‌డేట్‌లు తెలుసుకోండి" },
    color: "bg-[#023e8a]",
    icon: CloudSun,
    href: "/weather",
    action: { en: "Explore Now", hi: "अभी खोजें", gu: "હવે શોધો", te: "ఇప్పుడు అన్వేషించండి" },
  },
  {
    id: "realtime",
    title: { en: "Collection of Real time Observations and Photographs of Crops", hi: "फसलों की वास्तविक समय अवलोकन और तस्वीरें", gu: "પાકના રીયલ ટાઇમ અવલોકન અને ફોટોગ્રાફ્સ", te: "పంటల రియల్ టైమ్ పరిశీలనలు & ఫోటోలు" },
    subtitle: { en: "Crop Health Monitoring & Crop Loss Assessment", hi: "फसल स्वास्थ्य निगरानी और फसल हानि मूल्यांकन", gu: "પાક સ્વાસ્થ્ય મોનિટરિંગ અને પાક નુકસાન મૂલ્યાંકન", te: "పంట ఆరోగ్య పర్యవేక్షణ & పంట నష్ట అంచనా" },
    color: "bg-[#f4a261]",
    icon: Leaf,
    href: "/districts",
    action: { en: "Explore Now", hi: "अभी खोजें", gu: "હવે શોધો", te: "ఇప్పుడు అన్వేషించండి" },
    solid: true,
  },
];

/* ─── SCROLLING TICKER ITEMS ─── */
const TICKER_ITEMS = [
  "📢 AgriMitra Climate v2.0 launched — AI-powered farm risk scoring now live!",
  "🌾 Kharif season 2026 crop advisory available for all registered farmers",
  "💧 PM Krishi Sinchayee Yojana — Apply for micro-irrigation subsidies",
  "🔬 New: AI Crop Disease Scanner detects 38 diseases across 14 crops",
  "📊 District-level analytics now cover 33 districts across Rajasthan",
];

/* ─── WHAT'S NEW ITEMS ─── */
const WHATS_NEW = [
  { text: "2026 Operational Guidelines of AgriMitra Climate Platform Released", href: "#", isNew: true },
  { text: "Integration of Sentinel-2 satellite data for real-time NDVI monitoring", href: "#", isNew: true },
  { text: "AI Crop Disease Scanner now supports Wheat, Rice, Tomato, Potato & more", href: "#", isNew: false },
  { text: "District-level intervention priorities powered by Gemini AI", href: "#", isNew: false },
  { text: "Multilingual support added: English, Hindi, Gujarati, Telugu", href: "#", isNew: false },
];

/* ─── QUICK LINKS FOR "Scan for Multiple Applications" SECTION ─── */
const QUICK_LINKS = [
  { icon: Smartphone, title: "Mobile App", desc: "Download AgriMitra app", href: "#" },
  { icon: Shield, title: "Crop Insurance", desc: "PMFBY enrollment", href: "https://pmfby.gov.in/" },
  { icon: Droplets, title: "Irrigation Subsidy", desc: "PMKSY application", href: "https://pmksy.gov.in/" },
  { icon: IndianRupee, title: "PM-KISAN", desc: "Income support status", href: "https://pmkisan.gov.in/" },
];

/* ─── FOOTER LINKS ─── */
const FOOTER_LINKS = [
  { label: "PM-KISAN", href: "https://pmkisan.gov.in/" },
  { label: "PMFBY", href: "https://pmfby.gov.in/" },
  { label: "Soil Health Card", href: "https://soilhealth.dac.gov.in/" },
  { label: "PMKSY", href: "https://pmksy.gov.in/" },
  { label: "eNAM", href: "https://enam.gov.in/" },
  { label: "Kisan Call Center", href: "https://mkisan.gov.in/" },
];

export default function OnboardingPage() {
  const { language } = useLanguage();
  const [cardPage, setCardPage] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const t = (obj: Record<string, string>) => obj[language] || obj.en;

  // Auto-rotate ticker
  const [tickerOffset, setTickerOffset] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setTickerOffset((p) => p + 1), 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-sans">
      {/* ═══ SCROLLING NEWS TICKER (like PMFBY orange/blue banner) ═══ */}
      <div className="bg-[#1b3a1b] text-yellow-300 py-2 overflow-hidden relative">
        <div 
          className="flex whitespace-nowrap animate-none"
          style={{ transform: `translateX(-${tickerOffset % 3000}px)` }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-block px-12 text-sm font-medium">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ SERVICE CARDS CAROUSEL (exact PMFBY layout) ═══ */}
      <div className="px-4 md:px-8 py-8 md:py-12 mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SERVICE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div 
                key={card.id} 
                className={cn(
                  "rounded-xl overflow-hidden flex flex-col h-full min-h-[280px]",
                  "shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300",
                  "hover:-translate-y-2 hover:shadow-[0_16px_40px_rgb(0,0,0,0.2)]",
                  card.solid ? card.color : "bg-white"
                )}
              >
                <div className="p-5 flex-1 flex flex-col items-center text-center">
                  {/* Circular icon — matches PMFBY exactly */}
                  <div className={cn(
                    "size-[72px] rounded-full flex items-center justify-center mb-4 shadow-sm",
                    card.solid 
                      ? "border-2 border-white/60 bg-white/20 text-white" 
                      : `${card.color} text-white`
                  )}>
                    <Icon className="size-9" strokeWidth={1.5} />
                  </div>
                  <h3 className={cn(
                    "font-bold text-[14px] leading-snug mb-3",
                    card.solid ? "text-white" : "text-gray-800"
                  )}>
                    {t(card.title)}
                  </h3>
                  <p className={cn(
                    "text-[12px] leading-relaxed",
                    card.solid ? "text-white/85" : "text-gray-500"
                  )}>
                    {t(card.subtitle)}
                  </p>
                </div>
                <div className="p-4 mt-auto">
                  <Link 
                    href={card.href}
                    className={cn(
                      "flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-[13px] font-bold transition-all",
                      card.solid 
                        ? "bg-white text-[#f4a261] hover:bg-gray-100 shadow-sm" 
                        : "bg-[#1b5e20] text-white hover:bg-[#144d18] shadow-sm"
                    )}
                  >
                    {t(card.action)}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ═══ "SCAN FOR MULTIPLE APPLICATIONS" + "WHAT'S NEW" SECTION ═══ */}
      <div className="bg-[#e8f5e9] border-t-4 border-[#2e7d32]">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Main CTA area (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                  <ScanLine className="inline size-7 text-[#2e7d32] mr-2 -mt-1" />
                  Access the Complete AgriMitra Suite
                </h2>
                <p className="text-gray-600 mt-2 text-sm md:text-base leading-relaxed max-w-2xl">
                  Access the complete suite of digital tools designed to simplify crop monitoring, 
                  AI-powered disease detection, weather forecasting, and farm risk management.
                </p>
              </div>

              {/* Quick link cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {QUICK_LINKS.map((link) => (
                  <a
                    key={link.title}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100 group"
                  >
                    <div className="size-10 rounded-lg bg-[#2e7d32] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <link.icon className="size-5" />
                    </div>
                    <p className="font-bold text-gray-800 text-sm">{link.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{link.desc}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Right: What's New sidebar (2 cols) — exact PMFBY style */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 h-full">
                <div className="bg-[#023e8a] text-white px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-lg">What's New?</h3>
                    <p className="text-blue-200 text-[11px]">Stay updated</p>
                  </div>
                  <Newspaper className="size-5 text-blue-200" />
                </div>
                <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
                  {WHATS_NEW.map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      className="flex items-start gap-3 px-5 py-3.5 hover:bg-blue-50 transition-colors group"
                    >
                      <ArrowRight className="size-4 text-[#023e8a] shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                      <span className="text-[13px] text-gray-700 font-medium leading-snug group-hover:text-[#023e8a]">
                        {item.isNew && (
                          <span className="inline-block bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded mr-1.5 align-middle">NEW</span>
                        )}
                        {item.text}
                      </span>
                    </a>
                  ))}
                </div>
                <div className="border-t border-gray-200 px-5 py-3 bg-gray-50">
                  <a href="#" className="text-[#023e8a] text-xs font-bold hover:underline flex items-center gap-1">
                    View all updates <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PARTNER SCHEMES ROW (like PMFBY partner logos) ═══ */}
      <div className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-8">
          <h3 className="text-center text-lg font-black text-gray-800 mb-6">
            Related Government Portals & Schemes
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-50 hover:bg-[#e8f5e9] border border-gray-200 hover:border-[#2e7d32] rounded-lg px-5 py-3 text-sm font-bold text-gray-700 hover:text-[#2e7d32] transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <ExternalLink className="size-3.5" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ FOOTER (matching PMFBY dark green footer) ═══ */}
      <footer className="bg-[#1b3a1b] text-white">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: About */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Sprout className="size-5" />
                </div>
                <div>
                  <h4 className="font-black text-lg">AgriMitra</h4>
                  <p className="text-white/60 text-[10px] tracking-widest uppercase">Climate-Smart Farming</p>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                AgriMitra is an AI-powered climate-smart farming assistant that helps Indian farmers make 
                data-driven decisions about their crops, soil, and weather.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-yellow-300 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { label: "Farm Assessment", href: "/farm/new" },
                  { label: "AI Disease Scanner", href: "/scan" },
                  { label: "Weather Forecast", href: "/weather" },
                  { label: "District Analytics", href: "/districts" },
                  { label: "AI Chatbot", href: "/assistant" },
                  { label: "Govt Schemes", href: "/schemes" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/70 text-sm hover:text-white transition-colors flex items-center gap-2">
                      <ArrowRight className="size-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h4 className="font-bold text-sm mb-4 text-yellow-300 uppercase tracking-wider">Contact & Support</h4>
              <div className="space-y-3 text-sm text-white/70">
                <p>📞 Krishi Helpline: <span className="text-yellow-300 font-bold">14447</span></p>
                <p>💬 WhatsApp ChatBot: <span className="text-yellow-300 font-bold">7065514447</span></p>
                <p>📧 support@agrimitra.in</p>
                <p>🌐 Powered by AI & Satellite Data</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
            <p>© 2026 AgriMitra Climate. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Disclaimer</a>
            </div>
            <p>Last Updated: September 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
