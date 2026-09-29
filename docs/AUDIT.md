# AgriMitra Climate — code audit against PRD.md and PRD_UPDATED.md

Date: 2026-09-29
Scope: the full repository at commit `6ca2d53`, checked against `docs/PRD.md` and
`docs/PRD_UPDATED.md` (v2.0 adds §13A, the Google technology inventory; the rest of
the two documents is identical).

Severity key: **S1** breaks the build or ships wrong information to a farmer ·
**S2** violates a stated PRD rule · **S3** missing requirement · **S4** polish.

---

## A. Fabricated or misrepresented data

PRD §16 is categorical — *"Never represent simulated information as live data"* — and
PRD §19 requires hedged language because agricultural advice affects livelihoods.
These were the most serious findings.

| # | Severity | Location | Finding |
|---|---|---|---|
| A1 | **S1** | `server/src/services/satellite.service.ts` `GeeProvider` | Returned hard-coded `ndvi: 0.8`, `vegetationHealth: 0.85` tagged `source: "google-earth-engine"` with today's date, whenever any credentials string was present. Invented numbers presented as a live Sentinel observation. |
| A2 | **S1** | `client/src/pages/VoicePage.tsx` | Fake microphone: a timer pretends to listen, injects a question the user never asked, then answers *"The average price of Cotton in your region is ₹5,800 per quintal."* A fabricated market price stated as fact. Footer also claims "English & Gujarati supported" for a feature that does not exist. |
| A3 | **S1** | `client/src/App.tsx` "Top Agri News" | Three hardcoded headlines with invented attributions ("AgriNews Today", "Weather Dept", "Market Watch") and invented timestamps ("2 hours ago"). Reads as a live news feed. |
| A4 | **S2** | `client/src/pages/SubscriptionPage.tsx` | "● SATELLITE LINK ESTABLISHED", "SENTINEL-2 FEED", fixed coordinates and an NDVI legend overlaid on a stock Unsplash photograph. Presents decoration as a live satellite feed. |
| A5 | **S2** | `client/src/pages/DiagnosisPage.tsx` | `severity: "Medium"` was hardcoded for every result regardless of the prediction, then displayed as "Severity: Medium". Also rendered the raw class name as a definite finding, where PRD §19 requires "Possible disease". |
| A6 | **S2** | `client/src/pages/SchemesPage.tsx` `handleVoiceSearch` | Fake voice search — a timer that injects the literal string `"Insurance"`. |
| A7 | **S2** | `client/src/pages/ShopPage.tsx` | Invented prices against real trade names (IFFCO, BAYER, CORTEVA, Sumitomo) with no demo labelling. |
| A8 | **S3** | throughout the client | PRD §16 requires a visible `Demo Dataset` label. Only `AdvisoryPage` had one; the district dashboard, satellite values and seeded farm records had none. |

## B. Correctness bugs

