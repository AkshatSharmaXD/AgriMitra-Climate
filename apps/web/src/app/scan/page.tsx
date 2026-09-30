"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import * as React from "react";
import { Camera, ImageUp, Loader2, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useActiveFarmId } from "@/lib/active-farm";
import { isCropSupported } from "@/lib/crop-support";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

// Demo diseased leaf images from real agricultural sources
const DEMO_LEAVES = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Late_blight_on_potato_leaf.JPG/640px-Late_blight_on_potato_leaf.JPG",
    label: "Late Blight - Potato",
    severity: "High"
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Tomato_leaf_with_bacterial_speck.jpg/640px-Tomato_leaf_with_bacterial_speck.jpg",
    label: "Bacterial Speck - Tomato",
    severity: "Medium"
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Rice_Blast_Symptoms_on_Leaves.JPG/640px-Rice_Blast_Symptoms_on_Leaves.JPG",
    label: "Rice Blast",
    severity: "Critical"
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Septoria_leaf_spot_on_wheat.jpg/640px-Septoria_leaf_spot_on_wheat.jpg",
    label: "Septoria Leaf Spot - Wheat",
    severity: "Medium"
  }
];

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

  const supportedCropsQuery = useQuery({
    queryKey: ["diagnosis-supported-crops"],
    queryFn: () => api.getSupportedCrops(),
    staleTime: 10 * 60 * 1000,
  });
  const supportedCrops = supportedCropsQuery.data?.supported_crops ?? [];

  const farmQuery = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => api.getFarm(farmId as string),
    enabled: farmId != null,
  });
  const farmCrop = farmQuery.data?.crop ?? null;
  const farmCropSupported =
    farmCrop != null && supportedCrops.length > 0
      ? isCropSupported(farmCrop, supportedCrops)
      : null;

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
    event.target.value = "";
    if (!file) return;

    setGuardError(null);
    diagnose.reset();

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
    <div className="mx-auto max-w-[1400px] w-full pt-8 pb-12 px-4 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">🔬 AI Crop Disease Scanner</h1>
        <p className="text-white/80 text-sm max-w-2xl">Photograph an affected leaf. The AI will identify the possible disease and provide guidance. This is a possible identification, not a clinical diagnosis.</p>
      </div>

      {supportedCrops.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-6 text-white/90 text-xs">
          <strong>Supported Crops:</strong> {supportedCrops.map((crop) => (crop === "Corn" ? "Maize (Corn)" : crop)).join(", ")}
        </div>
      )}

      {farmCrop != null && farmCropSupported === false && (
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="size-5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800 font-medium">
            Your crop ({farmCrop}) is not one this scanner was trained on. The result will likely be uncertain.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Upload Zone */}
        <div>
          {!preview ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col items-center justify-center gap-3 min-h-[200px] cursor-pointer rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 p-6 text-center group">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    className="sr-only"
                    onChange={handleFile}
                  />
                  <div className="size-16 rounded-full bg-[#00b4d8] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="size-8" />
                  </div>
                  <span className="font-bold text-gray-800 text-lg">Camera</span>
                  <span className="text-xs text-gray-500">Take a photo of the leaf</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-3 min-h-[200px] cursor-pointer rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 p-6 text-center group">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleFile}
                  />
                  <div className="size-16 rounded-full bg-[#9d4edd] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageUp className="size-8" />
                  </div>
                  <span className="font-bold text-gray-800 text-lg">Gallery</span>
                  <span className="text-xs text-gray-500">Upload from your device</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative aspect-[4/3] w-full bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="The leaf you photographed" className="size-full object-cover" />
                {diagnose.isPending && (
                  <div className="absolute inset-0 grid place-items-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2 text-white">
                      <Loader2 className="size-10 animate-spin" />
                      <p className="font-bold text-lg">Analysing…</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {guardError && (
            <div className="mt-4 bg-red-100 border-2 border-red-400 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="size-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-800 font-medium">{guardError}</p>
            </div>
          )}

          {diagnose.isError && (
            <div className="mt-4 bg-red-100 border-2 border-red-400 rounded-xl p-4">
              <p className="text-sm text-red-800 font-bold mb-2">Analysis failed</p>
              <p className="text-xs text-red-700">{(diagnose.error as Error).message}</p>
              <button onClick={reset} className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700">
                Try another photo
              </button>
            </div>
          )}

          {result && (
            notPlant ? (
              <div className="mt-4 bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6">
                <h3 className="font-black text-lg text-yellow-800 mb-2">No plant found in this photo</h3>
                <p className="text-sm text-yellow-700 mb-4">Fill the frame with a single leaf, in daylight, against a plain background.</p>
                <button onClick={reset} className="bg-yellow-500 text-black px-6 py-2.5 rounded-xl font-bold hover:bg-yellow-600 flex items-center gap-2">
                  <RotateCcw className="size-4" /> Take another photo
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-black text-xl text-gray-800">Possible: {prettyLabel(result.label)}</h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">{result.source}</span>
                  </div>
                  {result.confidence != null && (
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-black text-gray-800">{Math.round(result.confidence * 100)}%</span>
                        <span className="text-sm text-gray-500">model confidence</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-[#2e7d32] transition-all" style={{ width: `${Math.round(result.confidence * 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-2">Guidance</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{result.guidance}</p>
                </div>

                <div className="bg-gray-100 rounded-2xl p-4">
                  <p className="text-xs text-gray-500">{result.disclaimer}</p>
                </div>

                <button onClick={reset} className="w-full bg-[#2e7d32] text-white py-3 rounded-xl font-bold hover:bg-[#1b5e20] flex items-center justify-center gap-2">
                  <RotateCcw className="size-4" /> Scan another leaf
                </button>
              </div>
            )
          )}
        </div>

        {/* Right: Demo Gallery of Diseased Leaves */}
        <div>
          <h2 className="text-xl font-black text-white mb-4">📸 Example Diseased Leaves</h2>
          <p className="text-white/80 text-xs mb-6">These are real examples of crop diseases detected by our AI scanner. Upload a similar image to get instant analysis.</p>
          <div className="grid grid-cols-2 gap-4">
            {DEMO_LEAVES.map((leaf) => (
              <div key={leaf.label} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group">
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={leaf.src} 
                    alt={leaf.label} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <p className="font-bold text-gray-800 text-sm">{leaf.label}</p>
                  <span className={cn(
                    "inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                    leaf.severity === "Critical" && "bg-red-100 text-red-700",
                    leaf.severity === "High" && "bg-orange-100 text-orange-700",
                    leaf.severity === "Medium" && "bg-yellow-100 text-yellow-700"
                  )}>
                    {leaf.severity} Severity
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
