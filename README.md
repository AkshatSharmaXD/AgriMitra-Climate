# AgriMitra Climate

AI climate-smart agriculture for small and marginal farmers — and a district-level
intelligence view for agricultural officers.

Weather, satellite vegetation, soil, crop data and leaf images are fused into one
weekly decision for one specific field.

> **Hackathon status.** This is a substantial extension of the original AgriMitra
> project, built for *Build with AI: Code for Communities*. The baseline is preserved
> under `legacy/`. See `docs/AUDIT.md` for what changed and why.

## Layout

| Path | What |
|---|---|
| `apps/web` | Next.js 15 front end |
| `services/api` | FastAPI core domain API — risk, suitability, advisory, districts |
| `services/inference` | FastAPI vision service — leaf disease |
| `data` | Curated crop, NDVI and scheme datasets |
| `docs` | PRD, audit, build prompts |
| `infra` | Docker, CI, Cloud Run |
| `legacy` | Previous Express + Vite implementation, reference only |

## Running locally

The database is **MongoDB Atlas**. Create a free cluster, add a database user, and
allow your IP under Network Access. Then put the `mongodb+srv://` string in
`services/api/.env` — it holds a password, so it must never be committed.

```bash
cd services/api && python -m venv .venv && .venv/bin/pip install -e ".[dev]"
```

```bash
cd services/api && .venv/bin/python -m scripts.seed
```

```bash
cd services/api && .venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

```bash
cd apps/web && npm install && npm run dev
```

Copy each `.env.example` to `.env` first. Every integration degrades to a clearly
labelled fallback when its key is absent — nothing is faked to fill a gap.

## Tests

```bash
cd services/api && .venv/bin/python -m pytest
```

## Data honesty

PRD §16 governs this project: simulated data is never presented as live data. The API
returns provenance with every measurement (`is_live`, `is_demo`, `degraded`) and the
web app renders a badge beside it. When a signal is unavailable, the risk engine drops
it from the weighted score and records an assumption in plain language rather than
substituting a value.

## Technology

See `docs/prompts/GEMINI_BUILD_PROMPT.md` §7.8 — the implemented / integrated /
future-ready breakdown is maintained there until the build is complete.
