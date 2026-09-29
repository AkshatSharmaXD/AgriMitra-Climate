# AgriMitra Climate — challenge gap analysis and implementation plan

Assessed against the *Build with AI: Code for Communities* brief, at commit `2493064`.

Read §1 first. It contains the finding that matters most.

---

## 1. The headline gap

The brief asks for four things. Three are built. One is not built at all, and it is
the one the challenge is actually named after:

> "Build an **interoperable digital agriculture network** … designed as a
> **scalable digital public good enabling Indian states to share agricultural data
> models** and strengthen cooperation on sustainable food production."

| Brief requirement | Status |
|---|---|
| Real-time localised agro-advisories using AI | **Built** — `/advisory`, `/chat`, Gemini-grounded, multilingual |
| Crop recommendations from satellite, soil, weather | **Built** — `/recommendations/crops`, deterministic engine + Gemini explanation |
| Crop disease diagnostic | **Built** — MobileNetV2 + Gemini multimodal fallback |
| **Interoperable network / shareable data models / DPG** | **Not built** |

Everything else in this document is secondary to that. A judge reading the brief
will look for the interoperability story, and right now there is nothing to show
them. §3 is the proposal.

A second, smaller gap: the brief says **regenerative** crop recommendations. The
suitability engine scores yield-fit only — season, soil, water, temperature,
rainfall. It has no notion of soil-building, rotation, or nitrogen fixation. §4.

---

## 2. Technology inventory against the brief

The brief names specific Google services. Honest status of each:

### Connected, with a real code path

| Service | Where | Notes |
|---|---|---|
| Gemini API | `integrations/gemini.py` | Structured output, safety instruction, 4 call sites |
| Google AI Studio | — | The key source for the above |
| Vertex AI | `integrations/gemini.py` | Second auth path; service-account IAM, no API key on Cloud Run |
| Gemini multimodal | `services/inference` | Vision fallback below the 0.70 confidence threshold |
| Cloud Speech-to-Text | `integrations/speech.py` | `/voice/transcribe`, for browsers without Web Speech |
| Cloud Text-to-Speech | `integrations/speech.py` | `/voice/synthesize`, 4 languages |
| Translation API | `integrations/translation.py` | Scheme directory in the farmer's language |
| Google Maps Platform | `components/charts/district-map.tsx` | `AdvancedMarkerElement` district map |
| Google Earth Engine | `integrations/satellite.py` | Real Sentinel-2 NDVI reduction |
| BigQuery | `integrations/analytics.py` | Append-only risk time series |
| Cloud Run / Functions | `infra/cloudrun/` | Three service definitions |
| Cloud Storage | `integrations/storage.py` | Leaf-scan images as diagnosis evidence |
| data.gov.in | `routes/market.py` | Agmarknet mandi prices |

### Named in the brief, not connected

| Service | Verdict |
|---|---|
| **Vertex AI AutoML / custom training / model serving** | **Worth doing.** §5 — this is the single strongest remaining technical story. |
| **Vertex AI Vision** | Partially redundant. The disease pipeline already works; §5 covers moving it to Vertex serving, which subsumes this. |
| **Firebase** | **Worth doing, narrowly.** §6 — but not the auth PRD §9 excluded. |
| **Dialogflow** | **Recommend skipping.** §7 — it would make the assistant worse, and the reasoning is worth being able to defend. |
| **ISRO / Bhuvan** | **Worth doing.** §8 — genuine Indian sovereign-data story. |
| **IMD** | **Worth doing.** §8 — Open-Meteo is not an Indian authority. |
| **FAO datasets** | **Worth doing, small.** §8 — crop coefficients with a real citation. |
| **WHO health data** | Skip. No honest agricultural use; forcing one would be padding. |

---

## 3. The interoperability layer (the priority)

**Goal:** a state agriculture department can consume AgriMitra's district
intelligence, and contribute its own, without a bilateral integration and without
any farmer's personal data crossing a boundary.

### 3.1 A published data standard

Create `packages/schema/` holding versioned JSON Schema for four record types:

```
agri-district-summary.v1.json   district aggregate: risk bands, crops, water stress
agri-crop-model.v1.json         crop requirements — the shape of data/crops.json
agri-risk-model.v1.json         the scoring model: weights, bands, provenance rules
agri-advisory.v1.json           advisory payload shape
```

