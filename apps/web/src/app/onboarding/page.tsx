import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SchemesSlideshow } from "@/components/schemes-slideshow";
import { ShieldCheck, Sprout, Sparkles, Compass } from "lucide-react";

/**
 * Onboarding Landing Page (Screen 1)
 *
 * Left Side: Farm Assessment Call-To-Action & Core Value Propositions
 * Right Side: Indian Government Agriculture Schemes & Climate Initiatives Carousel
 */
export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Left Column: Platform Onboarding & Call to Action */}
        <div className="space-y-8 lg:col-span-7">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 type-caption font-semibold uppercase tracking-[0.14em] text-accent">
              <Sprout className="size-4" />
              AgriMitra Climate
            </div>
            <h1 className="type-display text-content leading-tight">
              Know what your field <br />
              <span className="text-accent">needs this week.</span>
            </h1>
            <p className="type-body max-w-xl text-content-secondary text-base md:text-lg leading-relaxed">
              Weather forecasts, satellite vegetation index, soil nutrition, and crop health—analyzed
              together into one actionable risk score for your specific farm.
            </p>
          </div>

          <ul className="space-y-3.5">
            {[
              "Deterministic Farm Risk score with transparent working logic",
              "Crop suitability rankings customized for your soil and season",
              "Instant leaf scanning & diagnosis for crop diseases",
              "Localized advice in English, हिन्दी (Hindi), or ગુજરાતી (Gujarati)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 type-callout text-content-secondary">
                <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Sparkles className="size-3.5" />
                </span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-3 pt-2">
            <Button asChild size="lg" className="h-14 px-8 text-base rounded-xl shadow-lg hover:shadow-xl transition-all" block>
              <Link href="/farm/new">
                <Compass className="size-5 mr-2" />
                Start farm assessment
              </Link>
            </Button>
            <p className="type-caption text-center text-content-tertiary">
              No account registration required. Your farm record is saved securely on this device.
            </p>
          </div>
        </div>

        {/* Right Column: Indian Government Schemes & Climate Initiatives Carousel */}
        <div className="space-y-4 lg:col-span-5">
          <div className="text-center lg:text-left space-y-1">
            <h2 className="type-heading text-content flex items-center justify-center lg:justify-start gap-2">
              <ShieldCheck className="size-5 text-accent" />
              Govt Schemes & Support
            </h2>
            <p className="type-caption text-content-tertiary">
              Swipe to explore major Indian agricultural subsidies & climate programs.
            </p>
          </div>

          <SchemesSlideshow />
        </div>
      </div>
    </div>
  );
}
