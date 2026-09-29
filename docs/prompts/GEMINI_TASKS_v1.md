# AgriMitra Climate — Build Task Contract for Gemini 3.1 Pro

## How to use this document

You are implementing the AgriMitra Climate hackathon extension. Work through Part 3 in order, one task at a time.

For each task:

1. Read the task's **Goal**, **Files**, **DO**, **DON'T**, and **Done when** sections in full.
2. Apply the Part 2 global rules in addition to that task's own rules. The global rules are never suspended.
3. Touch only the files listed under **Files** for that task. If you believe a change outside that scope is necessary, stop and say so instead of making it.
4. Write complete, runnable code. No stubs, no `TODO`, no placeholder returns.
5. Report what you changed and confirm the **Done when** condition before starting the next task.

The work is reviewed after every task. A task that edits out-of-scope files, leaves a stub, or fabricates data is rejected and sent back.

## Context

The repo on branch `hackathon/agri-climate` is the original AgriMitra baseline plus two documentation commits (`PRD.md`, `IMPLEMENTATION_PLAN.md`). Almost none of the climate platform described in those documents exists in code yet. The hackathon rules require a *substantial extension* of the baseline, so the gap between the documents and the source must be closed by implementation, not by documentation.

This plan does two things:

1. Records the verified state of the codebase (what exists, what is broken, what is stale).
2. Defines a sequenced task contract for Gemini 3.1 Pro. Every task states its goal, its exact file scope, an explicit **DO** list and an explicit **DON'T** list, and a definition of done. Claude verifies each task's output before the next task starts.

---

## Part 1 — Verified Codebase State

### 1.1 What actually exists and works

| Area | State |
|---|---|
| `client/` | Complete and coherent. React 19 + Vite 7 + TS + Tailwind 3 + react-router 7. `App.tsx` (347 L, splash + home + routes), 9 pages (2083 L total), 8 shadcn-style components in `client/src/components/ui/`, `cn()` helper at `client/src/lib/utils.ts`, `client/src/lib/data/schemes.json`. `client/node_modules` not installed. |
| `server/src/routes/market.routes.ts` | Real, working. Calls data.gov.in Agmarknet, sorts by modal price, returns `{query, summary, prices}`. |
| `server/src/routes/forum.routes.ts` | Real, working. Mongo CRUD against `server/src/models/post.model.ts`. |
| `server/src/config/db.ts` | Works. `MONGODB_URI` with localhost fallback. |
| `client/src/pages/WeatherPage.tsx` | Works, but calls open-meteo **directly from the browser**, bypassing the server. |
| Repo strategy (PRD §3) | Already satisfied. Remote is `git@github.com:deepaksinghh12/AgriMitra-Climate.git`, branch `hackathon/agri-climate`. No further repo surgery needed. |

### 1.2 Confirmed defects in existing code

1. **`server/src/routes/diagnose.routes.ts` hangs when the ML service is down.** The Gemini fallback body was deleted (`// Gemini Logic Removed as per request`), so when the inner `try` fails, control falls through the outer `try` and **no response is ever sent**. The client waits until timeout. `GoogleGenerativeAI` is imported but never used.
2. **`ml-service/main.py` returns fabricated diagnoses.** `startup_event` sets `CLASSIFIER = "MOCKED"` and skips model loading; `/predict` ignores the uploaded image and returns `random.choice(mock_diseases)` with `random.uniform(0.85, 0.99)` confidence. The well-written `auto_crop_image()` function is dead code. This directly violates PRD §"Never present simulated data as live data".
3. **`ml-service/model/plant_disease_model.h5` is a 133-byte Git LFS pointer**, and `git lfs` is not installed in this environment. There is no usable local model file.
4. **`ml-service/requirements.txt` is corrupt and wrong.** Last line is UTF-16-mangled (`t f _ k e r a s`). It lists `tensorflow-cpu` while the code imports `transformers`; neither `transformers` nor `torch` is listed.
5. **Hardcoded secret.** `DATA_GOV_API_KEY` is a literal string in `server/src/routes/market.routes.ts:5`.
6. **Stub routes.** `weather.routes.ts`, `schemes.routes.ts`, `voice.routes.ts` each return `"... endpoint coming soon"`.
7. **2850 `server/node_modules` files are tracked in git.** Root `.gitignore` is a leftover Next.js file: it ignores `/.next/`, `next-env.d.ts` and only root-anchored `/node_modules`, and misses `dist/`, `uploads/`, `__pycache__/`.
8. **Stale documentation.** `project_structure.md` and `build_log.txt` describe a completely different Next.js project ("Project Kisan", paths under `D:\coding\project-kisan-main`). They contradict this repo.
9. **No `.env` or `.env.example` anywhere.** No documented environment contract.
10. `client/src/pages/VoicePage.tsx` is a `setTimeout` simulation with a hardcoded cotton price.

