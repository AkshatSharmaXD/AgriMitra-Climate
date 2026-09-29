"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";
import { Check, ChevronDown, Loader2, Minus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { api, type CropRecommendation } from "@/lib/api";
import { cn } from "@/lib/utils";

const CRITERION_LABEL: Record<string, string> = {
  season: "Season",
  soil: "Soil",
  water: "Water",
  temperature: "Temperature",
  rainfall: "Rainfall",
};

function CropRow({ crop, rank }: { crop: CropRecommendation; rank: number }) {
  const [open, setOpen] = React.useState(rank === 0);
  const panelId = `crop-${crop.crop}`;

  return (
    <Card className="p-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-5 text-left active:scale-[0.995]"
      >
        <span className="type-caption type-numeric w-5 shrink-0 font-semibold text-content-tertiary">
          {rank + 1}
        </span>
        <span className="type-heading flex-1 text-content">{crop.crop}</span>
        <span className="type-heading type-numeric font-semibold text-content">
          {crop.match_percentage}%
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-5 shrink-0 text-content-tertiary transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* The bar is a second encoding of the number beside it, not the only one. */}
      <div className="mx-5 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out-quint"
          style={{ width: `${crop.match_percentage}%` }}
        />
      </div>

      {open ? (
        <div id={panelId} className="space-y-2.5 p-5 pt-4">
          {crop.criteria.map((criterion) => {
            const met = criterion.points === criterion.max_points;
            return (
              <div key={criterion.criterion} className="flex gap-2.5">
                <Check
                  aria-hidden
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    met ? "text-risk-low" : "text-content-tertiary opacity-40",
                  )}
                  strokeWidth={2.5}
                />
                <p className="type-callout text-content-secondary">
                  <span className="font-medium text-content">
                    {CRITERION_LABEL[criterion.criterion] ?? criterion.criterion}:{" "}
                  </span>
                  {criterion.explanation}
                </p>
              </div>
            );
          })}

          {/* Unknown is shown as not assessed, never as a failure (audit B3). */}
          {crop.unscored_criteria.map((criterion) => (
            <div key={criterion} className="flex gap-2.5">
              <Minus aria-hidden className="mt-0.5 size-4 shrink-0 text-content-tertiary" />
              <p className="type-callout text-content-tertiary">
                <span className="font-medium">
                  {CRITERION_LABEL[criterion] ?? criterion}:{" "}
                </span>
                Not assessed — no comparable data was available, so it neither helped
                nor hurt this score.
              </p>
            </div>
          ))}

          <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-hairline pt-3">
            {(
              [
                ["Water", crop.requirements.water],
                ["Temp", crop.requirements.temperature],
                ["Rain", crop.requirements.rainfall],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="type-caption text-content-tertiary">{label}</dt>
                <dd className="type-caption font-medium text-content-secondary">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </Card>
  );
}

function CropsContent() {
  const farmId = useSearchParams().get("farm");

  const farm = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => api.getFarm(farmId!),
    enabled: Boolean(farmId),
  });

  const weather = useQuery({
    queryKey: ["weather", farm.data?.location],
    queryFn: () => api.getWeather(farm.data!.location.lat, farm.data!.location.lng),
    enabled: Boolean(farm.data),
  });

  // Measured over a full season — the comparable window for crops.json, which
  // states its requirement per season, not per hour (audit B3).
  const seasonalRain = useQuery({
    queryKey: ["seasonal-rain", farm.data?.location, farm.data?.season],
    queryFn: () =>
      api.getSeasonalRainfall(farm.data!.location.lat, farm.data!.location.lng, farm.data!.season),
    enabled: Boolean(farm.data),
    retry: false,
    staleTime: 24 * 60 * 60_000,
  });

  const ready = Boolean(farm.data) && weather.isFetched && seasonalRain.isFetched;

  const context = farm.data
    ? {
        season: farm.data.season,
        soil_type: farm.data.soil.type,
        irrigation: farm.data.irrigation,
        temperature_c: weather.data?.current?.temperature_c ?? null,
        seasonal_rainfall_mm: seasonalRain.data?.total_mm ?? null,
      }
    : null;

  const recommendations = useQuery({
    queryKey: ["crops", context],
    queryFn: () => api.recommendCrops(context!),
    enabled: ready && Boolean(context),
  });

  // Gemini narrates the ranking the engine already produced. It is given the
  // scores and the criterion breakdown, and must not reorder or invent a crop.
  const explain = useMutation({
    mutationFn: () =>
      api.explainCrops({
        ...context!,
        location: `${farm.data!.district}, ${farm.data!.state}`,
        limit: 5,
      }),
  });

  if (!farmId) {
    return <ErrorState title="No farm selected" detail="Open this from your farm dashboard." />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Crop suitability"
        backHref="/"
        description={
          farm.data
            ? `${farm.data.season} season · ${farm.data.soil.type} soil · ${farm.data.irrigation}`
            : undefined
        }
      />

      {seasonalRain.isError ? (
        <p className="rounded-md bg-surface-sunken px-3 py-2 type-caption text-content-secondary">
          Seasonal rainfall could not be measured for this location, so the rainfall
          criterion is marked <strong>not assessed</strong> below rather than guessed.
        </p>
      ) : seasonalRain.data ? (
        <p className="rounded-md bg-surface-sunken px-3 py-2 type-caption text-content-secondary">
          Rainfall measured at <strong>{seasonalRain.data.total_mm}mm</strong> over the{" "}
          {farm.data?.season} window ({seasonalRain.data.window_start} to{" "}
          {seasonalRain.data.window_end}), from {seasonalRain.data.source}.
        </p>
      ) : null}

      {!ready || recommendations.isPending ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : recommendations.isError ? (
        <ErrorState
          title="Could not rank crops"
          detail={(recommendations.error as Error).message}
          action={
            <Button variant="secondary" onClick={() => recommendations.refetch()}>
              Try again
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {recommendations.data!.recommendations.map((crop, index) => (
              <CropRow key={crop.crop} crop={crop} rank={index} />
            ))}
          </div>
          <Card>
            <CardHeader
              title="Why this ranking?"
              description="Gemini explains the scores above. It does not reorder them."
            />
            {explain.data ? (
              <div className="space-y-4">
                {explain.data.explanations.map((item) => (
                  <div key={item.crop} className="space-y-1">
                    <p className="type-callout font-semibold text-content">
                      {item.crop} — {item.verdict}
                    </p>
                    <p className="type-callout text-content-secondary">{item.why}</p>
                    <p className="type-caption text-content-tertiary">
                      Watch out for: {item.watch_out_for}
                    </p>
                  </div>
                ))}
              </div>
            ) : explain.isError ? (
              <ErrorState
                title="Explanations unavailable"
                detail={(explain.error as Error).message}
              />
            ) : (
              <Button
                variant="secondary"
                block
                disabled={explain.isPending}
                onClick={() => explain.mutate()}
              >
                {explain.isPending ? (
                  <Loader2 aria-hidden className="size-5 animate-spin" />
                ) : null}
                Explain these scores
              </Button>
            )}
          </Card>

          <p className="type-caption text-content-tertiary">
            {recommendations.data!.disclaimer}
          </p>
        </>
      )}
    </div>
  );
}

export default function CropsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <CropsContent />
    </Suspense>
  );
}