| # | Severity | Location | Finding |
|---|---|---|---|
| B1 | **S1** | `server/src/services/risk.service.ts` `calculateDiseaseRisk` | Mapped *any* prediction confidence straight onto disease risk. A 0.95-confidence **healthy** leaf produced a disease risk of 95/100; the ML service's "Not a plant" rejection (confidence `1.0`) produced 100/100. The seed script stores exactly such a `healthy` record at confidence 0.85, so the demo data triggered it. |
| B2 | **S2** | `server/src/services/risk.service.ts` `calculateHeatStress` | Discontinuous at the 30 °C breakpoint: 30.0 °C → 30, 30.1 °C → 40.8. A tenth of a degree moved the score ten points. |
| B3 | **S1** | `server/src/services/suitability.service.ts` + `CropSuitabilityPage.tsx` | Unit mismatch. `crops.json` states `rainfallRequirement` in **mm per season** (300–2500). The client passed Open-Meteo `current.precipitation`, which is **mm in the last hour** (typically 0). Every crop permanently scored "significantly below optimal range" and the rainfall criterion was dead. |
| B4 | **S2** | `CropSuitabilityPage.tsx` | `rainfall: weatherData.current?.rainfall \|\| 100` — falsy-coalescing turned a genuine 0 mm reading into a fabricated 100 mm. Same pattern for `temperature ... \|\| 25`. |
| B5 | **S2** | `risk.service.ts` via `weather.service.ts` | On weather failure the service returns all-zero readings; the risk engine consumed them as measurements, so an outage read as "0 °C, no rain" and silently changed the score. No assumption was recorded. |
| B6 | **S1** | `server/src/scripts/seed.ts` | Constructed `DiseaseAnalysis` without the schema-required `crop` and `source` fields, and passed a `recommendation` field that is not in the schema. Mongoose validation rejects it, so `npm run seed` fails at the first disease record. |
| B7 | **S2** | `server/src/routes/diagnose.routes.ts` | Imports `form-data`, which is not declared in `server/package.json`. It resolves today only because it is hoisted as a transitive dependency of `axios`; a clean or deduped install breaks the route. |
| B8 | **S2** | `server/scripts/seed.js` | A committed compiled artefact duplicating `src/scripts/seed.ts`, importing from `../src/...`. Two seed scripts that can drift apart. |
| B9 | **S2** | `client/src/components/DistrictMap.tsx` | Marker icons requested from `http://chart.apis.google.com/chart` — a Google service retired years ago, over plain HTTP, so it is both dead and mixed-content-blocked on any HTTPS deployment. |
| B10 | **S3** | `farm.routes.ts` `/:id/risk` | Read `SatelliteSnapshot` for vegetation risk, but nothing in the codebase ever wrote one. Vegetation risk was permanently the neutral 50 default. |
| B11 | **S3** | `DiagnosisPage.tsx` | Diagnosis results were never persisted with a `farmId`, so disease risk was permanently the neutral 30 default. The PRD's leaf-scan → risk → advisory loop never closed. |
| B12 | **S2** | `client/src/pages/FarmProfilePage.tsx` | Hardcoded `farmerId: "650000000000000000000000"`, a non-existent ObjectId, on every farm created through the UI. |
| B13 | **S3** | `recommendations.routes.ts` | Non-async handler returning `res.status(400).json(...)`; typed as `void`, unlike the sibling routes which annotate `Promise<any>`. Fragile under stricter Express types. |
| B14 | **S4** | `suitability.service.ts` | Unused `fileURLToPath` import in a CommonJS build. |
| B15 | **S4** | `client/src/App.tsx` | Quick-actions row is `grid-cols-4` with five children, so "My Farm" wrapped to an orphan second row. |

## C. Security gaps against PRD §18

| # | Severity | Finding |
|---|---|---|
| C1 | **S2** | `app.use(cors())` with no options — every origin allowed. PRD requires CORS restriction. |
| C2 | **S2** | No rate limiting on any route, including the Gemini-backed `/api/advisory` and `/api/district/interventions`. |
| C3 | **S2** | `multer({ dest: 'uploads/' })` with no `limits` and no MIME check. PRD requires file-upload validation and an image size limit. |
| C4 | **S2** | No security headers (no Helmet or equivalent). |
| C5 | **S3** | No `/health` endpoint on the Node service, so no Cloud Run liveness probe. |
| C6 | **S2** | `ml-service/main.py` sets `allow_origins=["*"]` together with `allow_credentials=True` — a combination browsers reject, and wide open regardless. |

## D. ml-service