### 1.3 Entirely missing (Plan phases 2–9, PRD F1–F14)

Models `Farmer`, `Farm`, `WeatherSnapshot`, `SatelliteSnapshot`, `FarmRisk`, `DiseaseAnalysis`; the deterministic risk engine; the crop suitability engine and `crops.json`; the Gemini advisory service; the satellite service; the district aggregator and intervention generator; the seed script; all new client screens (farm profile, risk visualizer, crop suitability, advisory, district dashboard, map); `/api/ai/chat`.

### 1.4 Locked decisions

- **Disease detection:** dual path — real local model first, escalate to Gemini Vision below 0.70 confidence (PRD F9 exactly).
- **Satellite:** provider interface with a clearly-labeled seeded NDVI dataset as the default provider; a GEE provider that activates only when credentials are present.
- **Gemini SDK (Node):** migrate to `@google/genai`, model `gemini-2.5-flash`. Remove the deprecated `@google/generative-ai` dependency.
- **Git hygiene:** full cleanup — rewrite root `.gitignore`, untrack `server/node_modules`, delete `project_structure.md` and `build_log.txt`.

---

## Part 2 — Global Rules for Gemini 3.1 Pro

These apply to **every** task below. Restate them in each delegation.

**DO**
- Write complete, runnable code. Every function fully implemented.
- Match existing style: 4-space indent in `server/`, `export default router` at the end of each route file, `async (req, res)` with `try/catch` returning `res.status(n).json({...})`.
- Keep TypeScript `strict` clean — `server/tsconfig.json` and `client/tsconfig.app.json` both set `"strict": true`, and the client additionally sets `noUnusedLocals` and `noUnusedParameters`.
- Reuse what exists: `cn()` from `@/lib/utils`, the components in `client/src/components/ui/`, `connectDB()` from `server/src/config/db`, the `VITE_API_URL || 'http://localhost:5000'` pattern already used in `client/src/pages/MarketPage.tsx`.
- Read every value that could differ per deployment from `process.env` / `import.meta.env`.
- Label any simulated, seeded or demo data explicitly in the API response (`"source": "seeded-demo"`) and in the UI.
- Degrade gracefully: if an external API or key is missing, return a valid shaped response with a `source`/`degraded` marker. Never throw an unhandled error to the client.

**DON'T**
- Don't leave `TODO`, `...`, placeholder comments, or stub returns like `{ message: "coming soon" }`.
- Don't write a code path that ends without sending a response (this is the live bug in `diagnose.routes.ts`).
- Don't hardcode API keys, URLs, or secrets in source.
- Don't let Gemini produce the numbers. Risk scores and suitability percentages are computed by deterministic TypeScript; Gemini only explains the numbers it is given.
- Don't touch files outside the stated scope of the task.
- Don't refactor, rename, reformat or "improve" working code that the task did not name.
- Don't add new dependencies beyond the ones each task names.
- Don't change `client/src/App.tsx` routes except where a task explicitly says so.
- Don't invent weather, soil, NDVI, or disease severity values in prompts or responses.

---

## Part 3 — Task Contract

Tasks are ordered. Each is independently reviewable. Claude reviews the diff after each before the next begins.

---

### T1 — Repo hygiene and environment contract

**Goal:** Make the repository clean and the environment contract explicit.

**Files:** `.gitignore` (rewrite), `server/.env.example` (new), `client/.env.example` (new), `ml-service/.env.example` (new); delete `project_structure.md`, `build_log.txt`.

