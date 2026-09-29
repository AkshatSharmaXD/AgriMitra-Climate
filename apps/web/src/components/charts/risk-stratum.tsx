"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * The signature element.
 *
 * A farm's risk is drawn as a soil core: five stacked strata, each one's
 * thickness proportional to how much that factor contributes to the score, each
 * coloured from the earth ramp. It reads the way a farmer already reads their
 * own land in section — topsoil down to subsoil — instead of as five more
 * progress bars, which is what this screen was before.
 *
 * Contribution, not raw sub-score, drives thickness: a 90/100 water stress at
 * weight 0.30 is a thicker band than a 90/100 rainfall risk at weight 0.15. The
 * picture therefore answers "what is actually driving this number", which a row
 * of independent bars cannot.
 * ------------------------------------------------------------------------ */

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskComponent {
  key: string;
  label: string;
  /** 0–100 sub-score. */
  score: number;
  /** Weight actually applied, after any unavailable factor was dropped. */
  weight: number;
}

const bandFor = (score: number): RiskLevel =>
  score <= 30 ? "LOW" : score <= 60 ? "MEDIUM" : score <= 80 ? "HIGH" : "CRITICAL";

const FILL: Record<RiskLevel, string> = {
  LOW: "var(--risk-low-fill)",
  MEDIUM: "var(--risk-medium-fill)",
  HIGH: "var(--risk-high-fill)",
  CRITICAL: "var(--risk-critical-fill)",
};

const BAND_LABEL: Record<RiskLevel, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export function RiskStratum({
  components,
  className,
}: {
  components: RiskComponent[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0) || 1;

  return (
    <figure className={cn("space-y-3", className)}>
      <div
        className="flex h-44 w-full overflow-hidden rounded-md border border-hairline"
        role="img"
        aria-label={`Risk contribution by factor. ${components
          .map((c) => `${c.label}: ${Math.round(c.score)} out of 100, ${BAND_LABEL[bandFor(c.score)]}`)
          .join(". ")}.`}
      >
        {components.map((component, index) => {
          const band = bandFor(component.score);
          const widthPct = (component.weight / totalWeight) * 100;

          return (
            <motion.div
              key={component.key}
              className="relative flex flex-col justify-end"
              style={{ width: `${widthPct}%`, background: "var(--surface-sunken)" }}
              initial={false}
            >
              {/* The stratum rises from the base of its column to its score. */}
              <motion.div
                className="w-full"
                style={{ background: FILL[band] }}
                initial={reduceMotion ? false : { height: "0%" }}
                animate={{ height: `${Math.max(2, component.score)}%` }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : // Critically damped: no overshoot on a value that is simply
                      // reporting a measurement. Bounce is reserved for gestures.
                      { type: "spring", bounce: 0, duration: 0.45, delay: index * 0.05 }
                }
              />
              {index > 0 ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-px bg-surface/60"
                />
              ) : null}
            </motion.div>
          );
        })}
      </div>

      {/* The legend carries the numbers, so nothing depends on reading a colour. */}
      <figcaption className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {components.map((component) => {
          const band = bandFor(component.score);
          return (
            <div key={component.key} className="flex items-baseline gap-2">
              <span
                aria-hidden
                className="size-2.5 shrink-0 translate-y-px rounded-[3px]"
                style={{ background: FILL[band] }}
              />
              <span className="type-caption text-content-secondary">{component.label}</span>
              <span className="type-caption type-numeric ml-auto font-semibold text-content">
                {Math.round(component.score)}
              </span>
            </div>
          );
        })}
      </figcaption>
    </figure>
  );
}
