import type { RiskLevel } from "@/lib/api";

export const RISK_LABEL: Record<RiskLevel, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

/** Text tokens, not fills — these must stay legible at caption size. */
export const RISK_TEXT: Record<RiskLevel, string> = {
  LOW: "text-risk-low",
  MEDIUM: "text-risk-medium",
  HIGH: "text-risk-high",
  CRITICAL: "text-risk-critical",
};

export const RISK_WASH: Record<RiskLevel, string> = {
  LOW: "bg-risk-low-wash",
  MEDIUM: "bg-risk-medium-wash",
  HIGH: "bg-risk-high-wash",
  CRITICAL: "bg-risk-critical-wash",
};

/** Sentinel-2 NDVI ramp: bare ground through dense canopy. */
export function ndviColor(ndvi: number): string {
  if (ndvi < 0.2) return "var(--ndvi-0)";
  if (ndvi < 0.4) return "var(--ndvi-1)";
  if (ndvi < 0.6) return "var(--ndvi-2)";
  if (ndvi < 0.75) return "var(--ndvi-3)";
  return "var(--ndvi-4)";
}

export function formatDay(iso: string, locale = "en-IN"): string {
  return new Date(iso).toLocaleDateString(locale, { weekday: "short" });
}

export function formatDate(iso: string, locale = "en-IN"): string {
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short" });
}

export function formatTime(iso: string, locale = "en-IN"): string {
  return new Date(iso).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
}

/** WMO weather interpretation codes, condensed to what a farmer needs. */
export function weatherLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}