**DO**
- Rewrite root `.gitignore` for this stack: `node_modules/`, `dist/`, `build/`, `.env*` (with `!.env.example`), `uploads/`, `__pycache__/`, `*.pyc`, `.venv/`, `*.tsbuildinfo`, `.vercel`, `.DS_Store`.
- Run `git rm -r --cached server/node_modules` so the 2850 tracked files stop being versioned.
- Create the three `.env.example` files listing every variable with a comment and a safe placeholder: `MONGODB_URI`, `PORT`, `ML_SERVICE_URL`, `GEMINI_API_KEY`, `DATA_GOV_API_KEY`, `OPENWEATHER_API_KEY`, `GEE_SERVICE_ACCOUNT_JSON`, `VITE_API_URL`, `VITE_GOOGLE_MAPS_API_KEY`.
- Delete `project_structure.md` and `build_log.txt`.

**DON'T**
- Don't delete `server/node_modules` from disk — only untrack it.
- Don't create real `.env` files or put any real key value in an example file.
- Don't rewrite git history, force-push, or touch `.gitattributes`.
- Don't modify `client/.gitignore` (it is already correct).

**Done when:** `git status` shows no `node_modules` paths, the two stale docs are gone, and three `.env.example` files exist covering every variable used anywhere in the codebase.

---

### T2 — Fix the hanging diagnose route and remove the hardcoded key

**Goal:** Eliminate the two live defects in existing server code.

**Files:** `server/src/routes/diagnose.routes.ts`, `server/src/routes/market.routes.ts`.

**DO**
- In `diagnose.routes.ts`: when the ML service call fails, send a real response. Return `503` with `{ error, source: "ml-service-unavailable", details }`. Delete the unused `GoogleGenerativeAI` import and the `// Gemini Logic Removed` comment.
- Guarantee the temp upload file is deleted on every path, success and failure, with `fs.existsSync` guarded `fs.unlinkSync`.
- In `market.routes.ts`: read the key from `process.env.DATA_GOV_API_KEY`. If unset, return `503` with a clear message rather than calling the API with `undefined`.

**DON'T**
- Don't add Gemini Vision here — that belongs to T9, in the ML service.
- Don't change the response shape of the success path; `client/src/pages/DiagnosisPage.tsx` already consumes `{class, confidence, recommendation}`.
- Don't change the multer config or the `/api/diagnose` mount path.
- Don't leave the old key string anywhere in the file, including in a comment.

**Done when:** stopping the ML service and posting an image returns a `503` JSON body within seconds instead of hanging, and no key literal remains in `server/src/`.

---

### T3 — Mongoose models

**Goal:** Create the six data models from PRD §15.

**Files:** `server/src/models/farmer.model.ts`, `farm.model.ts`, `weatherSnapshot.model.ts`, `satelliteSnapshot.model.ts`, `farmRisk.model.ts`, `diseaseAnalysis.model.ts`.

**DO**
- Follow the exact pattern of `server/src/models/post.model.ts`: exported `I<Name>` interface extending `Document`, a `new Schema<I<Name>>({...}, { timestamps: true })`, and `export default mongoose.model<I<Name>>('<Name>', <Name>Schema)`.
- Use the field names from PRD §15 verbatim so the API contract matches the document.
- `Farm.location` is `{ lat: Number, lng: Number }`. `Farm.soil` is a subdocument `{ type, moisture, nitrogen, phosphorus, potassium }`.
- Constrain enums where the PRD gives fixed sets: `language` ∈ `['en','hi','gu']`, `FarmRisk.level` ∈ `['LOW','MEDIUM','HIGH','CRITICAL']`, `season` ∈ `['Kharif','Rabi','Zaid']`.
- Index `Farm.district` and `Farm.farmerId`.

**DON'T**
- Don't modify `post.model.ts`.
- Don't add business logic, hooks, virtuals, or validation beyond required/enum/default.
- Don't create a single combined models file — one model per file.
- Don't create routes or controllers in this task.

**Done when:** `cd server && npx tsc --noEmit` passes and all six files exist.

---

### T4 — Farm profile API

**Goal:** CRUD endpoints for farms (PRD F1, API §14).

**Files:** `server/src/routes/farm.routes.ts` (new), `server/src/app.ts` (mount only).

