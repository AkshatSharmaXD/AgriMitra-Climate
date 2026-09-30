"use client";

import { Sprout, Users, Target, Leaf, Shield, BarChart3, Bot } from "lucide-react";

const FEATURES = [
  { icon: BarChart3, title: "Farm Risk Assessment", desc: "AI-computed risk scores combining weather, soil, vegetation, and crop data into one actionable metric." },
  { icon: Leaf, title: "AI Crop Disease Scanner", desc: "Photograph an affected leaf and get instant disease identification across 14 supported crops." },
  { icon: Bot, title: "AI Advisory Chatbot", desc: "Ask questions in Hindi, English, Gujarati, or Telugu and get personalized farming guidance." },
  { icon: Shield, title: "Government Schemes", desc: "Direct links to PM-KISAN, PMFBY, Soil Health Card, and PMKSY enrollment portals." },
  { icon: Target, title: "District Intelligence", desc: "Aggregated risk analytics across all registered farms, powered by Gemini AI interventions." },
  { icon: Users, title: "Multilingual Support", desc: "Full interface available in English, हिन्दी, ગુજરાતી, and తెలుగు for inclusive accessibility." },
];

export default function AboutPage() {
  return (
    <div className="font-sans">
      {/* Hero */}
      <div className="px-4 md:px-8 py-16 mx-auto max-w-[1400px] text-center">
        <div className="inline-flex items-center justify-center size-20 rounded-full bg-white/20 border-2 border-white/30 mb-6">
          <Sprout className="size-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">About AgriMitra</h1>
        <p className="text-white/80 text-lg max-w-3xl mx-auto leading-relaxed">
          AgriMitra is an AI-powered climate-smart farming platform designed to help Indian farmers 
          make data-driven decisions. We combine satellite imagery, weather forecasts, soil analysis, 
          and machine learning to deliver actionable risk scores and crop guidance.
        </p>
      </div>

      {/* Features Grid */}
      <div className="bg-[#e8f5e9] border-t-4 border-[#2e7d32]">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-12">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">Our Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100">
                <div className="size-12 rounded-xl bg-[#2e7d32] text-white flex items-center justify-center mb-4">
                  <f.icon className="size-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            To empower every Indian farmer with AI-driven insights that reduce crop losses, 
            optimize resource usage, and improve livelihoods. AgriMitra bridges the technology 
            gap between advanced climate science and grassroots farming practice.
          </p>
          <div className="grid grid-cols-3 gap-8 mt-10 max-w-2xl mx-auto">
            <div>
              <p className="text-4xl font-black text-[#2e7d32]">14+</p>
              <p className="text-sm text-gray-500 font-medium">Crops Supported</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#2e7d32]">33+</p>
              <p className="text-sm text-gray-500 font-medium">Districts Covered</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#2e7d32]">4</p>
              <p className="text-sm text-gray-500 font-medium">Languages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
