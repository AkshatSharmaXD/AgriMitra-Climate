"use client";

import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { Camera, ImageUp, Loader2, RotateCcw } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ProvenanceBadge } from "@/components/ui/provenance-badge";
import { ErrorState } from "@/components/ui/states";
import { api } from "@/lib/api";
import { useActiveFarmId } from "@/lib/active-farm";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/** Turns a model label like `Tomato___Early_blight` into `Tomato — Early blight`. */
function prettyLabel(label: string): string {
  const [crop, ...rest] = label.split("___");
  const disease = rest.join(" ").replace(/_/g, " ").trim();
  if (!disease) return (crop ?? label).replace(/_/g, " ");
  return `${crop} — ${disease}`;
}

export default function ScanPage() {
  const { farmId } = useActiveFarmId();
  const [preview, setPreview] = React.useState<string | null>(null);
  const [guardError, setGuardError] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const diagnose = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("image", file);
      if (farmId) form.append("farm_id", farmId);
      return api.diagnose(form);
    },
  });

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // so picking the same file twice re-triggers
    if (!file) return;

    setGuardError(null);
    diagnose.reset();

    // Guard before upload — the server validates too, but failing here is faster
    // and costs the farmer no data.
    if (!ALLOWED.includes(file.type)) {
      setGuardError("Use a JPEG, PNG or WebP photo.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setGuardError(
        `That photo is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 5MB.`,
      );
      return;
    }

    setPreview(URL.createObjectURL(file));
    diagnose.mutate(file);
  }

  function reset() {
    setPreview(null);
    setGuardError(null);
    diagnose.reset();
  }

  const result = diagnose.data;
  const notPlant = result?.label === "not_a_plant";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leaf scan"
        description="Photograph an affected leaf. The result is a possible identification, not a diagnosis."
      />

      {!preview ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex min-h-[8rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-hairline bg-surface-raised p-4 active:scale-[0.99]">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="sr-only"
              onChange={handleFile}
            />
            <Camera aria-hidden className="size-7 text-accent" strokeWidth={1.75} />
            <span className="type-callout font-medium text-content">Camera</span>
          </label>
          <label className="flex min-h-[8rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-hairline bg-surface-raised p-4 active:scale-[0.99]">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFile}
            />
            <ImageUp aria-hidden className="size-7 text-accent" strokeWidth={1.75} />
            <span className="type-callout font-medium text-content">Gallery</span>
          </label>
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="relative aspect-[4/3] w-full bg-surface-sunken">
            {/* Object URL, so next/image optimisation is bypassed deliberately. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="The leaf you photographed" className="size-full object-cover" />
            {diagnose.isPending ? (
              <div className="absolute inset-0 grid place-items-center bg-surface/70 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 aria-hidden className="size-8 animate-spin text-accent" />
                  <p className="type-callout font-medium text-content">Analysing…</p>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      )}

      {guardError ? <ErrorState title="Photo not accepted" detail={guardError} /> : null}

      {diagnose.isError ? (
        <ErrorState
          title="Analysis failed"
          detail={(diagnose.error as Error).message}
          action={
            <Button variant="secondary" onClick={reset}>
              Try another photo
            </Button>
          }
        />
      ) : null}

      {result ? (
        notPlant ? (
          <Card>
            <CardHeader
              title="No plant found in this photo"
              description="Fill the frame with a single leaf, in daylight, against a plain background."
            />
            <Button variant="secondary" block onClick={reset}>
              <RotateCcw aria-hidden className="size-4" />
              Take another photo
            </Button>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader
                title={`Possible: ${prettyLabel(result.label)}`}
                action={
                  <ProvenanceBadge
                    provenance={result.source === "seeded-demo" ? "demo" : "live"}
                    label={result.source}
                  />
                }
              />
              {/* Confidence is a number with a bar, never a fabricated severity band.
                  The previous client hardcoded `severity: "Medium"` (audit A5). */}
              <div className="flex items-baseline gap-2">
                <span className="type-title type-numeric text-content">
                  {Math.round(result.confidence * 100)}%
                </span>
                <span className="type-callout text-content-secondary">model confidence</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.round(result.confidence * 100)}%` }}
                />
              </div>
            </Card>

            <Card>
              <CardHeader title="Guidance" />
              <p className="type-callout text-content">{result.guidance}</p>
            </Card>

            <Card className="bg-surface-sunken">
              <p className="type-caption text-content-secondary">{result.disclaimer}</p>
            </Card>

            {farmId ? (
              <p className="type-caption text-content-tertiary">
                Saved to your farm. Your disease risk now uses this reading instead of
                the neutral baseline.
              </p>
            ) : null}

            <Button variant="secondary" block onClick={reset}>
              <RotateCcw aria-hidden className="size-4" />
              Scan another leaf
            </Button>
          </>
        )
      ) : null}
    </div>
  );
}