**DO**
- Implement `POST /api/farms`, `GET /api/farms/:id`, `PUT /api/farms/:id`, `GET /api/farms/farmer/:farmerId`.
- Validate the request body before writing; return `400` with a field-level message on invalid input.
- Return `404` when an id is not found; handle a malformed ObjectId as `400`, not a `500`.
- In `app.ts`, add exactly one import and one `app.use('/api/farms', farmRoutes)` line.

**DON'T**
- Don't add authentication — PRD §9 lists complex auth as out of scope.
- Don't add delete endpoints; they are not in the API contract.
- Don't reorder or otherwise edit the existing route mounts in `app.ts`.
- Don't add a validation library; hand-write the checks.

**Done when:** create → fetch → update → list-by-farmer round-trips against a local MongoDB.

---

### T5 — Server-side weather service

**Goal:** Replace the `weather.routes.ts` stub with a real `GET /api/weather?lat=&lng=` (PRD F2).

**Files:** `server/src/services/weather.service.ts` (new), `server/src/routes/weather.routes.ts` (rewrite).

**DO**
- Use the open-meteo endpoints already proven in `client/src/pages/WeatherPage.tsx:35` — no key required.
- Return a normalized shape: `{ current: {temperature, humidity, rainfall, windSpeed}, forecast: [{date, tempMax, tempMin, precipitation, weatherCode}], source, fetchedAt }`, 7 days of forecast.
- Put the HTTP call in the service; keep the route thin (parse params, call service, respond).
- Return `400` when `lat` or `lng` is missing or non-numeric.
- On upstream failure, return a valid shape with `source: "unavailable"` and a `degraded: true` flag rather than a `500`.

**DON'T**
- Don't require `OPENWEATHER_API_KEY`; open-meteo is keyless. Keep the variable only as an optional future provider.
- Don't modify `client/src/pages/WeatherPage.tsx` in this task — that repoint happens in T13.
- Don't cache to MongoDB yet; `WeatherSnapshot` persistence belongs to T6's risk flow.

**Done when:** `curl 'localhost:5000/api/weather?lat=27.55&lng=76.63'` returns current conditions plus 7 forecast days.

---

### T6 — Deterministic farm risk engine

**Goal:** `GET /api/farms/:id/risk` computing the PRD F5 score in pure TypeScript.

**Files:** `server/src/services/risk.service.ts` (new), route added to `server/src/routes/farm.routes.ts`.

**DO**
- Implement five pure sub-scoring functions, each returning 0–100: `waterStress`, `heatStress`, `diseaseRisk`, `rainfallRisk`, `vegetationRisk`.
- Combine with the documented weights exactly: `0.30 water + 0.20 heat + 0.20 disease + 0.15 rainfall + 0.15 vegetation`.
- Band the result: 0–30 `LOW`, 31–60 `MEDIUM`, 61–80 `HIGH`, 81–100 `CRITICAL`.
- Return both the overall score and every sub-score, so the UI can render the breakdown gauges.
- Persist the result as a `FarmRisk` document.
- Handle missing inputs explicitly: if NDVI or a recent disease analysis is absent, use a documented neutral default and set a `assumptions: []` array in the response naming what was defaulted.

**DON'T**
- Don't call Gemini anywhere in this file. The score is deterministic — this is the PRD's central architectural rule.
- Don't invent input data. Missing input becomes a declared assumption, never a fabricated reading.
- Don't change the weights or the band boundaries.
- Don't return a score outside 0–100; clamp every sub-score.

**Done when:** the Alwar / Wheat / 2-acre / Loamy / Limited-irrigation demo farm yields a `MEDIUM` band, and the response lists all five sub-scores.

---

### T7 — Crop dataset and suitability engine

**Goal:** `POST /api/recommendations/crops` (PRD F6, F7).

**Files:** `server/src/data/crops.json` (new), `server/src/services/suitability.service.ts` (new), `server/src/routes/recommendations.routes.ts` (new), mount in `server/src/app.ts`.

**DO**
- Populate `crops.json` with all 10 crops named in the plan: Wheat, Mustard, Chickpea, Barley, Millet, Maize, Rice, Cotton, Groundnut, Sorghum.
- Use the exact record shape from PRD F7: `{crop, season[], soil[], waterRequirement, temperatureRange{min,max}, rainfallRequirement{min,max}}`.
- Score each crop 0–100 against the farm's season, soil type, water availability, temperature and rainfall; return the list sorted descending with a per-crop `matchBreakdown` explaining which factors matched.
- Keep the scoring deterministic and pure so it is unit-testable.

