/**
 * Typed client for the AgriMitra Climate domain API.
 *
 * Every response that carries a measurement also carries its provenance, and
 * those fields are required in the types below — a screen cannot render a value
 * without also having the information needed to label where it came from.
 */

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}/api/v1${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { detail?: string; error?: string };
      message = body.detail ?? body.error ?? message;
    } catch {
      /* non-JSON error body — keep the status message */
    }
    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}

/* ----------------------------- domain types ----------------------------- */

export type Season = "Kharif" | "Rabi" | "Zaid";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Language = "en" | "hi" | "gu" | "te";

export interface Farm {
  _id: string;
  farmer_id: string;
  location: { lat: number; lng: number };
  state: string;
  district: string;
  area_acres: number;
  crop: string;
  season: Season;
  soil: {
    type: string;
    moisture?: "Low" | "Medium" | "High" | null;
    nitrogen?: "Low" | "Medium" | "High" | null;
    phosphorus?: "Low" | "Medium" | "High" | null;
    potassium?: "Low" | "Medium" | "High" | null;
  };
  irrigation: string;
  is_demo: boolean;
}

export interface Weather {
  current: {
    temperature_c: number;
    humidity_pct: number;
    precipitation_mm: number;
    wind_speed_kmh: number;
    weather_code: number;
  } | null;
  forecast: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    precipitation_mm: number;
    weather_code: number;
  }>;
  rainfall_mm_7d?: number;
  source: string;
  /** True when the upstream service could not be reached. Zeros are NOT readings. */
  degraded: boolean;
  fetched_at: string;
}

export interface Satellite {
  ndvi: number;
  vegetation_health: number;
  vegetation_status: string;
  captured_on: string;
  source: string;
  /** False for the seeded demo dataset. Drives the provenance badge. */
  is_live: boolean;
  notice?: string;
  instrument?: string;
}

export interface FarmRisk {
  farm_id: string;
  water_stress: number;
  heat_stress: number;
  rainfall_risk: number;
  disease_risk: number;
  vegetation_risk: number;
  overall_score: number;
  level: RiskLevel;
  /** Only the factors that had evidence. A dropped factor is absent here. */
  weights: Record<string, number>;
  /** Plain-language notes on anything that was assumed rather than observed. */
  assumptions: string[];
  computed_at: string;
  sources: {
    weather: string | null;
    weather_degraded: boolean;
    satellite: string | null;
    satellite_is_live: boolean | null;
    diagnosis: string | null;
  };
}

export interface CropRecommendation {
  crop: string;
  match_percentage: number;
  criteria: Array<{
    criterion: string;
    points: number;
    max_points: number;
    explanation: string;
  }>;
  requirements: { water: string; temperature: string; rainfall: string };
  /** Criteria with no evidence — shown as "not assessed", never as a failure. */
  unscored_criteria: string[];
}

export interface Advisory {
  summary: string;
  observations: string[];
  risks: string[];
  actions: string[];
  irrigation_advice: string;
  weather_advice: string;
  monitoring_advice: string[];
  uncertainty: string;
  source: "gemini" | "deterministic-fallback";
  is_ai_generated: boolean;
  disclaimer?: string;
}

export interface DistrictSummary {
  district: string;
  farm_count: number;
  farms_with_risk: number;
  risk_bands: Record<RiskLevel, number>;
  top_crops: string[];
  dominant_crop: string | null;
  water_stress_level: RiskLevel | null;
  water_stress_score: number | null;
  disease_occurrences: Record<string, number>;
  is_demo: boolean;
}

export interface StateOverview {
  districts_analyzed: number;
  farms_analyzed: number;
  risk_bands: Record<RiskLevel, number>;
  districts: DistrictSummary[];
  is_demo: boolean;
}

export interface Health {
  status: string;
  version: string;
  capabilities: { gemini: boolean; earth_engine: boolean; market_data: boolean };
}

/* ------------------------------- endpoints ------------------------------ */

export const api = {
  health: () =>
    fetch(`${API_BASE}/health`).then((r) => r.json() as Promise<Health>),

  getWeather: (lat: number, lng: number) =>
    request<Weather>(`/weather?lat=${lat}&lng=${lng}`),

  getSeasonalRainfall: (lat: number, lng: number, season: Season) =>
    request<{ total_mm: number; window_start: string; window_end: string; source: string }>(
      `/weather/seasonal-rainfall?lat=${lat}&lng=${lng}&season=${season}`,
    ),

  getSatellite: (lat: number, lng: number, district?: string) =>
    request<Satellite>(
      `/satellite?lat=${lat}&lng=${lng}${district ? `&district=${encodeURIComponent(district)}` : ""}`,
    ),

  getFarm: (id: string) => request<Farm>(`/farms/${id}`),

  createFarm: (body: Omit<Farm, "_id">) =>
    request<Farm>("/farms", { method: "POST", body: JSON.stringify(body) }),

  getFarmRisk: (id: string) => request<FarmRisk>(`/farms/${id}/risk`),

  recommendCrops: (body: {
    season: Season;
    soil_type: string;
    irrigation: string;
    temperature_c?: number | null;
    seasonal_rainfall_mm?: number | null;
  }) =>
    request<{ recommendations: CropRecommendation[]; disclaimer: string }>(
      "/recommendations/crops",
      { method: "POST", body: JSON.stringify(body) },
    ),

  getAdvisory: (body: Record<string, unknown>) =>
    request<Advisory>("/advisory", { method: "POST", body: JSON.stringify(body) }),

  diagnose: (form: FormData) =>
    request<{
      label: string;
      confidence: number;
      guidance: string;
      source: string;
      disclaimer: string;
    }>("/diagnosis", { method: "POST", body: form }),

  getDistrictOverview: () => request<StateOverview>("/districts/overview"),

  getInterventions: (district: string, language: Language = "en") =>
    request<{
      interventions: Array<{ priority: string; action: string; reasoning: string }>;
      disclaimer: string;
    }>(`/districts/${encodeURIComponent(district)}/interventions`, {
      method: "POST",
      body: JSON.stringify({ language }),
    }),
};
