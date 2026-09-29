/**
 * Whether the leaf scanner's model was trained on a given crop.
 *
 * The disease model calls maize "Corn" (its PlantVillage-derived label set),
 * while the app's own crop dataset (data/crops.json) calls it "Maize". Without
 * this mapping a farmer growing maize — the one crop actually covered — would
 * be wrongly told their crop is unsupported. Keep the alias table here, in one
 * place, rather than scattering `=== "Corn" || === "Maize"` checks around
 * the UI.
 */
const CROP_ALIASES: Record<string, string> = {
  maize: "corn",
};

function normalize(crop: string): string {
  const lower = crop.trim().toLowerCase();
  return CROP_ALIASES[lower] ?? lower;
}

export function isCropSupported(crop: string, supportedCrops: string[]): boolean {
  const target = normalize(crop);
  return supportedCrops.some((supported) => normalize(supported) === target);
}