**DON'T**
- Don't call Gemini here — the explanation layer is T8.
- Don't generate the crop data with an LLM at runtime; it is a static committed file.
- Don't add crops beyond the 10 listed.
- Don't present the agronomic thresholds as validated science; include a `disclaimer` field in the response.

**Done when:** the Alwar Rabi loamy-soil limited-irrigation demo farm ranks Mustard and Chickpea above Wheat, and Rice near the bottom.

---

### T8 — Gemini service and agro-advisory

**Goal:** A single Gemini wrapper plus `POST /api/advisory` (PRD F8, F10).

**Files:** `server/src/services/gemini.service.ts` (new), `server/src/routes/advisory.routes.ts` (new), mount in `server/src/app.ts`, `server/package.json` (dependency swap).

**DO**
- Add `@google/genai` and remove `@google/generative-ai` from `server/package.json`.
- Expose one typed helper, e.g. `generateJSON<T>(prompt, schema, language)`, used by every Gemini caller in the codebase.
- Use `gemini-2.5-flash` with a response schema pinned to the PRD F8 shape: `{summary, risks[], actions[], irrigationAdvice, weatherAdvice, monitoringAdvice[]}`.
- Put the PRD F8 "Gemini MUST NOT" list into the system instruction verbatim: no invented weather, soil or disease values; no claimed certainty; no pesticide dosages; no posing as an agricultural authority.
- Support `en`, `hi`, `gu` output driven by the farm's `language` field.
- When `GEMINI_API_KEY` is unset, return a deterministic template advisory built from the supplied numbers, marked `source: "fallback-template"`.

**DON'T**
- Don't create a second Gemini client anywhere else — T9, T11 and T12 all import this service.
- Don't let the prompt ask Gemini for a risk score, a suitability percentage, or an NDVI value. Those are passed *in*.
- Don't parse the model output with regex or `JSON.parse` on a raw string; use the SDK's structured-output support and validate the result before returning.
- Don't log the API key or the full prompt payload.

**Done when:** posting a farm context returns valid JSON in the requested language, and the same call with `GEMINI_API_KEY` unset returns the marked fallback instead of a `500`.

---

### T9 — Real disease pipeline in the ML service

**Goal:** Replace the random mock with the PRD F9 dual path: local model, then Gemini Vision below 0.70 confidence.

**Files:** `ml-service/main.py`, `ml-service/requirements.txt`.

**DO**
- Load `linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification` via `transformers.pipeline("image-classification")` in `startup_event`, into the existing `CLASSIFIER` global.
- Re-enable the existing `auto_crop_image()` function in `/predict` and honour its `False` return by rejecting non-plant images with a clear message.
- Run the real uploaded image through the classifier. If top-1 confidence `< 0.70`, escalate to Gemini Vision and return that result instead.
- Add `"source"` to every response: `"mobilenet-v2"`, `"gemini-vision"`, or `"unavailable"`.
- Rewrite `requirements.txt` as clean UTF-8 with pinned versions covering what the code actually imports: `fastapi`, `uvicorn`, `python-multipart`, `pillow`, `numpy`, `opencv-python-headless`, `transformers`, `torch`, `google-genai`.
- If the model fails to load, keep the service up and serve Gemini Vision only, with `/health` reporting `model_loaded: false`.

**DON'T**
- Don't keep `random`, `mock_diseases`, or the `CLASSIFIER = "MOCKED"` line. Delete them.
- Don't return a diagnosis that was not derived from the submitted image.
- Don't keep `tensorflow-cpu` or the corrupt `t f _ k e r a s` line in `requirements.txt`.
- Don't attempt to load `model/plant_disease_model.h5` — it is a 133-byte LFS pointer, not a model.
- Don't change the port (8000), the CORS config, or the `/predict` and `/health` paths.
- Don't change the response keys `class`, `confidence`, `recommendation` — the client depends on them. Only add fields.

**Done when:** two visibly different leaf images produce different predictions, `/health` reports the true load state, and `pip install -r requirements.txt` succeeds from clean.

---

### T10 — Satellite service

