# Build contract — AgriMitra Climate v2

**Target model:** Gemini 3.1 Pro (High reasoning)
**Repository:** `AgriMitra/` on branch `hackathon/agri-climate`
**Role:** you are the implementing engineer. The architecture, the design system and
the audit below are settled decisions. Build against them; do not relitigate them.

---

## 0. How to use this document

Read all of it before writing code. Then work through §7 in order — the phases are
sequenced so that each one compiles and runs on its own.

Three rules override everything else in this document:

1. **Never present simulated data as real.** PRD §16. If a value did not come from a
   real measurement, the API must say so in its payload and the UI must render a
   `<ProvenanceBadge provenance="demo">` beside it. When in doubt, show less.
2. **Deterministic logic computes; Gemini explains.** PRD F5/F6. Scores, rankings and
   aggregates are produced in `services/api/app/domain/`. Gemini receives those
   numbers and narrates them. Gemini never invents a measurement or a ranking.
3. **Do not weaken an existing test to make new code pass.** `services/api/tests`
   currently has 22 passing tests that pin real bug fixes. If a change breaks one,
   the change is wrong.

### 0.1 How to work

The phases in §7 are sequenced so each one compiles and runs on its own. Work them
one at a time.

**The loop for every phase:**

1. Read the existing code you are about to touch. Do not guess an interface — open
   the file. `services/api/app/` and `apps/web/src/lib/api.ts` are the contracts.
2. Write the code.
3. Run the gate before moving on. A phase is not finished until its gate is green:
   - Python: `cd services/api && .venv/bin/python -m pytest && .venv/bin/ruff check .`
   - Web: `cd apps/web && npm run typecheck && npm run lint && npm run build`
4. Commit that phase on its own, with a message that says what changed and why.
5. Only then start the next phase.

**Non-negotiable working rules:**

- **Never skip the gate because the change "looks obviously correct".** Every bug in
  `docs/AUDIT.md` looked obviously correct to whoever wrote it.
- **Never batch six phases into one giant diff.** If a gate fails, you must be able
  to tell which change caused it.
- **Do not leave a phase half-done and move on.** A screen that renders but has no
  error state, no empty state and no loading state is not done — it is three bugs
  waiting for a demo.
- **When the spec here and the code disagree, stop and say so.** Do not silently pick
  one. Report the contradiction and what you chose.
- **When something is blocked, finish everything that is not blocked**, then state
  plainly what you left out and why. Do not quietly narrow the scope.
- **Report failures honestly.** If tests fail, paste the failing output. Never
  describe work as complete when a gate is red.

### 0.2 Approach — what to use, what not to use

These are settled. Do not substitute your own preference.

**Backend — use**

- `async def` end to end. Every I/O call is awaited; `httpx.AsyncClient`, Motor, and
  the Gemini `client.aio` interface are already used this way.
- Pydantic v2 models for every request and response body. Validation lives in the
  schema, not in hand-written `if` blocks inside the route.
- Pure functions in `app/domain/`. They take plain arguments and return dataclasses.
  **They never touch the database, the network, or `Settings`.** That is what makes
  them testable, and it is why the 22 tests exist.
- `HTTPException` with a message a farmer could read.
- `structlog` for logging.

**Backend — do not use**

- **No blocking I/O in an async route.** No `requests`, no `time.sleep`, no
  synchronous `pymongo`. One blocking call stalls the whole event loop.
- **No business logic in a route handler.** Routes parse, delegate to `app/domain/`,
  and serialise. If a route grows a formula, it is in the wrong file.
- **No bare `except:` and no `except Exception: pass`.** Catch the specific error.
  A swallowed exception is how the old code turned a dead weather API into
  "0 °C, no rain".
- **No `or` as a default for a numeric value.** `rainfall or 100` treats a real
  `0.0` reading as missing and fabricates `100`. That exact line is audit finding
  B4. Use `if value is None`.
- **No mutable default arguments**, and no module-level mutable state outside the
  explicit `lru_cache` providers already in place.
