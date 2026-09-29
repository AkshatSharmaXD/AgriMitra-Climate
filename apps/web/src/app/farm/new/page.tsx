"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Loader2, LocateFixed } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Segmented } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { type Language, type Season } from "@/lib/api";
import { api } from "@/lib/api";
import { writeActiveFarmId } from "@/lib/active-farm";

const LANGUAGES = [
  { value: "en" as Language, label: "English" },
  { value: "hi" as Language, label: "हिन्दी" },
  { value: "gu" as Language, label: "ગુજરાતી" },
  { value: "te" as Language, label: "తెలుగు" },
] as const;

const SEASONS = [
  { value: "Kharif" as Season, label: "Kharif" },
  { value: "Rabi" as Season, label: "Rabi" },
  { value: "Zaid" as Season, label: "Zaid" },
] as const;

const SOILS = ["Loamy", "Clay Loam", "Sandy Loam", "Sandy", "Clay"] as const;
const IRRIGATION = ["Good irrigation", "Well irrigated", "Limited irrigation", "Rainfed"] as const;
const LEVELS = [
  { value: "Low" as const, label: "Low" },
  { value: "Medium" as const, label: "Medium" },
  { value: "High" as const, label: "High" },
] as const;

type Level = "Low" | "Medium" | "High";

const STEPS = ["You", "Location", "Crop", "Soil", "Water"] as const;

/** Indian mobile, with or without +91 — mirrors the Pydantic pattern on the server. */
const PHONE = /^(\+91)?[6-9]\d{9}$/;

/** Farmers type numbers with spaces or hyphens for readability; the server pattern doesn't allow either. */
function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}

