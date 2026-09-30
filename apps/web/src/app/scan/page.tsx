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

const DEMO_LEAVES = [
  {
    src: "/leaf1.png",
    label: "Late Blight - Potato",
    severity: "High"
  },
  {
    src: "/leaf2.png",
    label: "Bacterial Speck - Tomato",
    severity: "Medium"
  },
  {
    src: "/leaf3.png",
    label: "Rice Blast",
    severity: "Critical"
  },
  {
    src: "/leaf4.png",
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
      setGuardError(`That photo is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 5MB.`);
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    diagnose.mutate(file);
  }

  return (
    <div className="font-sans min-h-screen bg-[#f5f5f5]">
      {/* PMFBY-style green header for the page */}
      <div className="bg-[#1b3a1b] py-6 px-4 md:px-8 border-b-4 border-yellow-400">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="text-2xl md:text-3xl font-black text-white">AI Crop Disease Scanner</h1>
          <p className="text-white/80 mt-1 text-sm">Upload a photo to instantly diagnose crop diseases and get remedies.</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Upload / Preview */}
          <div className="space-y-6">
            {!preview ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-[#2e7d32] text-white p-4">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Camera className="size-5" /> Submit Crop Photo
                  </h2>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-[#2e7d32]/30 rounded-xl hover:bg-green-50 transition-colors cursor-pointer group">
                      <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={handleFile} />
                      <div className="size-16 rounded-full bg-[#2e7d32]/10 text-[#2e7d32] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="size-8" />
                      </div>
                      <span className="font-bold text-gray-800 text-center">Use Camera</span>
                    </label>
                    <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-[#2e7d32]/30 rounded-xl hover:bg-green-50 transition-colors cursor-pointer group">
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFile} />
                      <div className="size-16 rounded-full bg-[#2e7d32]/10 text-[#2e7d32] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ImageUp className="size-8" />
                      </div>
                      <span className="font-bold text-gray-800 text-center">Upload File</span>
                    </label>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-6 font-medium">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-[#2e7d32] text-white p-4 flex justify-between items-center">
                  <h2 className="font-bold text-lg">Photo Analysis</h2>
                  <button onClick={() => setPreview(null)} className="text-white hover:text-yellow-300 text-sm font-bold flex items-center gap-1">
                    <RotateCcw className="size-4" /> Retake
                  </button>
                </div>
                <div className="relative aspect-[4/3] bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="The leaf you photographed" className="size-full object-cover" />
                  {diagnose.isPending && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                      <Loader2 className="size-12 animate-spin mb-4" />
                      <p className="font-bold text-xl">Analyzing...</p>
                      <p className="text-sm text-white/80 mt-2">Checking against 38 diseases</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {guardError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="size-5 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-800 font-bold">{guardError}</p>
              </div>
            )}
            {diagnose.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="size-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-red-800 font-bold">Analysis Failed</p>
                  <p className="text-xs text-red-600 mt-1">{(diagnose.error as Error).message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results / Status / Demo */}
          <div className="space-y-6">
            
            {/* If Results Present */}
            {diagnose.data?.disease && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className={cn("p-4 text-white", diagnose.data.disease.confidence > 0.8 ? "bg-[#b91c1c]" : "bg-[#d4a017]")}>
                  <h2 className="font-black text-xl flex items-center gap-2">
                    <AlertTriangle className="size-6" /> Detection Result
                  </h2>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Identified Disease</p>
                    <p className="text-2xl font-black text-gray-900 leading-tight">{prettyLabel(diagnose.data.disease.label)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-700">Confidence: {(diagnose.data.disease.confidence * 100).toFixed(1)}%</span>
                      {diagnose.data.disease.confidence < 0.6 && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">Low Confidence</span>}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-600 pl-4">
                      <p className="text-sm font-bold text-gray-900 mb-1">Recommended Action</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{diagnose.data.advisory.action}</p>
                    </div>
                    {diagnose.data.advisory.remedy && (
                      <div className="border-l-4 border-green-600 pl-4">
                        <p className="text-sm font-bold text-gray-900 mb-1">Chemical Remedy</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{diagnose.data.advisory.remedy}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* If healthy / no disease */}
            {diagnose.data && !diagnose.data.disease && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-[#2e7d32] p-4 text-white">
                  <h2 className="font-black text-xl flex items-center gap-2">
                    <CheckCircle2 className="size-6" /> Healthy Crop
                  </h2>
                </div>
                <div className="p-6 text-center">
                  <div className="size-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="size-10 text-[#2e7d32]" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-2">No diseases detected</p>
                  <p className="text-sm text-gray-600">The crop appears to be healthy based on this image. Keep monitoring regularly.</p>
                </div>
              </div>
            )}

            {/* Demo Section (only when no scan) */}
            {!diagnose.data && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4">Sample Diseased Leaves</h3>
                <div className="grid grid-cols-2 gap-4">
                  {DEMO_LEAVES.map((demo) => (
                    <div key={demo.label} className="group cursor-pointer">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-200 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={demo.src} alt={demo.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <p className="text-xs font-bold text-gray-800 leading-tight group-hover:text-[#2e7d32] transition-colors">{demo.label}</p>
                      <p className="text-[10px] text-red-600 font-bold">{demo.severity} Risk</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Farm Context Status */}
            {farmCropSupported === false && !diagnose.data && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800 font-bold mb-1">Crop not fully supported</p>
                <p className="text-xs text-yellow-700 leading-relaxed">
                  You are registered as growing <strong>{farmCrop}</strong>, but our AI scanner is currently optimized for other crops. 
                  You can still upload an image, but accuracy may vary.
                </p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