- **No new secret with a working default.** A missing key degrades to a labelled
  fallback; it never silently uses something that happens to work.

**Frontend — use**

- **React Server Components by default.** Add `"use client"` only when the file
  actually needs state, an effect, or a browser API. The tab bar and `RiskStratum`
  need it; a static card does not.
- TanStack Query for every client-side fetch, through `apps/web/src/lib/api.ts`.
- Radix primitives for anything with focus management — dialog, select, tabs,
  tooltip. Do not hand-roll a focus trap.
- `motion/react` for animation, with the springs specified in §5.5.
- Tailwind classes bound to the design tokens. `cn()` from `@/lib/utils` for merging.
- Zod for form validation, mirroring the Pydantic schema on the server.

**Frontend — do not use**

- **No hardcoded colour.** No hex, no `rgb()`, no Tailwind palette class
  (`bg-green-600`, `text-red-500`). Every colour comes from the tokens in
  `globals.css`. This is checkable: `grep -rE "#[0-9a-fA-F]{6}|bg-(red|green|blue|yellow|orange)-[0-9]" apps/web/src/components` must return nothing.
- **No second UI kit.** No MUI, no Chakra, no Ant, no shadcn wholesale import. The
  primitives in §7.1 are built on Radix against these tokens.
- **No CSS-in-JS**, no `styled-components`, no inline `style` for anything a token
  covers. Inline `style` is allowed only for a computed value — a bar's height, a
  stratum's width.
- **No `any`.** No `@ts-ignore`. `tsconfig.json` sets `strict` and
  `noUncheckedIndexedAccess`; keep both.
- **No `useEffect` for data fetching.** That is what TanStack Query is for.
- **No `setTimeout` that simulates work.** The old splash screen blocked the app for
  2.8 seconds and the old voice page faked listening for 3. Both are audit findings.
- **No spinner on a blank screen.** Skeletons shaped like the incoming content.
- **No `maximum-scale=1` or `user-scalable=no`.** Pinch-zoom is an accessibility
  affordance.
- **No CSS transition on a gesture-driven element.** It cannot be grabbed and
  reversed mid-flight. Use a spring.

**Both — do not use**

- **No new dependency without a reason you can state in one line.** The stack in §2
  is sufficient for everything in §7.
- **No commented-out code, no `TODO` left behind, no dead file.** If it is not used,
  delete it.
- **No copying from `legacy/`.** Read it to understand the behaviour, then write the
  new implementation against the current contracts. Every file in there carries at
  least one audit finding.

---

## 1. What the product is

An AI climate-smart agriculture platform for small and marginal farmers in Rajasthan,
plus a district-level view for agricultural officers. It fuses weather, satellite
vegetation, soil, crop data and leaf images into one weekly decision for one specific
field.

Two audiences, one system:

```
Farmer view                     Agriculture Intelligence view
  my field this week              10 districts, risk hotspots, interventions
```

The full product requirements are in `docs/PRD.md` (v1.0) and `docs/PRD_UPDATED.md`
(v2.0 — identical plus §13A, the Google technology inventory). Where this document
and the PRD disagree on implementation detail, this document wins; where they
disagree on *product intent*, the PRD wins.

---

## 2. Repository layout

```
AgriMitra/
├── apps/
│   └── web/                     Next.js 15 (App Router, TypeScript, Tailwind)
│       ├── src/app/             routes
│       ├── src/components/      ui/ charts/ layout/
│       ├── src/lib/api.ts       typed client — already written, extend don't replace
│       └── src/styles/globals.css   design tokens — already written, DO NOT restyle
├── services/
│   ├── api/                     FastAPI — core domain API  (partially built)
│   │   ├── app/domain/          pure logic: risk, suitability, districts
│   │   ├── app/integrations/    gemini, weather, satellite
│   │   ├── app/api/v1/routes/
│   │   ├── app/models/documents.py   Beanie/Mongo documents
│   │   └── tests/               22 passing regression tests
│   └── inference/               FastAPI — vision / leaf disease  (needs work, §7.4)
├── packages/                    shared contracts (OpenAPI → TS), currently empty
├── data/                        crops.json, ndvi-districts.json, schemes.json
├── docs/                        PRD.md, PRD_UPDATED.md, AUDIT.md, prompts/
├── infra/                       docker/, github/workflows/  (to be filled, §7.6)
└── legacy/                      the previous Express + Vite implementation
                                 — REFERENCE ONLY. Read it to port behaviour.
                                 Delete it in the final phase. Never import from it.
```

