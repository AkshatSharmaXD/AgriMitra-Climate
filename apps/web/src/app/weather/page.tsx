"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import * as React from "react";
import { Droplets, MapPin, Search, Wind } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { api } from "@/lib/api";
import { useActiveFarmId } from "@/lib/active-farm";
import { formatDate, formatDay, formatTime, weatherLabel } from "@/lib/format";

export default function WeatherPage() {
  const { farmId } = useActiveFarmId();
  const [query, setQuery] = React.useState("");
  const [place, setPlace] = React.useState<{
    label: string;
    lat: number;
    lng: number;
  } | null>(null);

  const farm = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => api.getFarm(farmId!),
    enabled: Boolean(farmId) && !place,
  });

  const location =
    place ??
    (farm.data
      ? {
          label: `${farm.data.district}, ${farm.data.state}`,
          lat: farm.data.location.lat,
          lng: farm.data.location.lng,
        }
      : null);

  const weather = useQuery({
    queryKey: ["weather", location?.lat, location?.lng],
    queryFn: () => api.getWeather(location!.lat, location!.lng),
    enabled: Boolean(location),
  });

  const [searchError, setSearchError] = React.useState<string | null>(null);

  async function search(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setSearchError(null);
    try {
      const found = await api.geocode(query.trim());
      setPlace({
        label: [found.name, found.admin1].filter(Boolean).join(", "),
        lat: found.lat,
        lng: found.lng,
      });
    } catch (error) {
      setSearchError((error as Error).message);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Weather"
        provenance={
          weather.data && !weather.data.degraded ? (
            <ProvenanceBadge
              provenance="live"
              label="Open-Meteo"
              detail={formatTime(weather.data.fetched_at)}
            />
          ) : undefined
        }
      />

      <form onSubmit={search} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a place"
          aria-label="Search a place"
          className="min-h-tap flex-1 rounded-md border border-hairline bg-surface-raised px-3.5 type-body text-content placeholder:text-content-tertiary focus:border-accent"
        />
        <Button type="submit" size="icon" aria-label="Search">
          <Search aria-hidden className="size-5" />
        </Button>
      </form>

      {searchError ? <ErrorState title="Place not found" detail={searchError} /> : null}

      {!location && !farmId ? (
        // No farm registered and no place searched yet. An indefinite skeleton
        // here reads as a hung page, because nothing is actually loading.
        <EmptyState
          icon={MapPin}
          title="Search for a place"
          description="Or register your farm to see weather for your own field every time you open this."
          action={
            <Button asChild variant="secondary">
              <Link href="/farm/new">Register your farm</Link>
            </Button>
          }
        />
      ) : !location ? (
        <Skeleton className="h-48 w-full" />
      ) : weather.isPending ? (
        <Skeleton className="h-48 w-full" />
      ) : weather.isError || weather.data?.degraded ? (
        <ErrorState
          variant="offline"
          title="Weather service did not respond"
          detail="No reading is shown rather than a placeholder. Try again in a moment."
          action={
            <Button variant="secondary" onClick={() => weather.refetch()}>
              Retry
            </Button>
          }
        />
      ) : (
        <>
          <Card>
            <CardHeader title={location.label} />
            <div className="flex items-baseline gap-3">
              <span className="type-display type-numeric text-content">
                {Math.round(weather.data!.current!.temperature_c)}°
              </span>
              <span className="type-heading text-content-secondary">
                {weatherLabel(weather.data!.current!.weather_code)}
              </span>
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-hairline pt-4">
              <div>
                <dt className="type-caption flex items-center gap-1 text-content-tertiary">
                  <Droplets aria-hidden className="size-3.5" /> Humidity
                </dt>
                <dd className="type-heading type-numeric text-content">
                  {weather.data!.current!.humidity_pct}%
                </dd>
              </div>
              <div>
                <dt className="type-caption flex items-center gap-1 text-content-tertiary">
                  <Wind aria-hidden className="size-3.5" /> Wind
                </dt>
                <dd className="type-heading type-numeric text-content">
                  {Math.round(weather.data!.current!.wind_speed_kmh)}
                  <span className="type-caption font-normal text-content-tertiary"> km/h</span>
                </dd>
              </div>
              <div>
                <dt className="type-caption text-content-tertiary">7-day rain</dt>
                <dd className="type-heading type-numeric text-content">
                  {weather.data!.rainfall_mm_7d ?? 0}
                  <span className="type-caption font-normal text-content-tertiary"> mm</span>
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="7-day forecast" />
            <ul className="divide-y divide-hairline">
              {weather.data!.forecast.map((day) => (
                <li key={day.date} className="flex items-center gap-3 py-3">
                  <span className="type-callout w-12 shrink-0 font-medium text-content">
                    {formatDay(day.date)}
                  </span>
                  <span className="type-caption w-14 shrink-0 text-content-tertiary">
                    {formatDate(day.date)}
                  </span>
                  <span className="type-callout flex-1 text-content-secondary">
                    {weatherLabel(day.weather_code)}
                  </span>
                  <span className="type-caption type-numeric w-14 text-right text-accent">
                    {day.precipitation_mm.toFixed(1)}mm
                  </span>
                  <span className="type-callout type-numeric w-16 shrink-0 text-right text-content">
                    {Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
