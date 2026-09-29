"use client";

import * as React from "react";

import { EmptyState } from "@/components/ui/states";
import type { DistrictSummary, RiskLevel } from "@/lib/api";

/* Minimal structural types for the two Maps classes this component uses. The
   full @types/google.maps package is not worth a dependency for two constructors. */
interface LatLng {
  lat: number;
  lng: number;
}

interface MapsMap {
  new (element: HTMLElement, options: Record<string, unknown>): unknown;
}

interface MapsMarker {
  new (options: { map: unknown; position: LatLng; content: HTMLElement; title: string }): unknown;
}

interface MapsNamespace {
  maps: {
    importLibrary: (name: "maps") => Promise<{ Map: MapsMap }>;
  } & {
    importLibrary: (name: "marker") => Promise<{ AdvancedMarkerElement: MapsMarker }>;
  };
}

/** Rajasthan district centroids for the seeded demo set. */
const CENTROIDS: Record<string, { lat: number; lng: number }> = {
  Alwar: { lat: 27.55, lng: 76.63 },
  Jaipur: { lat: 26.91, lng: 75.78 },
  Jodhpur: { lat: 26.23, lng: 73.02 },
  Udaipur: { lat: 24.58, lng: 73.68 },
  Bikaner: { lat: 28.02, lng: 73.31 },
  Ajmer: { lat: 26.44, lng: 74.63 },
  Kota: { lat: 25.18, lng: 75.83 },
  Bhilwara: { lat: 25.32, lng: 74.58 },
  Sikar: { lat: 27.6, lng: 75.13 },
  Pali: { lat: 25.77, lng: 73.33 },
};

const RISK_FILL: Record<RiskLevel, string> = {
  LOW: "#4c8a42",
  MEDIUM: "#b3891b",
  HIGH: "#ea580c",
  CRITICAL: "#b91c1c",
};

/** The worst band present in a district decides its marker. */
function dominantBand(summary: DistrictSummary): RiskLevel {
  const bands: RiskLevel[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  return bands.find((band) => (summary.risk_bands[band] ?? 0) > 0) ?? "LOW";
}

/**
 * Google Maps district view (PRD F13).
 *
 * Markers are `AdvancedMarkerElement` built from DOM nodes. The previous
 * implementation pointed at `http://chart.apis.google.com/chart`, a Google service
 * retired years ago, over plain HTTP — dead and mixed-content-blocked (audit B9).
 */
export function DistrictMap({
  districts,
  onSelect,
  selected,
}: {
  districts: DistrictSummary[];
  onSelect: (district: string) => void;
  selected?: string;
}) {
  const container = React.useRef<HTMLDivElement>(null);
  const [failed, setFailed] = React.useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  React.useEffect(() => {
    if (!apiKey || !container.current || districts.length === 0) return;
    let cancelled = false;

    async function render() {
      try {
        await loadMapsScript(apiKey!);
        if (cancelled || !container.current) return;

        const google = (window as unknown as { google: MapsNamespace }).google;
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        if (cancelled || !container.current) return;

        const map = new Map(container.current, {
          center: { lat: 26.5, lng: 74.2 },
          zoom: 6,
          mapId: "agrimitra-districts",
          disableDefaultUI: true,
          zoomControl: true,
        });

        for (const summary of districts) {
          const position = CENTROIDS[summary.district];
          if (!position) continue;

          const band = dominantBand(summary);
          const pin = document.createElement("button");
          pin.type = "button";
          pin.setAttribute(
            "aria-label",
            `${summary.district}: ${summary.farm_count} farms, highest risk band ${band}`,
          );
          pin.style.cssText = [
            "display:flex",
            "align-items:center",
            "gap:6px",
            "padding:5px 10px",
            "border-radius:999px",
            "border:2px solid #fff",
            "cursor:pointer",
            "font:600 12px/1 system-ui,sans-serif",
            "color:#fff",
            "box-shadow:0 2px 8px rgb(0 0 0 / .3)",
            `background:${RISK_FILL[band]}`,
            summary.district === selected ? "outline:3px solid #0f5257;outline-offset:2px" : "",
          ].join(";");
          pin.textContent = summary.district;
          pin.addEventListener("click", () => onSelect(summary.district));

          new AdvancedMarkerElement({ map, position, content: pin, title: summary.district });
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [apiKey, districts, onSelect, selected]);

  if (!apiKey || failed) {
    return (
      <EmptyState
        title="Map unavailable"
        description={
          apiKey
            ? "Google Maps did not load. The district list below still works."
            : "No Google Maps API key is configured. The district list below still works."
        }
      />
    );
  }

  return (
    <div
      ref={container}
      role="application"
      aria-label="District risk map"
      className="h-64 w-full overflow-hidden rounded-lg border border-hairline"
    />
  );
}

let scriptPromise: Promise<void> | null = null;

function loadMapsScript(apiKey: string): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps,marker&v=weekly&loading=async`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}