**Stack:** Next.js 15 / React 19 / TypeScript / Tailwind / Motion (Framer) ·
FastAPI / Pydantic v2 / Beanie / Motor / MongoDB · Google Gemini · Google Earth Engine ·
Google Maps Platform · Cloud Run.

---

## 3. What already exists (do not rebuild)

| Path | State |
|---|---|
| `services/api/app/core/config.py` | Settings, placeholder detection, capability flags |
| `services/api/app/core/paths.py` | Resolves `data/` |
| `services/api/app/core/database.py` | Motor + Beanie lifecycle |
| `services/api/app/domain/risk.py` | Farm risk engine, bugs fixed, tested |
| `services/api/app/domain/suitability.py` | Crop suitability, unit bug fixed, tested |
| `services/api/app/domain/districts.py` | District + state aggregation |
| `services/api/app/integrations/weather.py` | Open-Meteo forecast, archive, geocode |
| `services/api/app/integrations/satellite.py` | Real GEE provider + honest demo provider |
| `services/api/app/integrations/gemini.py` | Structured-output client, safety instruction |
| `services/api/app/api/v1/routes/*` | weather, satellite, farms, recommendations, advisory, diagnosis, districts |
| `services/api/app/main.py` | CORS allowlist, rate limiting, security headers, `/health` |
| `apps/web/src/styles/globals.css` | **The design system.** Read §5. Do not restyle. |
| `apps/web/src/lib/api.ts` | Typed client for every endpoint above |
| `apps/web/src/components/layout/app-shell.tsx` | Bottom tab bar |
| `apps/web/src/components/ui/provenance-badge.tsx` | The data-honesty primitive |
| `apps/web/src/components/charts/risk-stratum.tsx` | **The signature visual.** §5.4 |

---

## 4. The audit you are inheriting

`docs/AUDIT.md` lists 45 findings against the previous implementation. The domain-logic
and security items are fixed. **These remain open and are your responsibility** —
each is referenced by its audit ID:

- **A2** Fake voice assistant that fabricates a cotton price. Rebuild per §7.3.
- **A3** Fake "Top Agri News" feed. Do not port it. Nothing replaces it.
- **A4** Fake "SENTINEL-2 FEED" overlay in the subscription page. Do not port it.
- **A5** Hardcoded `severity: "Medium"` on every diagnosis. Per §7.4.
- **A6** Fake voice search in the schemes page. Real Web Speech API or no microphone.
- **A7** Invented prices against real trade names. If the shop is ported at all, every
  price carries a demo badge and no real brand is used with an invented price.
- **B9** Dead `chart.apis.google.com` marker icons. Use `AdvancedMarkerElement`.
- **B12** Hardcoded fake `farmerId`. Create a real `Farmer` first (§7.2).
- **D1–D5** Inference service. Per §7.4.
- **E1–E10** Missing PRD requirements, covered across §7.

---

## 5. Design system — read before writing any component

### 5.1 The thesis

*This is a field instrument, not a dashboard.* It is read outdoors, in direct
Rajasthan sun, on a low-end Android phone, by someone who may be reading Hindi or
Gujarati. Every decision follows from that.

Consequences, which are not negotiable:

- **Light appearance is the primary design.** Dark is the considered variant. Do not
  invert this. A dark "premium SaaS dashboard" is the wrong instrument for a field.
- **Body text is 17px minimum** (`--content` on `--surface` = 15.3:1).
- **Touch targets are 44px minimum** (`min-h-tap` / `min-w-tap`).
- **Layout spacing is in `rem`**, so the user's text-size setting scales the layout
  with the text instead of breaking it.
