import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * PRD §21 Screen 1.
 *
 * One screen, not a carousel, and no splash timer — the previous app blocked the
 * interface for 2.8 seconds before showing anything, which is latency dressed as
 * branding (`launching.md`: launch instantly).
 */
export default function OnboardingPage() {
  return (
    <div className="flex min-h-[70dvh] flex-col justify-center gap-10">
      <div className="space-y-5">
        <p className="type-caption font-semibold uppercase tracking-[0.14em] text-accent">
          AgriMitra Climate
        </p>
        <h1 className="type-display text-content">
          Know what your field
          <br />
          needs this week.
        </h1>
        <p className="type-body max-w-md text-content-secondary">
          Weather, satellite vegetation, your soil and your crop, read together as one
          risk score for your specific field — with every assumption shown.
        </p>
      </div>

      <ul className="space-y-3">
        {[
          "A risk score you can see the working behind",
          "Crop suitability ranked for your soil and season",
          "Leaf scan for possible disease",
          "Advice in English, हिन्दी or ગુજરાતી",
        ].map((item) => (
          <li key={item} className="flex gap-3 type-callout text-content-secondary">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
            {item}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <Button asChild size="lg" block>
          <Link href="/farm/new">Start farm assessment</Link>
        </Button>
        <p className="type-caption text-center text-content-tertiary">
          No account needed. Your farm is saved on this device.
        </p>
      </div>
    </div>
  );
}