This is what "share agricultural data models" means concretely. `data/crops.json`
and `app/domain/risk.py`'s `WEIGHTS` already *are* portable models — they are just
not published as such. Another state can adopt Rajasthan's crop dataset, or
publish its own against the same schema and have AgriMitra consume it.

### 3.2 Federation endpoints

```http
GET  /api/v1/federation/manifest          what this node publishes, schema versions, licence
GET  /api/v1/federation/districts         district aggregates in agri-district-summary.v1
GET  /api/v1/federation/models/crops      this node's crop dataset
GET  /api/v1/federation/models/risk       this node's risk weights and bands
POST /api/v1/federation/peers             register a peer node (URL + public key)
GET  /api/v1/federation/peers             list known peers and last successful sync
```

### 3.3 Privacy, enforced in code not in prose

- **Aggregates only.** No farm document, no farmer document, no coordinate finer
  than district centroid ever crosses the boundary.
- **k-anonymity floor.** A district with fewer than `FEDERATION_MIN_FARMS`
  (default 10) is omitted entirely rather than published with a small-n count.
  Without this, "1 farm, CRITICAL risk, Wheat" identifies a person.
- **Signed payloads.** Each node signs its manifest; a peer verifies before
  ingesting. Prevents a hostile node poisoning another state's dashboard.
- Write a test that asserts no field outside the schema's allowlist can appear in
  a federation response. This is the kind of guarantee that must fail loudly.

### 3.4 Why this is the DPG story

Digital Public Good criteria want: open licence, open standard, documented, no
PII, platform independence. The above delivers all five, and the OpenAPI spec at
`/openapi.json` is already the machine-readable interface. Add an explicit
licence and a `docs/DPG.md` mapping each criterion to where it is satisfied.

**Effort:** ~1 day. **Payoff:** the requirement the challenge is named for.

---

## 4. Regenerative recommendations

The brief says *regenerative*, not just suitable. Extend `data/crops.json` with
fields that already have public agronomic sourcing:

```json
{
  "crop": "Chickpea",
  "nitrogen_fixing": true,
  "soil_building": "high",
  "water_footprint": "low",
  "rotation_families": ["legume"],
  "residue_value": "high"
}
```

Then add a **rotation-aware** term to `app/domain/suitability.py`: a legume
following a cereal scores higher than the same cereal repeated. The farm record
already stores `crop` and `season`, so prior-crop history is available once more
than one season is recorded.

Surface it as a separate, clearly-labelled score — *Regenerative fit* alongside
*Suitability* — rather than silently folding it into one number. A farmer needs
to see the trade-off, not have it hidden.

**Important:** cite the source for every coefficient added. Inventing agronomic
constants is the same failure as inventing weather data. If a number cannot be
sourced, leave the field out.

**Effort:** ~half a day.

---

## 5. Vertex AI — training and serving

Currently the disease model is a Hugging Face checkpoint loaded in-process. That
works but tells no story about predictive modelling, which the brief names
explicitly.

Two candidates, in order of value:

**5.1 Yield / risk model on Vertex AI (AutoML tabular).**
BigQuery already accumulates `farm_risk_snapshots` with district, crop, season,
sub-scores and outcome-adjacent fields. Train an AutoML tabular model on that to
predict next-season risk band from current conditions, and serve it behind a
Vertex endpoint. The deterministic engine stays the primary — the model becomes a
second opinion shown alongside it, never replacing the explainable score.

This is the honest framing: the PRD's architecture rule says deterministic logic
computes and AI explains. A learned model is allowed to *forecast*, provided it
is labelled as a forecast and not conflated with the computed score.

**5.2 Move disease inference to Vertex AI model serving.**
Upload the MobileNetV2 checkpoint as a Vertex Model, serve behind an endpoint,
and have `services/inference` call it. Removes a ~1GB torch dependency from the
container and makes cold starts survivable on Cloud Run.

**Effort:** 5.1 ~1 day (needs seeded history to train on). 5.2 ~half a day.

---

## 6. Firebase — narrowly

PRD §9 puts complex authentication out of scope, and I would keep that: forcing a
smallholder through a sign-up to see their own field is the wrong trade.