**Goal:** `GET /api/satellite?lat=&lng=` (PRD F3).

**Files:** `server/src/services/satellite.service.ts` (new), `server/src/data/ndvi-districts.json` (new), `server/src/routes/satellite.routes.ts` (new), mount in `server/src/app.ts`.

**DO**
- Define a `SatelliteProvider` interface, then two implementations: `SeededNdviProvider` reading the committed district dataset, and `GeeProvider` used only when `GEE_SERVICE_ACCOUNT_JSON` is present and valid.
- Select the provider at startup, log which one is active.
- Return `{ndvi, vegetationHealth, vegetationStatus, satelliteDate, source}` where `source` is `"google-earth-engine"` or `"seeded-demo"`.
- Cover the 10 demo districts in `ndvi-districts.json` with plausible values and a stated observation date.

**DON'T**
- Don't ever label seeded data as live. `source` must be accurate — the PRD states this as a hard rule.
- Don't make GEE a hard dependency; the server must start without credentials.
- Don't build a custom satellite ML model (PRD §9, explicitly out of scope).
- Don't add the `earthengine-api` dependency unless the GEE provider is genuinely implemented against it.

**Done when:** the endpoint returns NDVI for Alwar with `source: "seeded-demo"` on a machine with no GEE credentials.

---

### T11 — District intelligence and interventions

**Goal:** `GET /api/district/summary` and `POST /api/district/interventions` (PRD F12, F14).

**Files:** `server/src/services/district.service.ts` (new), `server/src/routes/district.routes.ts` (new), mount in `server/src/app.ts`.

**DO**
- Aggregate seeded plus real farms per district into risk-band counts, dominant crops, water-stress level and disease occurrence.
- Compute every aggregate in TypeScript via Mongo aggregation.
- For interventions, pass the *computed* district signals to `gemini.service.ts` and request 3–5 prioritized actions.
- Include a fixed disclaimer in the intervention response: AI output is decision support, not automatic government decision.

**DON'T**
- Don't let Gemini compute or restate the aggregate counts. It receives them.
- Don't create a second Gemini client — import T8's service.
- Don't add cross-district trend analytics or historical comparison; not in MVP scope.

**Done when:** the summary returns 10 districts with band counts, and interventions returns a prioritized list for Alwar.

---

### T12 — Seed script

**Goal:** Reproducible demo data (Plan phase 9).

**Files:** `server/src/scripts/seed.ts` (new), `"seed"` script in `server/package.json`.

**DO**
- Seed 10 Rajasthan districts and 100 demo farms with realistic coordinates, crops, soils and irrigation levels.
- Include the PRD §7.1 farmer verbatim: Ravi Kumar, Alwar, 2 acres, Wheat, Loamy, Limited irrigation, language `hi`.
- Make the script idempotent — clear only the collections it seeds, then insert.
- Mark every seeded farm with `isDemo: true`.
- Print a summary of what was inserted.

**DON'T**
- Don't drop the whole database, and don't touch the `posts` collection.
- Don't run the script automatically on server start.
- Don't seed fake risk scores or advisories; those are computed on demand.

**Done when:** `npm run seed` twice in a row leaves exactly 100 demo farms across 10 districts.

---

### T13 — Client: farm profile, risk and weather repoint

**Goal:** Farmer-view screens for the new backend (Plan phase 8, items 1–2).

**Files:** `client/src/pages/FarmProfilePage.tsx` (new), `client/src/pages/FarmDashboardPage.tsx` (new), `client/src/lib/api.ts` (new), `client/src/pages/WeatherPage.tsx` (edit), `client/src/App.tsx` (routes only).

**DO**
- Create `client/src/lib/api.ts` as the single API-base helper, using the `(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')` pattern already in `MarketPage.tsx:32`.
- Build the farm profile form from PRD F1 inputs, using the existing `Input`, `Label`, `Card`, `Button` components.
- Build the dashboard: metrics grid, 7-day forecast cards, risk gauge with the five sub-scores, and an advisory trigger button.
- Repoint `WeatherPage.tsx` to `GET /api/weather` instead of calling open-meteo from the browser, keeping its existing visual layout and icon logic.
- Add exactly two `<Route>` entries in `App.tsx` and a link into the new farmer flow from the home screen.