export default function NewFarmPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [language, setLanguage] = React.useState<Language | null>("en");

  const [lat, setLat] = React.useState("");
  const [lng, setLng] = React.useState("");
  const [state, setState] = React.useState("Rajasthan");
  const [district, setDistrict] = React.useState("");
  const [locating, setLocating] = React.useState(false);
  const [locateError, setLocateError] = React.useState<string | null>(null);
  const [resolvedPlace, setResolvedPlace] = React.useState<string | null>(null);

  const [crop, setCrop] = React.useState("");
  const [season, setSeason] = React.useState<Season | null>("Rabi");
  const [area, setArea] = React.useState("");

  const [soilType, setSoilType] = React.useState<string | null>(null);
  const [moisture, setMoisture] = React.useState<Level | null>(null);
  const [nitrogen, setNitrogen] = React.useState<Level | null>(null);
  const [phosphorus, setPhosphorus] = React.useState<Level | null>(null);
  const [potassium, setPotassium] = React.useState<Level | null>(null);

  const [irrigation, setIrrigation] = React.useState<string | null>(null);

  // Validated as the farmer types, not on submit.
  const errors = {
    name: name.length > 0 && name.trim().length < 2 ? "Enter your full name." : undefined,
    phone:
      phone.length > 0 && !PHONE.test(normalizePhone(phone))
        ? "A 10-digit Indian mobile number, optionally with +91."
        : undefined,
    lat:
      lat.length > 0 && (Number.isNaN(+lat) || Math.abs(+lat) > 90)
        ? "Latitude must be between -90 and 90."
        : undefined,
    lng:
      lng.length > 0 && (Number.isNaN(+lng) || Math.abs(+lng) > 180)
        ? "Longitude must be between -180 and 180."
        : undefined,
    area:
      area.length > 0 && (Number.isNaN(+area) || +area <= 0)
        ? "Area must be greater than zero."
        : undefined,
  };

  const stepComplete = [
    name.trim().length >= 2 && PHONE.test(normalizePhone(phone)) && Boolean(language),
    Boolean(lat && lng && !errors.lat && !errors.lng && district.trim() && state.trim()),
    Boolean(crop.trim() && season && area && !errors.area),
    Boolean(soilType),
    Boolean(irrigation),
  ];

  function detectLocation() {
    setLocateError(null);
    setResolvedPlace(null);

    if (!window.isSecureContext) {
      // Browsers only expose geolocation over HTTPS or on localhost. Without
      // this check the API is simply absent and the button looks broken.
      setLocateError(
        "Location sharing needs a secure (https) connection. Enter the coordinates below.",
      );
      return;
    }
    if (!("geolocation" in navigator)) {
      setLocateError("This browser cannot share a location. Enter the coordinates below.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLat(latitude.toFixed(4));
        setLng(longitude.toFixed(4));

        // Coordinates alone left the farmer to type their district and state,
        // so the step stayed incomplete and the button appeared to do nothing.
        try {
          const place = await api.reverseGeocode(latitude, longitude);
          if (place.district) setDistrict(place.district);
          if (place.state) setState(place.state);
          setResolvedPlace(
            [place.district, place.state].filter(Boolean).join(", ") || "your location",
          );
        } catch {
          setLocateError(
            "Got your coordinates, but could not identify the district. Please type it below.",
          );
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        setLocateError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was declined. Enter the coordinates below instead."
            : error.code === error.TIMEOUT
              ? "Getting a location fix took too long. Try again outdoors, or type the coordinates."
              : "Your location could not be determined. Enter the coordinates below.",
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }

  const create = useMutation({
    mutationFn: async () => {
      // A real farmer record first — the previous client hardcoded a fake
      // ObjectId on every farm it created (audit B12).
      const farmer = await api.createFarmer({
        name: name.trim(),
        phone: normalizePhone(phone),
        language: language!,
      });

      return api.createFarm({
        farmer_id: farmer._id,
        location: { lat: +lat, lng: +lng },
        state: state.trim(),
        district: district.trim(),
        area_acres: +area,
        crop: crop.trim(),
        season: season!,
        soil: {
          type: soilType!,
          moisture,
          nitrogen,
          phosphorus,
          potassium,
        },
        irrigation: irrigation!,
        is_demo: false,
      });
    },
    onSuccess: (farm) => {
      writeActiveFarmId(farm._id);
      router.push("/");
    },
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Register your farm" backHref="/onboarding" />

      {/* Where am I in this flow, and how much is left. */}
      <ol className="flex gap-1.5" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((label, index) => (
          <li key={label} className="flex-1 space-y-1.5">
            <div
              className={`h-1 rounded-full transition-colors duration-200 ${
                index <= step ? "bg-accent" : "bg-surface-sunken"
              }`}
            />
            <span
              className={`type-caption ${
                index === step ? "font-semibold text-content" : "text-content-tertiary"
              }`}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      <Card className="space-y-5">
        {step === 0 ? (
          <>
            <Field label="Your name" htmlFor="name" error={errors.name}>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                invalid={Boolean(errors.name)}
                autoComplete="name"
                placeholder="Ravi Kumar"
              />
            </Field>
            <Field
              label="Mobile number"
              htmlFor="phone"
              hint="Used only to identify your farm record."
              error={errors.phone}
            >
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                invalid={Boolean(errors.phone)}
                autoComplete="tel"
                placeholder="9876543210"
              />
            </Field>
            <Field label="Preferred language" htmlFor="language">
              <Segmented
                name="Preferred language"
                options={LANGUAGES}
                value={language}
                onChange={setLanguage}
              />
            </Field>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Button variant="secondary" size="lg" block onClick={detectLocation} disabled={locating}>
              {locating ? (
                <Loader2 aria-hidden className="size-5 animate-spin" />
              ) : (
                <LocateFixed aria-hidden className="size-5" />
              )}
              Use my current location
            </Button>
            <p className="type-caption text-content-tertiary">
              Your location is used to fetch weather and satellite data for this field. It
              is stored with your farm record and sent nowhere else.
            </p>
            {resolvedPlace ? (
              <p className="rounded-md bg-accent-soft px-3 py-2 type-callout font-medium text-accent">
                Located: {resolvedPlace}. Check the fields below and correct anything wrong.
              </p>
            ) : null}
            {locateError ? (
              <ErrorState variant="offline" title="Location unavailable" detail={locateError} />
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude" htmlFor="lat" error={errors.lat}>
                <Input
                  id="lat"
                  inputMode="decimal"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  invalid={Boolean(errors.lat)}
                  placeholder="27.5500"
                />
              </Field>
              <Field label="Longitude" htmlFor="lng" error={errors.lng}>
                <Input
                  id="lng"
                  inputMode="decimal"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  invalid={Boolean(errors.lng)}
                  placeholder="76.6300"
                />
              </Field>
            </div>
            <Field label="District" htmlFor="district">
              <Input
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Alwar"
              />
            </Field>
            <Field label="State" htmlFor="state">
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
            </Field>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Field label="Crop" htmlFor="crop">
              <Input
                id="crop"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="Wheat"
              />
            </Field>
            <Field label="Season" htmlFor="season">
              <Segmented name="Season" options={SEASONS} value={season} onChange={setSeason} />
            </Field>
            <Field label="Area in acres" htmlFor="area" error={errors.area}>
              <Input
                id="area"
                inputMode="decimal"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                invalid={Boolean(errors.area)}
                placeholder="2"
              />
            </Field>
          </>
        ) : null}

        {step === 3 ? (
          <>
            {/* PRD F4: manual entry only. Gemini must never populate these. */}
            <p className="type-caption rounded-md bg-surface-sunken px-3 py-2 text-content-secondary">
              Entered by you. AgriMitra never estimates a soil measurement on your behalf.
            </p>
            <Field label="Soil type" htmlFor="soil">
              <Segmented
                name="Soil type"
                options={SOILS.map((s) => ({ value: s, label: s }))}
                value={soilType}
                onChange={setSoilType}
              />
            </Field>
            <Field label="Moisture" htmlFor="moisture" hint="Optional. Sharpens water stress.">
              <Segmented
                name="Moisture"
                options={LEVELS}
                value={moisture}
                onChange={setMoisture}
                allowClear
              />
            </Field>
            <Field label="Nitrogen" htmlFor="n" hint="Optional.">
              <Segmented name="Nitrogen" options={LEVELS} value={nitrogen} onChange={setNitrogen} allowClear />
            </Field>
            <Field label="Phosphorus" htmlFor="p" hint="Optional.">
              <Segmented name="Phosphorus" options={LEVELS} value={phosphorus} onChange={setPhosphorus} allowClear />
            </Field>
            <Field label="Potassium" htmlFor="k" hint="Optional.">
              <Segmented name="Potassium" options={LEVELS} value={potassium} onChange={setPotassium} allowClear />
            </Field>
          </>
        ) : null}

        {step === 4 ? (
          <Field label="Irrigation available" htmlFor="irrigation">
            <Segmented
              name="Irrigation"
              options={IRRIGATION.map((i) => ({ value: i, label: i }))}
              value={irrigation}
              onChange={setIrrigation}
            />
          </Field>
        ) : null}

        {create.isError ? (
          <ErrorState title="Could not save your farm" detail={(create.error as Error).message} />
        ) : null}

        <div className="flex gap-3 pt-2">
          {step > 0 ? (
            <Button variant="secondary" size="lg" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button
              size="lg"
              block
              disabled={!stepComplete[step]}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button
              size="lg"
              block
              disabled={!stepComplete[step] || create.isPending}
              onClick={() => create.mutate()}
            >
              {create.isPending ? (
                <Loader2 aria-hidden className="size-5 animate-spin" />
              ) : null}
              Save farm
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
