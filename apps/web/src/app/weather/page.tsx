"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import * as React from "react";
import { Droplets, MapPin, Search, Wind, CloudSun, AlertTriangle, Loader2 } from "lucide-react";

import { api } from "@/lib/api";
import { useActiveFarmId } from "@/lib/active-farm";
import { formatDate, formatDay, formatTime, weatherLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

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
    <div className="font-sans min-h-screen bg-[#f5f5f5]">
      {/* PMFBY-style green header for the page */}
      <div className="bg-[#1b3a1b] py-6 px-4 md:px-8 border-b-4 border-yellow-400 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="mx-auto max-w-[1400px] w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
              <CloudSun className="size-8 text-yellow-300" />
              Weather Information System (WINDS)
            </h1>
            <p className="text-white/80 mt-1 text-sm">Real-time localized forecast and agricultural weather alerts.</p>
          </div>
          
          <form onSubmit={search} className="flex gap-2 w-full md:w-auto min-w-[300px]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search district or village..."
              className="flex-1 rounded-lg border-2 border-transparent focus:border-yellow-400 bg-white/10 text-white px-4 py-2 text-sm placeholder:text-white/50 outline-none transition-all"
            />
            <button type="submit" className="bg-yellow-400 text-[#1b3a1b] px-4 py-2 rounded-lg font-bold hover:bg-yellow-300 transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-8">
        {searchError && (
          <div className="mb-6 bg-red-100 border-2 border-red-400 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="size-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">Location not found</p>
              <p className="text-xs text-red-700">{searchError}</p>
            </div>
          </div>
        )}

        {!location && !farmId ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-200">
            <MapPin className="size-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-800 mb-2">No location selected</h2>
            <p className="text-gray-500 mb-6">Search for a location above or register your farm to see the forecast.</p>
            <Link href="/farm/new" className="bg-[#2e7d32] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#1b5e20]">
              Register Farm
            </Link>
          </div>
        ) : weather.isPending ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="size-12 animate-spin text-[#2e7d32]" />
            <p className="font-bold text-gray-500 text-lg">Fetching weather data...</p>
          </div>
        ) : weather.isError || weather.data?.degraded ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center shadow-md">
            <CloudSun className="size-16 text-red-300 mx-auto mb-4" />
            <h2 className="text-xl font-black text-red-800 mb-2">Forecast Unavailable</h2>
            <p className="text-red-700 text-sm mb-4">
              {weather.isError ? (weather.error as Error).message : "The weather service is temporarily unavailable."}
            </p>
            <button onClick={() => weather.refetch()} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold">
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Current Conditions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden h-full flex flex-col">
                <div className="bg-[#023e8a] p-5 text-white">
                  <p className="text-xs text-blue-200 font-bold tracking-wider uppercase mb-1">Current Location</p>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <MapPin className="size-5 text-yellow-400 shrink-0" />
                    {location.label}
                  </h2>
                  <p className="text-xs text-blue-100 mt-2">
                    Updated: {formatTime(weather.data.fetched_at)}
                  </p>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  {weather.data.current ? (
                    <div className="text-center my-auto">
                      <p className="text-7xl font-black text-gray-800 tracking-tighter">
                        {Math.round(weather.data.current.temperature_c)}°
                      </p>
                      <p className="text-lg font-bold text-blue-600 mt-2">
                        {weatherLabel(weather.data.current.weather_code)}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-8 border-t border-gray-100 pt-6">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <Droplets className="size-5 text-blue-500 mx-auto mb-1" />
                          <p className="text-xs text-gray-500 font-bold mb-0.5">Humidity</p>
                          <p className="text-lg font-black text-gray-900">{weather.data.current.humidity_pct}%</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <Wind className="size-5 text-gray-500 mx-auto mb-1" />
                          <p className="text-xs text-gray-500 font-bold mb-0.5">Wind</p>
                          <p className="text-lg font-black text-gray-900">{Math.round(weather.data.current.wind_speed_kmh)}<span className="text-sm">km/h</span></p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center my-auto">Current conditions not available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-[#2e7d32] p-5 text-white flex justify-between items-center">
                  <h2 className="text-lg font-black">7-Day Agricultural Forecast</h2>
                  <span className="bg-green-700 px-3 py-1 rounded-full text-xs font-bold text-green-100">Daily Average</span>
                </div>
                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                          <th className="p-4 font-bold border-b border-gray-200">Date</th>
                          <th className="p-4 font-bold border-b border-gray-200">Condition</th>
                          <th className="p-4 font-bold border-b border-gray-200 text-center">High / Low</th>
                          <th className="p-4 font-bold border-b border-gray-200 text-right">Rainfall</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {weather.data.forecast.map((day) => (
                          <tr key={day.date} className="hover:bg-green-50 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-gray-900">{formatDay(day.date)}</p>
                              <p className="text-xs text-gray-500">{formatDate(day.date)}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <CloudSun className="size-5 text-gray-400" />
                                <span className="font-medium text-gray-700">{weatherLabel(day.weather_code)}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className="font-black text-gray-900 mr-2">{Math.round(day.temp_max)}°</span>
                              <span className="text-gray-400 font-medium">{Math.round(day.temp_min)}°</span>
                            </td>
                            <td className="p-4 text-right">
                              {day.precipitation_mm > 0 ? (
                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-bold">
                                  <Droplets className="size-3" />
                                  {day.precipitation_mm.toFixed(1)} mm
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs font-medium">0 mm</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
