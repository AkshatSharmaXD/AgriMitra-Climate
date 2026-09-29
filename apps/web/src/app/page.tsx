"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Droplets, IndianRupee, Leaf, MapPin, ScrollText, Sprout } from "lucide-react";

import { AgriNews } from "@/components/agri-news";
import { RiskStratum } from "@/components/charts/risk-stratum";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { api } from "@/lib/api";
import { useActiveFarmId } from "@/lib/active-farm";
import { RISK_LABEL, RISK_TEXT, formatDay, ndviColor, weatherLabel } from "@/lib/format";

const COMPONENT_LABELS: Record<string, string> = {
  water_stress: "Water",
  heat_stress: "Heat",
  disease_risk: "Disease",
  rainfall_risk: "Rainfall",
  vegetation_risk: "Vegetation",
};

export default function FarmDashboardPage() {
  const router = useRouter();
  const { farmId, ready } = useActiveFarmId();

  React.useEffect(() => {
    if (ready && !farmId) router.replace("/onboarding");
  }, [ready, farmId, router]);

  const farm = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => api.getFarm(farmId!),
    enabled: Boolean(farmId),
  });

  const risk = useQuery({
    queryKey: ["risk", farmId],
    queryFn: () => api.getFarmRisk(farmId!),
    enabled: Boolean(farmId),
  });

  const weather = useQuery({
    queryKey: ["weather", farm.data?.location],
    queryFn: () => api.getWeather(farm.data!.location.lat, farm.data!.location.lng),
    enabled: Boolean(farm.data),
  });

  const satellite = useQuery({
    queryKey: ["satellite", farm.data?.location],
    queryFn: () =>
      api.getSatellite(farm.data!.location.lat, farm.data!.location.lng, farm.data!.district),
    enabled: Boolean(farm.data),
    staleTime: 60 * 60_000,
  });

  if (!ready || (farmId && farm.isPending)) {
    return (
      <div className="space-y-4 pt-8">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!farmId) return null;

  if (farm.isError) {
    return (
      <ErrorState
        title="Could not load your farm"
        detail={(farm.error as Error).message}
        action={
          <Button size="md" variant="secondary" onClick={() => farm.refetch()}>
            Try again
          </Button>
        }
      />
    );
  }

  const f = farm.data!;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="space-y-2">
        <PageHeader
          title={`${f.crop} · ${f.area_acres} acres`}
          provenance={f.is_demo ? <ProvenanceBadge provenance="demo" /> : undefined}
        />
        <p className="flex items-center gap-2 type-callout text-content-secondary font-medium tracking-wide">
          <MapPin aria-hidden className="size-4 text-accent" />
          {f.district}, {f.state} <span className="opacity-50">•</span> {f.soil.type} soil <span className="opacity-50">•</span> {f.irrigation}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* --- The headline: risk, and the working behind it -------------------- */}
        <div className="md:col-span-2 xl:col-span-3">
      <Card>
        {risk.isPending ? (
          <Skeleton className="h-56 w-full" />
        ) : risk.isError ? (
          <ErrorState
            title="Risk could not be calculated"
            detail={(risk.error as Error).message}
            action={
              <Button size="md" variant="secondary" onClick={() => risk.refetch()}>
                Retry
              </Button>
            }
          />
        ) : (
          <>
            <CardHeader
              title="Farm risk"
              description="Computed from your farm record and the signals below."
            />
            <div className="mb-5 flex items-baseline gap-3">
              <span className="type-display type-numeric text-content">
                {risk.data!.overall_score}
              </span>
              <span className="type-body text-content-tertiary">/ 100</span>
              <span
                className={`ml-auto type-heading font-semibold ${RISK_TEXT[risk.data!.level]}`}
              >
                {RISK_LABEL[risk.data!.level]}
              </span>
            </div>

            <RiskStratum
              components={Object.entries(risk.data!.weights).map(([key, weight]) => ({
                key,
                label: COMPONENT_LABELS[key] ?? key,
                score: (risk.data as unknown as Record<string, number>)[key] ?? 0,
                weight,
              }))}
            />

            {risk.data!.assumptions.length > 0 ? (
              <div className="mt-5 border-t border-hairline pt-4">
                <h3 className="type-callout font-semibold text-content">
                  What this score assumed
                </h3>
                <ul className="mt-2 space-y-2">
                  {risk.data!.assumptions.map((note) => (
                    <li key={note} className="flex gap-2.5 type-callout text-content-secondary">
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-content-tertiary"
                      />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}
      </Card>
      </div>

      {/* --- Weather. Degraded shows an error, never zeros (audit B5) --------- */}
      <Card>
        <CardHeader
          title="Next 7 days"
          action={
            weather.data && !weather.data.degraded ? (
              <ProvenanceBadge provenance="live" label="Open-Meteo" />
            ) : null
          }
        />
        {weather.isPending ? (
          <Skeleton className="h-24 w-full" />
        ) : weather.isError || weather.data?.degraded ? (
          <ErrorState
            variant="offline"
            title="Weather service did not respond"
            detail="Heat and rainfall are left out of the risk score rather than assumed. Nothing on this screen is a guess."
            action={
              <Button size="md" variant="secondary" onClick={() => weather.refetch()}>
                Retry
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {weather.data!.forecast.map((day) => (
                <div
                  key={day.date}
                  className="min-w-[4.5rem] shrink-0 rounded-md border border-hairline p-2.5 text-center"
                >
                  <p className="type-caption text-content-secondary">{formatDay(day.date)}</p>
                  <p className="type-callout type-numeric mt-1 font-semibold text-content">
                    {Math.round(day.temp_max)}°
                  </p>
                  <p className="type-caption type-numeric text-content-tertiary">
                    {Math.round(day.temp_min)}°
                  </p>
                  <p className="type-caption type-numeric mt-1 text-accent">
                    {day.precipitation_mm.toFixed(1)}mm
                  </p>
                </div>
              ))}
            </div>
            {weather.data!.current ? (
              <p className="mt-3 type-caption text-content-tertiary">
                Now {Math.round(weather.data!.current.temperature_c)}°C ·{" "}
                {weatherLabel(weather.data!.current.weather_code)} ·{" "}
                {weather.data!.current.humidity_pct}% humidity
              </p>
            ) : null}
          </>
        )}
      </Card>

      {/* --- NDVI, badged by is_live (audit A1, A8) --------------------------- */}
      <Card>
        <CardHeader
          title="Vegetation"
          action={
            satellite.data ? (
              <ProvenanceBadge
                provenance={satellite.data.is_live ? "live" : "demo"}
                label={satellite.data.is_live ? "Sentinel-2" : "Demo dataset"}
                detail={satellite.data.captured_on}
              />
            ) : null
          }
        />
        {satellite.isPending ? (
          <Skeleton className="h-20 w-full" />
        ) : satellite.isError ? (
          <EmptyState
            icon={Leaf}
            title="No vegetation reading"
            description="Satellite coverage is not available for this location yet."
          />
        ) : (
          <div className="flex items-center gap-4">
            <div
              aria-hidden
              className="size-14 shrink-0 rounded-md"
              style={{ background: ndviColor(satellite.data!.ndvi) }}
            />
            <div>
              <p className="type-title type-numeric text-content">
                {satellite.data!.ndvi.toFixed(2)}
              </p>
              <p className="type-callout text-content-secondary">
                NDVI · {satellite.data!.vegetation_status}
              </p>
            </div>
          </div>
        )}
      </Card>
      </div>

      {/* Reference screens, useful on their own and reachable without a farm. */}
      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-hairline/50">
        <Link
          href="/market"
          className="flex min-h-tap items-center gap-3 rounded-md border border-hairline bg-surface-raised p-4 active:scale-[0.99]"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <IndianRupee aria-hidden className="size-5" />
          </span>
          <span className="type-callout font-medium text-content">Mandi prices</span>
        </Link>
        <Link
          href="/schemes"
          className="flex min-h-tap items-center gap-3 rounded-md border border-hairline bg-surface-raised p-4 active:scale-[0.99]"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <ScrollText aria-hidden className="size-5" />
          </span>
          <span className="type-callout font-medium text-content">Schemes</span>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Button asChild size="lg" className="h-16 text-lg rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-gradient-to-r from-accent to-accent-hover" block>
          <Link href={`/advisory?farm=${farmId}`}>
            <Sprout aria-hidden className="size-6 mr-2" />
            Get AI Advisory
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary" className="h-16 text-lg rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border-accent/20 bg-white/50 backdrop-blur-md" block>
          <Link href={`/crops?farm=${farmId}`}>
            <Droplets aria-hidden className="size-6 mr-2 text-accent" />
            <span className="text-content">Crop Suitability</span>
          </Link>
        </Button>
      </div>

      {/* Headlines last: useful context, but never above the farmer's own field. */}
      <AgriNews />
    </div>
  );
}