- **Never rely on colour alone.** Every risk band carries its word ("High") and its
  number as well as its fill.

### 5.2 Colour — three systems that never overlap

One colour means one thing (`color.md › Best practices`). All values live in
`apps/web/src/styles/globals.css` as CSS variables and are exposed through Tailwind.
**Never hardcode a hex value in a component.**

| System | Tailwind | Used for | Never used for |
|---|---|---|---|
| Accent — stepwell teal | `accent`, `accent-soft`, `accent-content` | interactive elements only | decoration, status |
| Risk ramp — earth tones | `risk-low` … `risk-critical`, `-fill`, `-wash` | the computed farm-risk band | anything not a risk band |
| NDVI ramp | `ndvi-0` … `ndvi-4` | an actual NDVI value being shown | general charting |
| Provenance | `provenance-live/demo/stale` | the `ProvenanceBadge` only | anything else |

The risk ramp is deliberately **not** traffic lights. It runs canopy green → dry loam
→ scorched → burnt soil, because the subject is land, not a traffic signal. Each band
has a separate `-fill` (for areas) and base token (for text), because the medium fill
`#b3891b` is only 3.0:1 and cannot carry small text; `--risk-medium` `#8a6914` is
4.7:1 and can.

### 5.3 Typography

System font stack, plus Noto Sans Devanagari and Noto Sans Gujarati in the fallback
chain so Hindi and Gujarati render with matched metrics rather than a substituted
face. Load them through `next/font/google` with `display: "swap"`.

Use the `.type-*` classes, never ad-hoc font sizes. Tracking is size-specific —
`.type-display` is `-0.028em`, `.type-caption` is `+0.012em` — because one
`letter-spacing` value is wrong at one end of the scale or the other.

Any figure that can be compared down a column gets `.type-numeric` (tabular numerals).

### 5.4 The signature element

`RiskStratum` (`components/charts/risk-stratum.tsx`) renders the farm's risk as a
**soil core**: five stacked strata whose *widths* are the weight each factor actually
carried and whose *heights* are that factor's sub-score. A farmer already reads land
in section; this shows the risk the same way.

Crucially it plots **contribution, not raw score**, so the picture answers "what is
driving this number" — which five independent progress bars, the previous design,
cannot. When the weather API is down, the heat and rainfall strata are *absent* from
the figure, not drawn at zero.

This is the one place the design spends its boldness. Everything around it stays
quiet: flat surfaces, hairline borders, no gradients, no glow, no accent colour on
anything non-interactive.

### 5.5 Motion

Use `motion/react`. Defaults, from Apple's *Designing Fluid Interfaces*:

| Interaction | Spring |
|---|---|
| Anything reporting a value | `{ type: "spring", bounce: 0, duration: 0.4 }` |
| Sheet / drawer, after a drag | `{ type: "spring", bounce: 0.2, duration: 0.3 }` |
| Reposition | `{ type: "spring", bounce: 0, duration: 0.4 }` |

Rules:

- Feedback fires on **pointer-down**, not on click.
- Bounce is earned only by a gesture that carried momentum. A card that merely
  appeared does not overshoot.
- Drags track the pointer 1:1 via Pointer Events with `setPointerCapture`, respecting
  the grab offset. Never animate only on release.
- Every animation is interruptible and animates from the **current** on-screen value.
- Honour `useReducedMotion()`: cross-fade instead of slide, and drop overshoot. The
  globals stylesheet already handles the CSS half.

### 5.6 Materials

`.material-chrome` (translucent + `backdrop-filter`) belongs to floating chrome only —
the tab bar, a sheet header. Never behind reading content. Never stack two translucent
surfaces. Where content meets floating chrome, use `.scroll-edge-mask` rather than a
1px divider. `prefers-reduced-transparency` is already handled in the stylesheet.

### 5.7 Copy

- Labels say what happens: "Save farm", not "Submit".
- A diagnosis is always "Possible: Early blight", never "Early blight" (PRD §19).
- Errors say what broke and what to do: "Weather service did not respond. Risk is
  shown without heat and rainfall." — not "Something went wrong".