But two Firebase uses fit without violating it:

- **Anonymous auth** — gives each device a stable ID without a password, replacing
  the `localStorage` farm ID. A farmer who clears site data currently loses their
  farm. This fixes that, and gives federation a per-node identity.
- **Firestore real-time** for the district dashboard — an officer watching risk
  hotspots during a heat event should see them update without refreshing.

Skip Firebase Realtime Database (Firestore supersedes it) and skip full auth.

**Effort:** ~half a day for anonymous auth.

---

## 7. Dialogflow — recommend against, and why

The assistant is already conversational and, more importantly, **grounded**: it
loads the farm record and instructs Gemini to answer only from it, returning
`answerable: false` when the record lacks the answer. Dialogflow's intent-matching
would sit in front of that and either duplicate it or constrain it to
pre-enumerated intents.

Adding it would make the product worse in order to add a logo. PRD §13A forbids
exactly that: *"must not create disconnected fake integrations simply to increase
the technology count."*

Recommendation: state this position explicitly in the README. A defended
omission reads better to a technical judge than a hollow integration.

---

## 8. Indian sovereign data sources

Currently weather comes from Open-Meteo — accurate and keyless, but not an Indian
authority, which sits awkwardly in a national-infrastructure pitch.

| Source | Use | Note |
|---|---|---|
| **IMD** | District rainfall and forecast | Adapter behind the existing weather interface. Verify feed availability first — IMD's public endpoints are inconsistent. Keep Open-Meteo as the fallback, labelled. |
| **ISRO / Bhuvan** | NDVI and land-use WMS | Second satellite provider behind `SatelliteProvider`. The interface already supports this — `EarthEngineProvider` and `SeededDemoProvider` both implement it. |
| **FAO** | Crop water requirements (FAO-56 Kc) | Replaces prototype coefficients in `crops.json` with citable ones. Highest credibility gain per hour of work. |

The provider abstraction for satellite already exists, so Bhuvan is genuinely a
new class, not a refactor. **Do FAO first** — it is the smallest change and it
upgrades the crop dataset from "prototype assumptions" to sourced data.

**Effort:** FAO ~2 hours. Bhuvan ~half a day. IMD ~half a day, contingent on the
feed being usable.

---

## 9. Suggested order

Ranked by (judge-visible value) ÷ (effort):

| # | Work | Effort | Why this position |
|---|---|---|---|
| 1 | **Federation layer** (§3) | 1 day | The named requirement, currently absent |
| 2 | **FAO crop coefficients** (§8) | 2 h | Turns prototype numbers into sourced ones |
| 3 | **Regenerative scoring** (§4) | 0.5 d | Brief says "regenerative" explicitly |
| 4 | **DPG documentation** (§3.4) | 2 h | Cheap, and completes the DPG claim |
| 5 | **Vertex AutoML risk forecast** (§5.1) | 1 d | Strongest predictive-modelling story |
| 6 | **Bhuvan provider** (§8) | 0.5 d | Indian sovereign satellite data |
| 7 | **Firebase anonymous auth** (§6) | 0.5 d | Fixes real data loss on clearing site data |
| 8 | **Vertex model serving** (§5.2) | 0.5 d | Ops improvement, low visibility |
| — | Dialogflow | — | Recommend documenting the omission instead |
| — | WHO data | — | No honest agricultural use |

Items 1–4 are roughly two days and cover every gap a judge reading the brief
would check for. Items 5–8 are depth.

---

## 10. Standing constraints

These apply to everything above and are not negotiable:

1. **No fabricated data.** Any new source either returns real values with real
   provenance, or the UI shows its unavailable state. Every new field carries a
   source. `docs/AUDIT.md` records what happened the last time this slipped.
2. **Deterministic computes, AI explains.** A learned model may forecast, clearly
   labelled as a forecast; it must not replace or silently alter the explainable
   score.
3. **No PII crosses a federation boundary.** Enforced by schema allowlist and a
   k-anonymity floor, and covered by a test.
4. **Every gate stays green.** 56 API tests, 31 inference tests, ruff, tsc,
   eslint, build. A phase is not finished until they pass.
5. **No integration without a caller.** If a service has no code path a user
   reaches, it does not go in the README's implemented column.
