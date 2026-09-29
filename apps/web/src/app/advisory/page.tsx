"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { api, type Language } from "@/lib/api";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "hi", label: "हि" },
  { value: "gu", label: "ગુ" },
  { value: "te", label: "తె" },
];

function AdvisoryContent() {
  const farmId = useSearchParams().get("farm");
  const [language, setLanguage] = React.useState<Language>("en");

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

  const ready = Boolean(farm.data && risk.data && weather.isFetched && satellite.isFetched);

  const advisory = useQuery({
    queryKey: ["advisory", farmId, language],
    enabled: ready,
    staleTime: 15 * 60_000,
    queryFn: () =>
      api.getAdvisory({
        location: `${farm.data!.district}, ${farm.data!.state}`,
        crop: farm.data!.crop,
        season: farm.data!.season,
        soil_type: farm.data!.soil.type,
        irrigation: farm.data!.irrigation,
        // Undefined, never a substituted number — the model is told what is missing.
        temperature_c: weather.data?.current?.temperature_c,
        humidity_pct: weather.data?.current?.humidity_pct,
        rainfall_mm_7d: weather.data?.rainfall_mm_7d,
        ndvi: satellite.data?.ndvi,
        vegetation_status: satellite.data?.vegetation_status,
        satellite_source: satellite.data?.source,
        risk_level: risk.data!.level,
        risk_score: risk.data!.overall_score,
        risk_assumptions: risk.data!.assumptions,
        language,
      }),
  });

  if (!farmId) {
    return <ErrorState title="No farm selected" detail="Open an advisory from your farm dashboard." />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI advisory"
        backHref="/"
        provenance={
          advisory.data ? (
            <ProvenanceBadge
              provenance={advisory.data.is_ai_generated ? "live" : "demo"}
              label={advisory.data.is_ai_generated ? "Gemini" : "Rule-based"}
            />
          ) : undefined
        }
      />

      <div role="radiogroup" aria-label="Advisory language" className="flex gap-2">
        {LANGUAGES.map((option) => (
          <Button
            key={option.value}
            role="radio"
            aria-checked={language === option.value}
            variant={language === option.value ? "primary" : "secondary"}
            onClick={() => setLanguage(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {!ready || advisory.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : advisory.isError ? (
        <ErrorState
          title="Advisory could not be generated"
          detail={(advisory.error as Error).message}
          action={
            <Button variant="secondary" onClick={() => advisory.refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <>
          {!advisory.data!.is_ai_generated ? (
            <div className="rounded-md border border-provenance-demo/30 bg-risk-medium-wash p-4">
              <p className="type-callout font-semibold text-risk-medium">
                This is not AI output
              </p>
              <p className="type-callout mt-1 text-content-secondary">
                Gemini is not configured on this server, so the text below was assembled
                by fixed rules from your risk numbers. It contains no agronomic reasoning.
              </p>
            </div>
          ) : null}

          <Card>
            <CardHeader title="Summary" />
            <p className="type-body text-content">{advisory.data!.summary}</p>
          </Card>

          <Card>
            <CardHeader
              title="What was observed"
              description="The facts this advice was built from."
            />
            <ul className="space-y-2">
              {advisory.data!.observations.map((item) => (
                <li key={item} className="flex gap-2.5 type-callout text-content-secondary">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-risk-high/25 bg-risk-high-wash">
            <CardHeader title="Risks" />
            <ul className="space-y-2">
              {advisory.data!.risks.map((item) => (
                <li key={item} className="flex gap-2.5 type-callout text-content">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-risk-high" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Do this week" />
            <ol className="space-y-3">
              {advisory.data!.actions.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="type-caption type-numeric mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">
                    {index + 1}
                  </span>
                  <span className="type-callout text-content">{item}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <CardHeader title="Irrigation and weather" />
            <dl className="space-y-3">
              <div>
                <dt className="type-caption font-semibold text-content-secondary">Irrigation</dt>
                <dd className="type-callout mt-0.5 text-content">
                  {advisory.data!.irrigation_advice}
                </dd>
              </div>
              <div>
                <dt className="type-caption font-semibold text-content-secondary">Weather</dt>
                <dd className="type-callout mt-0.5 text-content">
                  {advisory.data!.weather_advice}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Rendered, unlike the previous client which fetched and dropped it (E8). */}
          <Card>
            <CardHeader title="Watch for" />
            <ul className="space-y-2">
              {advisory.data!.monitoring_advice.map((item) => (
                <li key={item} className="flex gap-2.5 type-callout text-content-secondary">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-content-tertiary" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-surface-sunken">
            <CardHeader title="What is uncertain" />
            <p className="type-callout text-content-secondary">{advisory.data!.uncertainty}</p>
            {advisory.data!.disclaimer ? (
              <p className="mt-3 border-t border-hairline pt-3 type-caption text-content-tertiary">
                {advisory.data!.disclaimer}
              </p>
            ) : null}
          </Card>
        </>
      )}
    </div>
  );
}

export default function AdvisoryPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <AdvisoryContent />
    </Suspense>
  );
}