- Never apologise, never use jargon, never say "simply".
- Empty states name the next action.

---

## 6. API contract

Base: `http://localhost:8000/api/v1`. Interactive docs at `/docs`.

```http
GET  /health                                 → capabilities: gemini, earth_engine, market_data

GET  /weather?lat=&lng=                      → current + 7-day + rainfall_mm_7d + degraded
GET  /weather/seasonal-rainfall?lat=&lng=&season=
GET  /weather/geocode?q=

GET  /satellite?lat=&lng=&district=          → ndvi, is_live, captured_on, source

POST /farms                                  → create
GET  /farms/{id}
PUT  /farms/{id}
GET  /farms/{id}/risk                        → score + level + weights + assumptions + sources

POST /recommendations/crops                  → ranked crops + unscored_criteria + disclaimer
POST /advisory                               → Gemini narrative, or labelled fallback
POST /diagnosis                              (multipart) → label, confidence, guidance, disclaimer

GET  /districts/overview                     → state roll-up + every district
GET  /districts/summary
POST /districts/{district}/interventions     → Gemini interventions + disclaimer
```

**You must add** (§7.3, §7.5): `POST /chat` (PRD §14 `/api/ai/chat`),
`POST /recommendations/crops/explain`, `GET /schemes`, `GET /market`.

Every payload carrying a measurement also carries its provenance. `apps/web/src/lib/api.ts`
already types this and the types make it non-optional — keep it that way.

---

## 7. Work phases

### 7.1 — Finish the web foundation

- `npm install` in `apps/web`. Add `next-themes`; wire the `dark` class.
- Add a `QueryClientProvider` (TanStack Query) and use it for every fetch. Set
  `staleTime` to 5 minutes for weather, 1 hour for satellite.
- Build the primitives in `components/ui/`: `Button`, `Card`, `Field`, `Select`,
  `Sheet`, `Skeleton`, `EmptyState`, `ErrorState`. Use Radix for anything with
  focus-management. Every one uses the design tokens; none introduces a colour.
- `components/layout/page-header.tsx`: title, optional back affordance, optional
  provenance slot.
- **Loading is never a spinner on a blank screen.** Use `Skeleton` shaped like the
  content that is coming (`loading.md`).

### 7.2 — Screens

Routes under `apps/web/src/app/`. Five tabs already exist in `AppShell`.

**`/onboarding`** (PRD §21 Screen 1 — E6)
One screen, not a carousel. Headline, one sentence, `Start farm assessment`. Launch
straight into it when no farm is stored; never show a splash timer. The legacy app's
2.8-second forced splash is a latency bug, not branding — do not port it.

**`/farm/new`** (PRD F1, F4 — fixes E5, B12)
Progressive form, one decision per step, with a visible step indicator:
1. Farmer name, phone, preferred language (en / hi / gu / te) → `POST /farmers`,
   which you must add. This replaces the hardcoded fake ObjectId (B12).
2. Location — Google Maps place picker *and* "use my location", with a manual
   lat/lng fallback. Ask for geolocation permission in context, with an honest
   purpose string (`privacy.md`).
3. Crop, season, area.
4. Soil: type, and optional moisture / N / P / K as three-way Low·Medium·High
   choosers. Label the section "Entered by you" — Gemini must never populate these
   (PRD F4).
5. Irrigation.
Validate inline as the user types, never only on submit. Offer choices over typing
everywhere (`entering-data.md`).

**`/` — Farm dashboard** (PRD §20)
The most important screen. Order:
1. Field identity: district, crop, area. Quiet.
2. **`RiskStratum`** with the overall score and band as the headline figure.
3. The `assumptions` array rendered as "What this score assumed" — plain sentences,
   not a warning box. This is a feature: it tells the farmer what to go and measure.
4. Seven-day weather strip. If `degraded`, render an `ErrorState` in its place —
   never zeros.
