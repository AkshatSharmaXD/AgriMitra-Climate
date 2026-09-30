"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  IndianRupee,
  Droplets,
  Sprout,
  Sparkles,
  ExternalLink,
  Award
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
    gradient: "from-emerald-600 via-green-600 to-teal-700",
    icon: IndianRupee,
    link: "/schemes",
  },
  {
    id: "pmfby",
    name: "PM Fasal Bima Yojana",
    shortName: "PMFBY",
    category: "Crop Insurance",
    benefit: "Comprehensive insurance against weather, drought, & pest risks.",
    highlight: "Ultra-low premium rates (1.5% for Rabi, 2% for Kharif crops).",
    gradient: "from-amber-600 via-orange-600 to-amber-700",
    icon: ShieldCheck,
    link: "/schemes",
  },
  {
    id: "soil-health",
    name: "Soil Health Card Scheme",
    shortName: "Soil Health Card",
    category: "Soil & Nutrient Advice",
    benefit: "Field-specific nutrient status & targeted fertilizer recommendations.",
    highlight: "Reduces input costs while improving crop yields sustainably.",
    gradient: "from-lime-600 via-emerald-600 to-green-700",
    icon: Sprout,
    link: "/schemes",
  },
  {
    id: "pmksy",
    name: "PM Krishi Sinchayee Yojana",
    shortName: "PMKSY",
    category: "Water & Irrigation",
    benefit: "Subsidies for micro-irrigation, drip systems, & rainwater harvesting.",
    highlight: "'Per Drop More Crop' initiative boosts water efficiency by 50%.",
    gradient: "from-cyan-600 via-blue-600 to-teal-700",
    icon: Droplets,
    link: "/schemes",
  },
  {
    id: "nmsa",
    name: "Sustainable Agriculture Mission",
    shortName: "NMSA Climate",
    category: "Climate Resilience",
    benefit: "Promotes climate-resilient farming, organic inputs, & soil conservation.",
    highlight: "Adaptation strategies tailored for small and marginal landholdings.",
    gradient: "from-emerald-700 via-teal-700 to-cyan-800",
    icon: Sparkles,
    link: "/schemes",
  },
];

export function SchemesSlideshow() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  // Auto-play slideshow every 4 seconds unless paused
  React.useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % SCHEME_SLIDES.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SCHEME_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SCHEME_SLIDES.length) % SCHEME_SLIDES.length);
  };

  const activeSlide = SCHEME_SLIDES[currentIndex];
  const IconComponent = activeSlide.icon;

  return (
    <div
      className="relative w-full max-w-lg mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Outer Card Wrapper */}
      <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-raised shadow-xl transition-all duration-300 hover:shadow-2xl">
        {/* Slide Header Banner */}
        <div className={`relative bg-gradient-to-r ${activeSlide.gradient} p-6 text-white transition-all duration-500`}>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Award className="size-3.5" />
              Government Scheme
            </span>
            <span className="text-xs font-medium text-white/80">
              {currentIndex + 1} of {SCHEME_SLIDES.length}
            </span>
          </div>

          <div className="mt-4 flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md ring-1 ring-white/30">
              <IconComponent className="size-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                {activeSlide.category}
              </span>
              <h3 className="text-xl font-bold leading-snug tracking-tight text-white mt-0.5">
                {activeSlide.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Slide Content Details */}
        <div className="p-6 space-y-4 bg-surface">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-content-tertiary">
              Key Benefit
            </h4>
            <p className="mt-1 text-sm font-medium text-content leading-relaxed">
              {activeSlide.benefit}
            </p>
          </div>

          <div className="rounded-lg bg-surface-sunken p-3.5 border border-hairline/60">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-accent">
              Highlight
            </h4>
            <p className="mt-0.5 text-xs text-content-secondary leading-normal">
              {activeSlide.highlight}
            </p>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-hairline/60">
            <Link
              href="/schemes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              Explore all Govt Schemes
              <ExternalLink className="size-3.5" />
            </Link>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous scheme slide"
                className="flex size-8 items-center justify-center rounded-full border border-hairline bg-surface hover:bg-surface-raised text-content transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next scheme slide"
                className="flex size-8 items-center justify-center rounded-full border border-hairline bg-surface hover:bg-surface-raised text-content transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dot Indicators */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {SCHEME_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to scheme slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-7 bg-accent"
                : "w-2 bg-content-tertiary/40 hover:bg-content-tertiary"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