**DON'T**
- Don't introduce a state library, a data-fetching library, or a form library. `useState` + `fetch`, matching existing pages.
- Don't restyle or restructure existing pages beyond the `WeatherPage` fetch repoint.
- Don't add new `@radix-ui` packages — build from the eight components already in `client/src/components/ui/`.
- Don't break the existing splash screen or the home-screen grid in `App.tsx`.

**Done when:** `cd client && npm run build` passes, and a farm can be created and its risk breakdown viewed end to end.

---

### T14 — Client: crop suitability, advisory and district view

**Goal:** Remaining screens (Plan phase 8, items 3–6).

**Files:** `client/src/pages/CropSuitabilityPage.tsx`, `AdvisoryPage.tsx`, `DistrictDashboardPage.tsx` (all new), `client/src/App.tsx` (routes only).

**DO**
- Crop suitability: ranked cards with match percentage, factor breakdown, and the Gemini explanation.
- Advisory: render the F8 JSON sections with a visible language switch for `en`/`hi`/`gu`.
- District dashboard: risk-band counts, per-district detail, and the intervention panel.
- Use the PRD F13 risk colors consistently: LOW green, MEDIUM yellow, HIGH orange, CRITICAL red.
- Show a clear loading state and a clear error state for every fetch.
- Badge any response whose `source` is `"seeded-demo"` or `"fallback-template"` as demo data in the UI.

**DON'T**
- Don't add the Google Maps component in this task; it is T15.
- Don't duplicate the API-base logic — import from `client/src/lib/api.ts`.
- Don't hardcode district names in the client; read them from `/api/district/summary`.

**Done when:** all three screens render live backend data and the client build passes.

---

### T15 — Google Maps district layer (P1, last)

**Goal:** PRD F13 map.

**Files:** `client/src/components/DistrictMap.tsx` (new), used by `DistrictDashboardPage.tsx`.

**DO**
- Read the key from `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`.
- Render district markers colored by risk band.
- If the key is absent, render a labeled static fallback panel instead of a broken map.
- Keep it simple, per PRD F13.

**DON'T**
- Don't block any other feature on this task; it is the last item.
- Don't add custom GIS tiling, polygon editing, or drawing tools.
- Don't fail the build when the key is missing.

**Done when:** the map renders with colored district markers, and degrades to the fallback panel with no key.

---

## Part 4 — Verification

Claude verifies after each task; the full pass runs after T15.

**Build gates**
```bash
cd server && npx tsc --noEmit && npm run build
```
```bash
cd client && npm install && npm run build
```
```bash
cd ml-service && pip install -r requirements.txt && python -c "import main"
```

**Service startup**
```bash
cd server && npm run seed && npm run dev
```

**End-to-end, per Plan §5.2**
1. Create the Alwar / Wheat / 2 acres / Loamy / Limited-irrigation farm.
2. `GET /api/weather?lat=27.55&lng=76.63` returns 7 forecast days.
3. `GET /api/farms/:id/risk` returns `MEDIUM` with all five sub-scores.
4. `POST /api/recommendations/crops` ranks Mustard and Chickpea above Wheat.
5. Upload two different leaf images to `/api/diagnose` — predictions differ, `source` is accurate.
6. `POST /api/advisory` with `language: "hi"` returns Hindi JSON in the F8 shape.
7. `GET /api/district/summary` returns 10 districts; interventions returns a prioritized list.

**Degradation checks** — each must return a valid shaped response, never a hang or a `500`:
```bash
curl -s -o /dev/null -w '%{http_code} %{time_total}\n' -F image=@leaf.jpg localhost:5000/api/diagnose
```
- ML service stopped → `503` in seconds (the T2 fix).
- `GEMINI_API_KEY` unset → advisory returns `source: "fallback-template"`.
- No GEE credentials → satellite returns `source: "seeded-demo"`.
- `DATA_GOV_API_KEY` unset → market returns `503` with a clear message.

**Hygiene check**
```bash
git status --short && git ls-files | grep -c node_modules
```
Expect `0`.

**Honesty audit** — grep the finished tree for fabrication:
```bash
grep -rn "random\|mock\|MOCKED\|coming soon" server/src ml-service/main.py client/src
```
Every remaining hit must be seeded data that is explicitly labeled in its API response.