| # | Severity | Finding |
|---|---|---|
| D1 | **S1** | `requirements.txt` pins `google-genai==0.3.0`, but `main.py` uses `genai.Client(...)`, `from google.genai import types` and `types.GenerateContentConfig` — all of which require `google-genai>=1.0`. The Gemini Vision fallback raises `AttributeError` at import/callime. |
| D2 | **S2** | `os.getenv("GEMINI_API_KEY")` is read, but nothing loads a `.env` and `python-dotenv` is not a dependency, so the documented `ml-service/.env` is never read. |
| D3 | **S3** | `model/plant_disease_model.h5` is tracked via Git LFS and never loaded; the service uses a Hugging Face `transformers` pipeline. There is no TensorFlow in `requirements.txt`. The PRD's "MobileNetV2" claim is satisfied by the HF model, but the dead 
`.h5` is misleading weight in the repository. |
| D4 | **S2** | No upload size or type validation on `/predict`. |
| D5 | **S4** | `"Not a plant"` returns `confidence: 1.0`, which fed B1. |

## E. Missing PRD requirements

| # | PRD ref | Finding |
|---|---|---|
| E1 | §14 | `POST /api/ai/chat` specified, never implemented. |
| E2 | F10 / F11 | `voice.routes.ts` and `schemes.routes.ts` were `"coming soon"` stubs. No Speech-to-Text or Text-to-Speech anywhere. |
| E3 | F6 | "Gemini explains why a crop received its score" — the suitability endpoint had no Gemini explanation step. |
| E4 | F12 | The district dashboard had no state-level roll-up ("Districts analyzed: 10 / Low 4 / Medium 3 …"); only a per-district view. |
| E5 | F1 / F4 | The farm profile form collected no farmer name, language, season or soil moisture/N/P/K, all of which the PRD lists as inputs. |
| E6 | §21 | No landing screen ("Start Farm Assessment"). The root route was the legacy AgriMitra home. |
| E7 | §13 | Recharts listed in the required stack, absent from `client/package.json`. |
| E8 | F8 | `monitoringAdvice` was fetched from the advisory API and never rendered. |
| E9 | §23 | No test suite of any kind in any service. |
| E10 | §13A | No Docker, no CI, no Cloud Run configuration, no Secret Manager usage, no structured logging. |

---

## What has been fixed in this change

Ported into `services/api` (FastAPI) with regression tests in `services/api/tests`
(22 passing):

- **B1** — `disease_risk()` now recognises healthy / non-plant labels; a confident
  "healthy" *lowers* risk. Four tests pin this.
- **B2** — `heat_stress()` rebuilt as a continuous piecewise-linear function;
  continuity and monotonicity are asserted.
- **B3, B4** — suitability takes an explicit `seasonal_rainfall_mm` measured over a
  comparable window, sourced from the Open-Meteo **archive** API. A missing value
  marks the criterion *unscored* rather than failed, and never substitutes a number.
- **B5** — degraded weather drops heat and rainfall from the weighted score, records
  an assumption, and renormalises the remaining weights.
- **A1** — `EarthEngineProvider` performs a real Sentinel-2 NDVI reduction or raises.
  The demo provider self-labels `is_live: false` with a `notice`.
- **C1–C5** — explicit CORS allowlist, `slowapi` rate limiting, security-header
  middleware, upload MIME and byte-size validation, `/health` with a truthful
  capability report.
- **B6, B8** — the broken seed and its committed compiled duplicate are gone; the
  Beanie documents carry `is_demo` on every seeded collection.
- **B10, B11** — `/farms/{id}/risk` fetches and persists a satellite snapshot when
  none exists, and `/diagnosis` writes a `DiseaseAnalysis` against the farm, closing
  the scan → risk → advisory loop.
- **A8** — `ProvenanceBadge` in the web app, with `is_live` / `is_demo` / `degraded`
  surfaced through the API types so a screen cannot render a measurement without
  having the data needed to label it.

## What remains for the build agent

Everything in `docs/prompts/GEMINI_BUILD_PROMPT.md`: the Next.js screens, the voice
assistant rebuilt on real Web Speech + Gemini, the seed script, the inference service
upgrade (D1–D5), Docker/CI/Cloud Run, and the remaining PRD gaps in section E.
