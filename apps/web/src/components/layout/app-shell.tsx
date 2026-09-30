"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { PhoneCall, Sprout, Menu, X } from "lucide-react";
import { Splash } from "@/components/layout/splash";
import { Chatbots } from "@/components/chatbots";
import { useLanguage, LANGUAGES } from "@/lib/language";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: { en: "Home", hi: "होम", gu: "હોમ", te: "హోమ్" } },
  { href: "/weather", label: { en: "Weather", hi: "मौसम", gu: "હવામાન", te: "వాతావరణం" } },
  { href: "/scan", label: { en: "Crop Scan", hi: "फसल स्कैन", gu: "પાક સ્કેન", te: "పంట స్కాన్" } },
  { href: "/districts", label: { en: "Districts", hi: "जिले", gu: "જિલ્લા", te: "జిల్లాలు" } },
  { href: "/assistant", label: { en: "AI Assistant", hi: "एआई सहायक", gu: "એઆઈ સહાયક", te: "AI అసిస్టెంట్" } },
  { href: "/schemes", label: { en: "Schemes", hi: "योजनाएं", gu: "યોજનાઓ", te: "పథకాలు" } },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const [showLogin, setShowLogin] = React.useState(false);
  const [showRegister, setShowRegister] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userName, setUserName] = React.useState("");

  // Check login state from localStorage
  React.useEffect(() => {
    try {
      const user = window.localStorage.getItem("agrimitra.user");
      if (user) {
        const parsed = JSON.parse(user);
        setIsLoggedIn(true);
        setUserName(parsed.name || "Farmer");
      }
    } catch { /* ignore */ }
  }, []);

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string) || "Farmer";
    const phone = (form.get("phone") as string) || "";
    localStorage.setItem("agrimitra.user", JSON.stringify({ name, phone }));
    setIsLoggedIn(true);
    setUserName(name);
    setShowLogin(false);
  }

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string) || "Farmer";
    const phone = (form.get("phone") as string) || "";
    localStorage.setItem("agrimitra.user", JSON.stringify({ name, phone }));
    setIsLoggedIn(true);
    setUserName(name);
    setShowRegister(false);
  }

  function handleLogout() {
    localStorage.removeItem("agrimitra.user");
    setIsLoggedIn(false);
    setUserName("");
  }

  const t = (labels: Record<string, string>) => labels[language] || labels.en;

  return (
    <div className="min-h-dvh flex flex-col font-sans">
      <Splash />

      {/* TIER 1: Top Thin Bar */}
      <div className="bg-[#4ca65a] text-white py-1.5 px-4 md:px-8 text-xs font-medium flex flex-wrap justify-between items-center z-50 relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="bg-green-600 rounded-full p-0.5"><PhoneCall className="size-3" /></span>
            WhatsApp ChatBot - <span className="text-yellow-300 font-bold">7065514447</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 border-l border-white/30 pl-4">
            <span className="bg-white/20 rounded-full p-0.5"><PhoneCall className="size-3" /></span>
            Krishi Helpline - <span className="text-yellow-300 font-bold">14447</span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4 border-l border-white/30 pl-4">
          <button onClick={() => document.getElementById("main")?.scrollIntoView({ behavior: "smooth" })} className="hover:underline">Skip to Main Content</button>
          <div className="flex items-center gap-2 border-l border-white/30 pl-4">
            <span>Text Size:</span>
            <button className="hover:text-yellow-300" onClick={() => document.documentElement.style.fontSize = "14px"}>A-</button>
            <button className="hover:text-yellow-300" onClick={() => document.documentElement.style.fontSize = "16px"}>A</button>
            <button className="hover:text-yellow-300" onClick={() => document.documentElement.style.fontSize = "18px"}>A+</button>
          </div>
          <div className="border-l border-white/30 pl-4">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent border-none outline-none text-white cursor-pointer hover:text-yellow-300"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value} className="text-black">{l.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TIER 2: White Header with AgriMitra Branding */}
      <div className="bg-white px-4 md:px-8 py-3 flex justify-between items-center z-50 relative shadow-sm">
        <Link href="/" className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-600 shadow-sm">
              <Sprout className="size-7 text-green-600" />
            </div>
            <div className="flex flex-col text-xl font-black text-gray-900 leading-tight">
              <span className="tracking-tight text-green-700">AgriMitra</span>
              <span className="font-bold text-gray-500 text-[11px] tracking-widest uppercase">Climate-Smart Farming</span>
            </div>
          </div>
        </Link>
        <div className="hidden md:flex flex-col text-sm font-bold text-gray-800 leading-tight border-l border-gray-300 pl-4">
          <span>Empowering Farmers with AI</span>
          <span className="font-normal text-gray-600 text-xs">Next-Gen Agricultural Solutions</span>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn && (
            <div className="flex items-center gap-3 border-l border-gray-300 pl-4">
              <div className="size-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-green-700">{userName}</span>
                <span className="text-[10px] text-gray-500 tracking-widest uppercase">Logged In</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TIER 3: Dark Green Nav Bar */}
      <nav className="bg-[#2e7d32] text-white z-40 relative shadow-md">
        <div className="mx-auto max-w-screen-2xl flex items-center justify-between px-4 md:px-8">
          <ul className="hidden lg:flex items-center text-sm font-medium">
            {TABS.map(({ href, label }) => {
              const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link 
                    href={href} 
                    className={cn(
                      "block py-3 px-4 hover:bg-white/10 transition-colors border-r border-white/10",
                      isActive && "bg-white/10 border-b-2 border-yellow-400"
                    )}
                  >
                    {t(label)}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* Mobile menu toggle */}
          <button 
            className="lg:hidden py-3 font-bold flex items-center gap-2" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            Menu
          </button>

          <div className="flex items-center">
            {isLoggedIn ? (
              <>
                <Link href="/" className="py-3 px-4 hover:bg-white/10 transition-colors border-l border-white/10 text-sm font-medium">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="py-3 px-4 hover:bg-white/10 transition-colors border-l border-white/10 text-sm font-medium">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setShowLogin(true)} className="py-3 px-6 hover:bg-white/10 transition-colors border-l border-white/10 text-sm font-medium">
                  Sign In
                </button>
                <button onClick={() => setShowRegister(true)} className="py-3 px-6 bg-[#fbc02d] text-black hover:bg-yellow-500 transition-colors text-sm font-bold shadow-inner">
                  Register
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#1b5e20] border-t border-white/10 px-4 pb-4">
            <ul className="flex flex-col text-sm font-medium">
              {TABS.map(({ href, label }) => (
                <li key={href}>
                  <Link 
                    href={href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 px-4 hover:bg-white/10 transition-colors border-b border-white/10"
                  >
                    {t(label)}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Mobile language selector */}
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="font-bold text-yellow-300">Language:</span>
              {LANGUAGES.map((l) => (
                <button 
                  key={l.value}
                  onClick={() => setLanguage(l.value)}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-bold transition-colors",
                    language === l.value ? "bg-yellow-400 text-black" : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  {l.short}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main id="main" className="w-full transition-colors duration-500 flex-1 flex flex-col bg-[#56b567] relative">
        <div className="absolute top-20 left-0 opacity-[0.07] pointer-events-none overflow-hidden">
          <Sprout className="size-96 -ml-32 text-white" />
        </div>
        <div className="absolute top-20 right-0 opacity-[0.07] pointer-events-none overflow-hidden">
          <Sprout className="size-96 -mr-32 text-white" />
        </div>
        
        <div className="w-full h-full flex-1 flex flex-col relative z-10">
          {children}
        </div>
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setShowLogin(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#2e7d32] text-white p-6">
              <h2 className="text-xl font-black">Sign In to AgriMitra</h2>
              <p className="text-white/80 text-sm mt-1">Access your farm dashboard</p>
            </div>
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
                <input name="name" required placeholder="Ravi Kumar" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                <input name="phone" required placeholder="9876543210" type="tel" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition-colors" />
              </div>
              <button type="submit" className="w-full bg-[#2e7d32] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#1b5e20] transition-colors shadow-md">
                Sign In
              </button>
              <p className="text-center text-xs text-gray-500">Don't have an account? <button type="button" onClick={() => { setShowLogin(false); setShowRegister(true); }} className="text-green-600 font-bold hover:underline">Register</button></p>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={() => setShowRegister(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#fbc02d] text-black p-6">
              <h2 className="text-xl font-black">Register on AgriMitra</h2>
              <p className="text-black/70 text-sm mt-1">Create your farmer profile</p>
            </div>
            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input name="name" required placeholder="Ravi Kumar" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                <input name="phone" required placeholder="9876543210" type="tel" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">State</label>
                <input name="state" placeholder="Rajasthan" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Preferred Language</label>
                <select name="language" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none transition-colors">
                  {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-[#fbc02d] text-black py-3 rounded-xl font-bold text-lg hover:bg-yellow-500 transition-colors shadow-md">
                Create Account
              </button>
              <p className="text-center text-xs text-gray-500">Already registered? <button type="button" onClick={() => { setShowRegister(false); setShowLogin(true); }} className="text-green-600 font-bold hover:underline">Sign In</button></p>
            </form>
          </div>
        </div>
      )}

      <Chatbots />
    </div>
  );
}
