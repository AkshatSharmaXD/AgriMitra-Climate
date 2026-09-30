"use client";

import * as React from "react";
import { BookOpen, ExternalLink, ShieldCheck, IndianRupee, Sprout, Droplets, Leaf, Activity } from "lucide-react";

const SCHEMES = [
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana",
    shortName: "PMFBY",
    category: "Crop Insurance",
    desc: "Comprehensive insurance cover against failure of the crop helping in stabilising the income of the farmers.",
    highlight: "Ultra-low premium rates (1.5% for Rabi, 2% for Kharif crops).",
    icon: ShieldCheck,
    link: "https://pmfby.gov.in/",
    color: "bg-orange-500",
    darkColor: "bg-orange-600"
  },
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    shortName: "PM-KISAN",
    category: "Financial Support",
    desc: "Income support of ₹6,000 per year in three equal installments to all land-holding farmer families.",
    highlight: "100% Direct Benefit Transfer (DBT) directly into bank accounts.",
    icon: IndianRupee,
    link: "https://pmkisan.gov.in/",
    color: "bg-blue-600",
    darkColor: "bg-blue-700"
  },
  {
    id: "soil-health",
    name: "Soil Health Card Scheme",
    shortName: "SHC",
    category: "Soil & Nutrient",
    desc: "Provides farmers with the nutrient status of their soil and its recommendation on appropriate dosage of nutrients.",
    highlight: "Reduces input costs while improving crop yields sustainably.",
    icon: Sprout,
    link: "https://soilhealth.dac.gov.in/",
    color: "bg-green-600",
    darkColor: "bg-green-700"
  },
  {
    id: "pmksy",
    name: "PM Krishi Sinchayee Yojana",
    shortName: "PMKSY",
    category: "Water & Irrigation",
    desc: "Focuses on creating sources for assured irrigation, also creating protective irrigation by harnessing rain water at micro level.",
    highlight: "'Per Drop More Crop' initiative boosts water efficiency.",
    icon: Droplets,
    link: "https://pmksy.gov.in/",
    color: "bg-cyan-600",
    darkColor: "bg-cyan-700"
  },
  {
    id: "enam",
    name: "National Agriculture Market",
    shortName: "e-NAM",
    category: "Market & Trade",
    desc: "A pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market.",
    highlight: "Better price discovery and transparent auction process.",
    icon: Activity,
    link: "https://enam.gov.in/",
    color: "bg-purple-600",
    darkColor: "bg-purple-700"
  },
  {
    id: "pkvy",
    name: "Paramparagat Krishi Vikas Yojana",
    shortName: "PKVY",
    category: "Organic Farming",
    desc: "Promotes organic farming through the adoption of organic village by cluster approach and PGS certification.",
    highlight: "Financial assistance of ₹50,000 per hectare for 3 years.",
    icon: Leaf,
    link: "https://pgsindia-ncof.gov.in/pkvy/",
    color: "bg-emerald-500",
    darkColor: "bg-emerald-600"
  }
];

export default function SchemesPage() {
  return (
    <div className="font-sans min-h-screen bg-[#f1fcf1]">
      <div className="bg-[#1b3a1b] py-8 px-4 md:px-8 border-b-4 border-yellow-400">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            <BookOpen className="size-10 text-yellow-300" />
            Government Schemes & Subsidies
          </h1>
          <p className="text-white/80 mt-2 text-base max-w-3xl">Explore central and state government programs designed to provide financial security, improve yield, and secure your agricultural future.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SCHEMES.map((scheme) => (
            <div key={scheme.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-all hover:-translate-y-1">
              {/* Header block */}
              <div className={`${scheme.color} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
                  <scheme.icon className="size-32" />
                </div>
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wide mb-3 backdrop-blur-sm">
                    {scheme.category}
                  </span>
                  <h2 className="text-2xl font-black leading-tight drop-shadow-sm">{scheme.shortName}</h2>
                  <p className="font-medium text-white/90 text-sm mt-1">{scheme.name}</p>
                </div>
              </div>
              
              {/* Content block */}
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">{scheme.desc}</p>
                
                <div className="bg-green-50 border border-green-100 p-4 rounded-xl mb-6">
                  <p className="text-xs font-bold text-green-800 flex items-start gap-2">
                    <span className="text-green-600">✓</span> {scheme.highlight}
                  </p>
                </div>
                
                <a 
                  href={scheme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${scheme.darkColor} w-full text-center text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
                >
                  Apply / Check Eligibility <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
