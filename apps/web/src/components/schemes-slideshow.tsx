"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  IndianRupee,
  Droplets,
  Sprout,
  ExternalLink,
  Megaphone
} from "lucide-react";

interface SchemeSlide {
  id: string;
  name: string;
  shortName: string;
  category: string;
  benefit: string;
  highlight: string;
  gradient: string;
  icon: React.ElementType;
  link: string;
}

const SCHEME_SLIDES: SchemeSlide[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN Samman Nidhi",
    shortName: "PM-KISAN",
    category: "Financial Support",
    benefit: "₹6,000 / year income support directly to farmer bank accounts.",
    highlight: "100% Direct Benefit Transfer (DBT) in 3 equal installments.",
    gradient: "from-blue-600 via-indigo-600 to-purple-700",
    icon: IndianRupee,
    link: "https://pmkisan.gov.in/",
  },
  {
    id: "pmfby",
    name: "PM Fasal Bima Yojana",
    shortName: "PMFBY",
    category: "Crop Insurance",
    benefit: "Comprehensive insurance against weather, drought, & pest risks.",
    highlight: "Ultra-low premium rates (1.5% for Rabi, 2% for Kharif crops).",
    gradient: "from-amber-500 via-orange-600 to-red-600",
    icon: ShieldCheck,
    link: "https://pmfby.gov.in/",
  },
  {
    id: "soil-health",
    name: "Soil Health Card Scheme",
    shortName: "Soil Health Card",
    category: "Soil & Nutrient Advice",
    benefit: "Field-specific nutrient status & targeted fertilizer recommendations.",
    highlight: "Reduces input costs while improving crop yields sustainably.",
    gradient: "from-lime-500 via-emerald-600 to-teal-700",
    icon: Sprout,
    link: "https://soilhealth.dac.gov.in/",
  },
  {
    id: "pmksy",
    name: "PM Krishi Sinchayee Yojana",
    shortName: "PMKSY",
    category: "Water & Irrigation",
    benefit: "Subsidies for micro-irrigation, drip systems, & rainwater harvesting.",
    highlight: "'Per Drop More Crop' initiative boosts water efficiency by 50%.",
    gradient: "from-cyan-500 via-blue-600 to-indigo-700",
    icon: Droplets,
    link: "https://pmksy.gov.in/",
  },
];

export function SchemesSlideshow() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SCHEME_SLIDES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const activeSlide = SCHEME_SLIDES[currentIndex] || SCHEME_SLIDES[0];
  const IconComponent = activeSlide.icon;

  return (
    <div
      className="relative w-full max-w-lg mx-auto group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative Glow */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent via-emerald-400 to-accent opacity-25 blur-lg transition duration-1000 group-hover:opacity-50 group-hover:duration-200"></div>
      
      <div className="relative overflow-hidden rounded-2xl border-2 border-accent/20 bg-white dark:bg-slate-900 shadow-2xl transition-all duration-300">
        {/* AD BADGE & HEADER */}
        <div className={`relative bg-gradient-to-br ${activeSlide.gradient} p-5 text-white transition-all duration-500`}>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded bg-yellow-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-black shadow-sm">
              <Megaphone className="size-3" />
              Sponsored Ad
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
              {currentIndex + 1} / {SCHEME_SLIDES.length}
            </span>
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner ring-1 ring-white/50">
              <IconComponent className="size-7 text-white drop-shadow-md" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-300 drop-shadow-sm">
                {activeSlide.category}
              </span>
              <h3 className="text-xl font-extrabold leading-tight tracking-tight text-white mt-1 drop-shadow-sm">
                {activeSlide.name}
              </h3>
            </div>
          </div>
        </div>

        {/* AD CONTENT */}
        <div className="p-5 space-y-4 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
              {activeSlide.benefit}
            </p>
          </div>

          <div className="rounded-xl bg-green-50 dark:bg-green-950/30 p-3 border border-green-200 dark:border-green-900/50 shadow-sm">
            <p className="text-xs font-bold text-green-800 dark:text-green-300 leading-normal flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              {activeSlide.highlight}
            </p>
          </div>

          {/* AD CTA */}
          <div className="pt-2">
            <a
              href={activeSlide.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-accent-hover hover:shadow-lg active:scale-[0.98]"
            >
              Check Eligibility Now
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Indicators */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {SCHEME_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-8 bg-accent"
                : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
