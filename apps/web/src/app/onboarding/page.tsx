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
    id: "scan",
    title: { en: "AI Crop Disease Scanner", hi: "एआई रोग स्कैनर", gu: "એઆઈ રોગ સ્કેનર", te: "AI వ్యాధి స్కానర్" },
    subtitle: { en: "Take a photo of a leaf to identify diseases and get remedies instantly.", hi: "रोगों की पहचान करने और तुरंत उपाय प्राप्त करने के लिए एक पत्ते की फोटो लें।", gu: "રોગો ઓળખવા અને તરત જ ઉપાય મેળવવા માટે પાંદડાનો ફોટો લો.", te: "వ్యాధులను గుర్తించి వెంటనే పరిష్కారాలను పొందడానికి ఆకు ఫోటో తీయండి." },
    color: "bg-[#9d4edd]",
    icon: Bug,
    href: "/scan",
    action: { en: "Explore Now", hi: "अभी खोजें", gu: "હવે શોધો", te: "ఇప్పుడు అన్వేషించండి" },
  },
  {
    id: "weather",
    title: { en: "Weather Information Network (WINDS)", hi: "मौसम सूचना नेटवर्क डेटा प्रणाली (WINDS)", gu: "હવામાન માહિતી નેટવર્ક ડેટા સિસ્ટમ (WINDS)", te: "వాతావరణ సమాచార నెట్‌వర్క్ (WINDS)" },
    subtitle: { en: "Live local forecast, rainfall, and severe weather alerts for your area.", hi: "आपके क्षेत्र के लिए लाइव स्थानीय पूर्वानुमान, वर्षा, और गंभीर मौसम अलर्ट।", gu: "તમારા વિસ્તાર માટે લાઇવ સ્થાનિક આગાહી, વરસાદ અને ગંભીર હવામાન ચેતવણીઓ.", te: "మీ ప్రాంతానికి లైవ్ స్థానిక వాతావరణ అంచనా, వర్షపాతం మరియు తీవ్ర వాతావరణ హెచ్చరికలు." },
    color: "bg-[#023e8a]",
    icon: CloudSun,
    href: "/weather",
    action: { en: "Explore Now", hi: "अभी खोजें", gu: "હવે શોધો", te: "ఇప్పుడు అన్వేషించండి" },
  },
  {
    id: "districts",
    title: { en: "District Intelligence", hi: "जिला खुफिया", gu: "જિલ્લા ઇન્ટેલિજન્સ", te: "జిల్లా ఇంటెలిజెన్స్" },
    subtitle: { en: "Real-time aggregated risk analysis and observations across all registered farms.", hi: "सभी पंजीकृत खेतों में वास्तविक समय एकत्रित जोखिम विश्लेषण और अवलोकन।", gu: "તમામ નોંધાયેલા ખેતરોમાં રીયલ-ટાઇમ એકીકૃત જોખમ વિશ્લેષણ અને અવલોકનો.", te: "అన్ని రిజిస్టర్డ్ పొలాల్లో రియల్ టైమ్ సమగ్ర రిస్క్ విశ్లేషణ మరియు పరిశీలనలు." },
    color: "bg-[#f4a261]",
    icon: Map,
    href: "/districts",
    action: { en: "Explore Now", hi: "अभी खोजें", gu: "હવે શોધો", te: "ఇప్పుడు అన్వేషించండి" },
  },
  {
    id: "schemes",
    title: { en: "Government Schemes Directory", hi: "सरकारी योजना निर्देशिका", gu: "સરકારી યોજનાઓ ડિરેક્ટરી", te: "ప్రభుత్వ పథకాల డైరెక్టరీ" },
    subtitle: { en: "Explore exclusive partner programs, subsidies, and crop insurance options.", hi: "विशेष भागीदार कार्यक्रम, सब्सिडी, और फसल बीमा विकल्पों का अन्वेषण करें।", gu: "વિશિષ્ટ ભાગીદાર કાર્યક્રમો, સબસિડી અને પાક વીમા વિકલ્પોનું અન્વેષણ કરો.", te: "ప్రత్యేక భాగస్వామి కార్యక్రమాలు, సబ్సిడీలు మరియు పంట బీమా ఎంపికలను అన్వేషించండి." },
    color: "bg-[#2e7d32]",
    icon: BookOpen,
    href: "/schemes",
    action: { en: "Explore Now", hi: "अभी खोजें", gu: "હવે શોધો", te: "ఇప్పుడు అన్వేషించండి" },
  },
  {
    id: "assistant",
    title: { en: "AI Assistant Chatbot", hi: "एआई सहायक चैटबॉट", gu: "એઆઈ સહાયક ચેટબોટ", te: "AI అసిస్టెంట్ చాట్‌బాట్" },
    subtitle: { en: "Ask questions and get multilingual support for your farming queries 24/7.", hi: "अपने खेती के सवालों के लिए प्रश्न पूछें और 24/7 बहुभाषी सहायता प्राप्त करें।", gu: "તમારા ખેતીના પ્રશ્નો પૂછો અને 24/7 બહુભાષી સપોર્ટ મેળવો.", te: "మీ వ్యవసాయ సందేహాల కోసం ప్రశ్నలు అడగండి మరియు 24/7 బహుభాషా మద్దతు పొందండి." },
    color: "bg-[#ff4d6d]",
    icon: Bot,
    href: "/assistant",
    action: { en: "Explore Now", hi: "अभी खोजें", gu: "હવે શોધો", te: "ఇప్పుడు అన్వేషించండి" },
  },
  {
    id: "assessment",
    title: { en: "Farm Risk Assessment", hi: "खेत जोखिम मूल्यांकन", gu: "ખેતર જોખમ મૂલ્યાંકન", te: "పొలం రిస్క్ అంచనా" },
    subtitle: { en: "Register your farm to receive satellite-based insights and risk scores.", hi: "उपग्रह आधारित अंतर्दृष्टि और जोखिम स्कोर प्राप्त करने के लिए अपना खेत पंजीकृत करें।", gu: "સેટેલાઇટ આધારિત આંતરદૃષ્ટિ અને જોખમ સ્કોર્સ મેળવવા માટે તમારા ખેતરની નોંધણી કરો.", te: "శాటిలైట్ ఆధారిత అంతర్దృష్టులు మరియు రిస్క్ స్కోర్‌లను పొందడానికి మీ పొలాన్ని నమోదు చేసుకోండి." },
    color: "bg-[#00b4d8]",
    icon: FileText,
    href: "/farm/new",
    action: { en: "Check Now", hi: "अभी जांचें", gu: "હવે તપાસો", te: "ఇప్పుడు చెక్ చేయండి" },
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
                <p>💬 WhatsApp ChatBot: <span className="text-yellow-300 font-bold">9978158483</span></p>
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