5. NDVI card using the `ndvi-*` ramp, with `ProvenanceBadge` driven by `is_live`.
6. Two primary actions: `Get AI advisory`, `Check crop suitability`.

**`/advisory/[farmId]`** (PRD F8, F10 — fixes E8)
Render every field the API returns, `monitoring_advice` and `uncertainty` included
(E8). Language switcher for en / hi / gu / te; refetch on change. When
`is_ai_generated` is false, badge it `demo` and say plainly that this is rule-based,
not model output. Always show the disclaimer.

**`/crops/[farmId]`** (PRD F6 — fixes E3)
Ranked list. Each crop expands to its per-criterion breakdown. **Criteria in
`unscored_criteria` render as "Not assessed — no seasonal rainfall data", never as a
failure.** Add a `Why this ranking?` action calling the new
`POST /recommendations/crops/explain`, which passes the *computed* scores to Gemini
for narration only.

**`/scan`** (PRD F9 — fixes A5, B11)
Camera or gallery. Client-side guard on type and size before upload. Result shows
**"Possible: Early blight"**, the confidence, the source (`mobilenet-v2` or
`gemini-vision`), the monitoring list and the disclaimer. **There is no severity
field** — the previous hardcoded "Medium" is deleted, not recalculated (A5). When a
farm is selected, pass `farm_id` so the result feeds the risk engine (B11).

**`/weather`** (PRD F2)
Current conditions, 7-day forecast, source and fetch time always visible. Place
search via `/weather/geocode`.

**`/districts`** (PRD F12, F13, F14 — fixes E4, B9)
1. **State roll-up header** — "Districts analysed: 10 · Low 4 · Medium 3 · High 2 ·
   Critical 1" (E4). This was missing entirely.
2. Google Map with `AdvancedMarkerElement`, coloured from the risk ramp (B9 — the old
   `chart.apis.google.com` icons are dead). Render the "Map unavailable" state when
   the key is absent.
3. District detail: farm count, risk distribution, top crops, water stress.
4. `Generate intervention priorities` → Gemini, with the decision-support disclaimer
   always visible.
5. `ProvenanceBadge provenance="demo"` at the top whenever `is_demo` is true (A8).

### 7.3 — Voice and chat (PRD F10, F11, §14 — fixes A2, E1, E2)

Delete `legacy/web-vite/src/pages/VoicePage.tsx` behaviour entirely. The replacement
is real or it does not ship:

- **Input:** Web Speech API (`SpeechRecognition`) with the farmer's language code.
  Where unsupported, fall back to a text field. Never fake listening.
- **Reasoning:** new `POST /chat` on the API. It loads the farm's stored context —
  farm record, latest risk, latest weather, latest NDVI — and passes it to Gemini
  under the existing system instruction in `integrations/gemini.py`. The model answers
  only from that context.
- **Output:** `speechSynthesis` in the selected language, with the text always visible
  too.
- If Gemini is not configured, say so. Do not answer.

Add Cloud Speech-to-Text and Text-to-Speech behind the same interface as a server-side
option (PRD §13A Tier B), selected by config. The Web Speech path is the default.

### 7.4 — Inference service (fixes D1–D5, A5)

In `services/inference`:

- **D1:** bump `google-genai` to `>=1.9`. The current `0.3.0` pin cannot satisfy the
  `genai.Client` / `types.GenerateContentConfig` API the code already calls. Verify
  the import actually works before moving on.
- **D2:** add `pydantic-settings` and read configuration through it. `os.getenv` with
  no `.env` loader silently ignores the documented `.env` file.
- **D3:** delete `model/plant_disease_model.h5` and its Git LFS entry. It is never
  loaded; the service uses a Hugging Face MobileNetV2 pipeline and there is no
  TensorFlow in the requirements.
- **D4:** validate upload type and size at the FastAPI layer.
- **D5:** stop returning `confidence: 1.0` for "Not a plant". Return a distinct
  `label: "not_a_plant"` with `confidence: null` and let the caller branch on the
  label.
- Restructure to `app/main.py` with the route at `POST /v1/predict`, add `/health`,
  restrict CORS to the API service origin (C6), and return the shape the API expects:
  `{ label, confidence, guidance, source }`.
