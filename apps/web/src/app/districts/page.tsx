"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { Loader2 } from "lucide-react";

import { DistrictMap } from "@/components/charts/district-map";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { api, type RiskLevel } from "@/lib/api";
import { RISK_LABEL, RISK_TEXT } from "@/lib/format";
import { cn } from "@/lib/utils";

const BANDS: RiskLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function DistrictsPage() {
  const [selected, setSelected] = React.useState<string | null>(null);

  const overview = useQuery({
    queryKey: ["districts"],
    queryFn: () => api.getDistrictOverview(),
  });

  React.useEffect(() => {
    if (!selected && overview.data?.districts.length) {
      setSelected(overview.data.districts[0]!.district);
    }
  }, [overview.data, selected]);

  const district = overview.data?.districts.find((d) => d.district === selected) ?? null;

  const interventions = useMutation({
    mutationFn: (name: string) => api.getInterventions(name),
  });

  const onSelect = React.useCallback((name: string) => {
    setSelected(name);
    interventions.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (overview.isPending) {
    return (
      <div className="space-y-4 pt-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (overview.isError) {
    return (
      <ErrorState
        title="District data unavailable"
        detail={(overview.error as Error).message}
        action={
          <Button variant="secondary" onClick={() => overview.refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  const data = overview.data!;

  if (data.districts_analyzed === 0) {
    return (
      <>
        <PageHeader title="District intelligence" />
        <EmptyState
          title="No farms recorded yet"
          description="District statistics appear once farms are registered. Run the seed script to load the demo dataset."
        />
      </>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="District intelligence"
        provenance={data.is_demo ? <ProvenanceBadge provenance="demo" /> : undefined}
      />

      {/* State roll-up — missing entirely from the previous dashboard (audit E4). */}
      <Card>
        <CardHeader
          title="Rajasthan"
          description={`${data.districts_analyzed} districts · ${data.farms_analyzed} farms analysed`}
        />
        <dl className="grid grid-cols-4 gap-3">
          {BANDS.map((band) => (
            <div key={band} className="rounded-md bg-surface-sunken p-3 text-center">
              <dt className={cn("type-caption font-semibold", RISK_TEXT[band])}>
                {RISK_LABEL[band]}
              </dt>
              <dd className="type-title type-numeric mt-1 text-content">
                {data.risk_bands[band] ?? 0}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <DistrictMap
        districts={data.districts}
        onSelect={onSelect}
        selected={selected ?? undefined}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {data.districts.map((item) => (
          <Button
            key={item.district}
            variant={item.district === selected ? "primary" : "secondary"}
            onClick={() => onSelect(item.district)}
            className="shrink-0"
          >
            {item.district}
          </Button>
        ))}
      </div>

      {district ? (
        <>
          <Card>
            <CardHeader
              title={district.district}
              description={`${district.farm_count} farms · ${district.farms_with_risk} with a computed risk`}
            />
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="type-caption text-content-tertiary">Dominant crop</dt>
                <dd className="type-callout font-medium text-content">
                  {district.dominant_crop ?? "Not recorded"}
                </dd>
              </div>
              <div>
                <dt className="type-caption text-content-tertiary">Water stress</dt>
                <dd
                  className={cn(
                    "type-callout font-medium",
                    district.water_stress_level
                      ? RISK_TEXT[district.water_stress_level]
                      : "text-content-tertiary",
                  )}
                >
                  {district.water_stress_level
                    ? `${RISK_LABEL[district.water_stress_level]} (${district.water_stress_score}/100)`
                    : "Not assessed"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="type-caption text-content-tertiary">Top crops</dt>
                <dd className="type-callout font-medium text-content">
                  {district.top_crops.join(" · ") || "Not recorded"}
                </dd>
              </div>
            </dl>

            <div className="mt-4 grid grid-cols-4 gap-2 border-t border-hairline pt-4">
              {BANDS.map((band) => (
                <div key={band} className="text-center">
                  <p className={cn("type-caption font-semibold", RISK_TEXT[band])}>
                    {RISK_LABEL[band]}
                  </p>
                  <p className="type-heading type-numeric text-content">
                    {district.risk_bands[band] ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Intervention priorities"
              description="Generated by Gemini from the computed statistics above."
            />
            {interventions.data ? (
              <div className="space-y-4">
                {interventions.data.interventions.map((item) => (
                  <div key={item.action} className="border-l-2 border-accent pl-3">
                    <p className="type-callout font-semibold text-content">{item.action}</p>
                    <p className="type-caption mt-0.5 text-accent">Priority: {item.priority}</p>
                    <p className="type-callout mt-1 text-content-secondary">{item.reasoning}</p>
                  </div>
                ))}
                <p className="border-t border-hairline pt-3 type-caption text-content-tertiary">
                  {interventions.data.disclaimer}
                </p>
              </div>
            ) : interventions.isError ? (
              <ErrorState
                title="Interventions unavailable"
                detail={(interventions.error as Error).message}
              />
            ) : (
              <Button
                variant="secondary"
                block
                disabled={interventions.isPending}
                onClick={() => interventions.mutate(district.district)}
              >
                {interventions.isPending ? (
                  <Loader2 aria-hidden className="size-5 animate-spin" />
                ) : null}
                Generate intervention priorities
              </Button>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
