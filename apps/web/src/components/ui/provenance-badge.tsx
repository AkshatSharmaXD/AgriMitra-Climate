import { Database, Radio, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

export type Provenance = "live" | "demo" | "unavailable";

const VARIANTS = {
  live: {
    Icon: Radio,
    tone: "text-provenance-live border-provenance-live/30 bg-accent-soft",
    defaultLabel: "Live",
  },
  demo: {
    Icon: Database,
    tone: "text-provenance-demo border-provenance-demo/35 bg-risk-medium-wash",
    defaultLabel: "Demo dataset",
  },
  unavailable: {
    Icon: TriangleAlert,
    tone: "text-provenance-stale border-hairline bg-surface-sunken",
    defaultLabel: "Unavailable",
  },
} as const;

/**
 * Says where a number on screen came from.
 *
 * PRD §16 is categorical: simulated data must never be presented as live data.
 * Rather than leaving that to each screen's discretion, every panel that renders
 * a measurement is required to render one of these next to it. The icon and the
 * words both carry the state, so the meaning never rests on colour alone
 * (`accessibility.md`).
 */
export function ProvenanceBadge({
  provenance,
  label,
  detail,
  className,
}: {
  provenance: Provenance;
  label?: string;
  /** Source and capture time, e.g. "Sentinel-2 · 28 Sep 2026". */
  detail?: string;
  className?: string;
}) {
  const { Icon, tone, defaultLabel } = VARIANTS[provenance];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 type-caption font-medium",
        tone,
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" />
      <span>{label ?? defaultLabel}</span>
      {detail ? (
        <>
          <span aria-hidden className="opacity-40">
            ·
          </span>
          <span className="font-normal opacity-90">{detail}</span>
        </>
      ) : null}
    </span>
  );
}