- Add `tests/` with a golden-image case per branch: confident prediction, low
  confidence falling through to Gemini, non-plant rejection, oversized upload.

### 7.5 — Data, seeding and the remaining endpoints

- **Seed script** `services/api/scripts/seed.py` (PRD §17): 10 districts, 100 farms,
  10 crops, soil profiles, satellite snapshots, risks. Every document gets
  `is_demo=True`; the script clears **only** `is_demo` records, so it is idempotent
  and never destroys real data. The old script deleted whole collections and then
  crashed on a schema violation (B6) — do not reproduce either behaviour.
- **`GET /schemes`** from `data/schemes.json`, with state filtering (E2).
- **`GET /market`** proxying data.gov.in Agmarknet, returning `503` with a clear
  message when `DATA_GOV_API_KEY` is absent. Never fall back to invented prices (A7).
- **`POST /farmers`** — required by the farm creation flow (B12).

### 7.6 — Infrastructure (PRD §13A — fixes E10)

- `infra/docker/Dockerfile.api`, `.inference`, `.web` — multi-stage, non-root user,
  `HEALTHCHECK` against each service's `/health`.
- `docker-compose.yml` at the root: mongo + api + inference + web, one command.
- `infra/github/workflows/ci.yml`: ruff + mypy + pytest for both Python services,
  `tsc --noEmit` + eslint + `next build` for the web app. CI must fail on any of them.
- Cloud Run service YAML for all three. Secrets come from **Secret Manager**, never
  from baked-in environment variables.
- `structlog` JSON logging in both Python services, so Cloud Logging gets structured
  entries.

### 7.7 — Tests (fixes E9)

- **Python:** extend `services/api/tests`. Add route tests with `httpx.ASGITransport`
  and a mocked Gemini. Target the branches that matter: degraded weather, missing
  NDVI, Gemini unavailable, oversized upload, invalid farm id.
- **Web:** Playwright covering the PRD §23 Definition of Done — create farm → see
  weather → see risk → get advisory → get crop recommendations → scan a leaf → switch
  language. Plus an axe-core accessibility assertion per screen.

### 7.8 — Documentation and cleanup

- Rewrite the root `README.md`. PRD §13A demands three explicitly separated columns:
  **implemented**, **integrated**, **future / scale-ready**. Do not list a technology
  in the first column unless a real code path exercises it. Inflating this list is the
  single easiest way to fail the hackathon's originality check.
- Document the baseline-versus-hackathon split (PRD §2) honestly.
- Delete `legacy/` once every behaviour worth keeping is ported.

---

## 8. Definition of done

Farmer (PRD §23):
create farm · pick location · pick crop · enter soil · see weather · see risk ·
receive AI advisory · receive crop recommendations · upload leaf · receive diagnosis ·
use at least 3 languages.

Officer:
district map · risk hotspots · district details · crop and risk statistics ·
AI intervention summary.

Technical:
Gemini integrated · satellite integrated · all three services deploy · secrets in
Secret Manager · CI green · README complete.

Quality floor, checked on every screen before you call it done:
- Works at 320px width.
- Survives the largest browser text size with hierarchy intact.
- Visible keyboard focus on every interactive element; full keyboard path.
- `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast` all
  honoured.
- Light and dark both correct.
- Every measurement on screen carries a provenance badge.
- No hex colour hardcoded in a component.

---

## 9. Things that will make this build wrong

Stated plainly, because each one was already committed once:

- Inventing a plausible-looking number so a card is not empty. Show the empty state.
- Tagging a value with a real source name when it did not come from that source.
- A `setTimeout` that simulates work the product does not do.
- Letting a caught exception return zeros that a downstream calculation treats as
  measurements.
- Comparing two quantities in different units because they share a field name.
- Adding a Google product to the README because it is on the §13A list, with no code
  path behind it. §13A itself forbids this: *"Claude must not create disconnected fake
  integrations simply to increase the technology count."* The same applies to you.
