# AgriMitra Climate — Product Requirements Document

**Version:** 2.0 — Expanded Google Technology & Engineering Inventory  
**Hackathon:** Build with AI: Code for Communities — Second Edition  
**Track:** BRICS Theme — Cooperation / Digital Agriculture  
**Build Window:** 48 hours  
**Base Project:** AgriMitra  
**Primary AI:** Google Gemini  
**Satellite/Geospatial:** Google Earth Engine  
**Status:** Hackathon MVP

---

# 1. Executive Summary

## 1.1 Product

**AgriMitra Climate** is an AI-powered climate-smart agriculture platform that combines weather, soil, satellite-derived indicators, crop information, and crop-health images to provide localized agricultural intelligence.

The platform is designed for:

- Small and marginal farmers
- Agricultural officers
- District/state agriculture stakeholders

The system converts fragmented agricultural signals into:

1. Personalized agro-advisories
2. Crop suitability recommendations
3. Farm climate-risk assessment
4. Crop disease diagnosis
5. Multilingual farmer assistance
6. District-level agriculture intelligence

The existing AgriMitra repository is the starting foundation. The hackathon version must be a **substantial extension**, not a simple resubmission of the old application.

---

# 2. Important Hackathon Constraint

The hackathon rules state that pre-existing projects are not eligible unless they are **substantially extended for the challenge**.

Therefore:

- Do NOT submit the existing AgriMitra repository unchanged.
- Do NOT claim that pre-existing features were built during the hackathon.
- Preserve the original project as the baseline.
- Create a new repository for the hackathon.
- Clearly document the existing foundation and all new hackathon work.
- Keep Git history/commits clear enough to demonstrate the new work.
- The new product must have a materially different core workflow aligned with the agriculture problem statement.

The existing AgriMitra already contains a React/Vite client, Node/Express server, MongoDB, Python/FastAPI ML service, crop disease detection, weather, AI assistant, farming calendar, market insights, and multilingual support. The hackathon version therefore focuses on **climate intelligence, satellite intelligence, crop suitability, farm risk, and AI agro-advisory**.

---

# 3. Recommended Repository Strategy

## 3.1 Do NOT directly continue development on the old repository

Keep:

```text
AgriMitra/
```

untouched as the original baseline.

Create:

```text
AgriMitra-Climate/
```

as the hackathon repository.

## 3.2 Recommended local structure

```text
Projects/
├── AgriMitra/
│   └── original project
│
└── AgriMitra-Climate/
    └── hackathon project
```

## 3.3 Clone the old repository

```bash
git clone https://github.com/deepaksinghh12/Agrimitra.git AgriMitra-Climate
cd AgriMitra-Climate
```

This gives the new local folder all existing source files.

## 3.4 Remove the old Git remote

```bash
git remote remove origin
```

Verify:

```bash
git remote -v
```

It should show no origin.

## 3.5 Create a NEW GitHub repository

Recommended repository name:

```text
agrimitra-climate
```

or:

```text
AgriMitra-Climate
```

Do not initialize the new GitHub repository with another README, `.gitignore`, or license if the local cloned project already contains them.

## 3.6 Connect the new repository

After creating the empty GitHub repository:

```bash
git remote add origin https://github.com/<YOUR_USERNAME>/AgriMitra-Climate.git
```

Verify:

```bash
git remote -v
```

## 3.7 Create the hackathon branch

```bash
git checkout -b hackathon/agri-climate
```

## 3.8 Make the baseline commit

Before making hackathon modifications:

```bash
git add .
git commit -m "chore: establish AgriMitra baseline for hackathon"
git push -u origin hackathon/agri-climate
```

This is useful because the new repository now has a clear starting point.

## 3.9 Recommended branch structure

```text
main
│
├── hackathon/agri-climate
│
├── feature/farm-intelligence
├── feature/crop-recommendation
├── feature/gemini-advisor
├── feature/satellite-intelligence
├── feature/district-dashboard
└── feature/multilingual-voice
```

Feature branches are optional for a solo developer but useful when multiple AI coding agents are working in parallel.

---

# 4. Product Vision

> Give every farmer access to a digital agricultural advisor that understands their farm, climate, crop, and local conditions.

The platform should transform:

```text
Weather
+
Soil
+
Satellite
+
Crop
+
Disease
+
Location
```

into:

```text
Farm Intelligence
        ↓
Risk
        ↓
Recommendation
        ↓
Action
```

---

# 5. Problem

Small and marginal farmers often receive agricultural information through fragmented channels.

A farmer may know:

> "Rain is coming."

but may not know:

> "Given my soil, crop, water availability, vegetation condition, and upcoming weather, what should I do this week?"

AgriMitra Climate brings these signals together into one decision-support workflow.

---

# 6. Hackathon Problem Alignment

| Challenge requirement | AgriMitra Climate |
|---|---|
| AI agro-advisories | Gemini Advisory Engine |
| Satellite data | Google Earth Engine |
| Soil health | Farm Soil Profile |
| Weather forecasting | Weather Service |
| Regenerative/crop recommendations | Crop Suitability Engine |
| Crop disease diagnosis | Existing ML + Gemini Vision |
| Multilingual support | English + Hindi + Gujarati, expandable |
| Digital Public Good | Modular/open architecture |
| India-scale | Farmer → District → State architecture |
| BRICS scalability | Country-specific data adapters |

---

# 7. Target Users

## 7.1 Farmer

Example:

```text
Name: Ravi Kumar
Location: Alwar, Rajasthan
Farm: 2 acres
Crop: Wheat
Soil: Loamy
Irrigation: Limited
Language: Hindi
```

## 7.2 Agricultural Officer

Needs:

- District-level risk
- Crop trends
- Water stress
- Disease trends
- Intervention priorities

## 7.3 Future Government User

Needs:

- Regional crop intelligence
- Climate-risk monitoring
- Agricultural intervention planning
- Cross-district comparisons

---

# 8. Product Scope

## P0 — Must Have

1. Farm Profile
2. Weather integration
3. Farm risk engine
4. Gemini AI agro-advisory
5. Crop suitability recommendation
6. Existing disease detection integration
7. Google AI integration
8. Satellite-derived intelligence
9. District-level intelligence dashboard
10. Working deployed application

## P1 — High Value

11. Multilingual AI
12. Google Maps visualization
13. Government intervention recommendations
14. Seed/demo dataset
15. AI explanation layer

## P2 — Only if time remains

16. Voice assistant
17. Additional Indian languages
18. Advanced satellite layers
19. More crops
20. More district datasets

---

# 9. Explicitly Out of Scope

Do NOT spend the 48-hour sprint on:

- Payments
- Marketplace
- Social network
- Farmer forum improvements
- Complex authentication
- IoT hardware
- Drone integration
- Custom satellite ML model
- Full national agriculture database
- Full BRICS deployment
- Blockchain
- Custom LLM
- Native mobile application
- Automated pesticide purchasing

These can appear in the future roadmap.

---

# 10. Core User Journey

```text
Farmer
  ↓
Create/select farm
  ↓
Location
  ↓
Crop
  ↓
Soil
  ↓
Weather
  ↓
Satellite indicators
  ↓
Farm risk calculation
  ↓
AI agro-advisory
  ↓
Crop suitability
  ↓
Optional leaf diagnosis
  ↓
Updated AI advice
```

---

# 11. Feature Requirements

# F1 — Farm Profile

## Objective

Create a structured digital profile for a farm.

## Inputs

- Farmer name
- Location
- State
- District
- Farm size
- Crop
- Season
- Soil type
- Irrigation availability
- Preferred language

## Example

```json
{
  "farmerName": "Ravi Kumar",
  "location": {
    "lat": 27.55,
    "lng": 76.63
  },
  "state": "Rajasthan",
  "district": "Alwar",
  "farmSizeAcres": 2,
  "crop": "Wheat",
  "season": "Rabi",
  "soilType": "Loamy",
  "irrigation": "Limited",
  "language": "hi"
}
```

---

# F2 — Weather Intelligence

## Objective

Retrieve weather information relevant to the farm.

## Required

- Current temperature
- Humidity
- Rainfall
- Wind
- 5–7 day forecast

## UI

```text
Today's Weather

🌡 32°C
💧 48%
🌧 20% rain

Next 7 Days
Mon 🟢
Tue 🟡
Wed 🟢
Thu 🔴
Fri 🟢
```

Every weather result should show source/time where practical.

---

# F3 — Satellite Intelligence

## Objective

Use Google Earth Engine to provide useful farm/region indicators.

For the MVP, prioritize a small number of meaningful indicators instead of building a complicated satellite ML model.

Potential indicators:

- NDVI
- Vegetation health
- Land cover
- Historical vegetation condition
- Water-related indicators

Example output:

```json
{
  "vegetationHealth": 0.72,
  "vegetationStatus": "moderate",
  "satelliteDate": "2026-09-28"
}
```

If live Earth Engine integration becomes a blocker, use a clearly labeled precomputed/demo satellite dataset while keeping the satellite service interface intact.

Never present simulated data as live data.

---

# F4 — Soil Profile

## MVP

Allow manual entry.

```text
Soil Type: Loamy
Moisture: Low
Nitrogen: Medium
Phosphorus: Medium
Potassium: Low
```

If verified public soil data is available, it can supplement the profile.

## Rule

Gemini must never invent soil measurements.

---

# F5 — Farm Risk Engine

## Objective

Calculate an interpretable farm risk score.

Inputs:

- Water stress
- Heat stress
- Rainfall risk
- Disease risk
- Vegetation risk

Example:

```text
riskScore =
    waterStress * 0.30
  + heatStress * 0.20
  + diseaseRisk * 0.20
  + rainfallRisk * 0.15
  + vegetationRisk * 0.15
```

Normalize:

```text
0–30    LOW
31–60   MEDIUM
61–80   HIGH
81–100  CRITICAL
```

These weights are prototype assumptions and should not be presented as scientifically validated coefficients.

## Output

```text
Overall Farm Risk: MEDIUM 🟡

Water Stress       HIGH
Heat Stress        MEDIUM
Disease Risk       LOW
Vegetation Health  MEDIUM
Rainfall Risk      LOW
```

### Architecture rule

The numerical score is calculated by deterministic application logic.

Gemini explains the score.

Gemini does NOT invent the score.

---

# F6 — Crop Suitability Engine

## Objective

Recommend crops based on structured agricultural data.

Inputs:

- Location
- Season
- Soil
- Water availability
- Temperature
- Rainfall
- Crop requirements

## Example

```text
Mustard     91%
Chickpea    87%
Barley      84%
Wheat       72%
Rice        31%
```

## Architecture

```text
Agricultural rules/data
        ↓
Suitability calculation
        ↓
Crop ranking
        ↓
Gemini explanation
```

Gemini explains why a crop received its score.

It should not independently invent crop rankings.

---

# F7 — Crop Dataset

For MVP, maintain a curated dataset of approximately 5–10 crops.

Suggested crops:

- Wheat
- Mustard
- Chickpea
- Barley
- Millet
- Maize
- Rice
- Cotton
- Groundnut
- Sorghum

Example:

```json
{
  "crop": "Mustard",
  "season": ["Rabi"],
  "soil": ["Loamy", "Sandy Loam"],
  "waterRequirement": "Low",
  "temperatureRange": {
    "min": 10,
    "max": 25
  },
  "rainfallRequirement": {
    "min": 300,
    "max": 500
  }
}
```

Agricultural assumptions should be sourced from appropriate public/agricultural references and treated as decision-support inputs, not guarantees.

---

# F8 — Gemini Agro-Advisory

## Objective

Generate localized advice from structured farm information.

## Input

```json
{
  "location": "Alwar, Rajasthan",
  "crop": "Wheat",
  "soil": "Loamy",
  "waterAvailability": "Limited",
  "temperature": 34,
  "humidity": 48,
  "rainfallForecast": 4,
  "vegetationHealth": 0.72,
  "farmRisk": "Medium"
}
```

## Output

```json
{
  "summary": "...",
  "risks": [],
  "actions": [],
  "irrigationAdvice": "...",
  "weatherAdvice": "...",
  "monitoringAdvice": []
}
```

## Gemini rules

Gemini MUST:

- Use only supplied data
- Explain reasoning
- Separate observed information from recommendations
- Give concise actionable advice
- Respond in the requested language
- Mention uncertainty where relevant

Gemini MUST NOT:

- Invent weather measurements
- Invent soil measurements
- Invent disease severity
- Claim certainty
- Generate unsupported pesticide dosages
- Pretend to be an agricultural authority

---

# F9 — Disease Detection

Reuse the existing AgriMitra disease-detection pipeline where possible.

Expected flow:

```text
Leaf image
  ↓
Image preprocessing
  ↓
MobileNetV2
  ↓
Prediction
  ↓
Confidence threshold
  ↓
If uncertain → Gemini Vision
  ↓
Diagnosis explanation
```

## Output

```text
Possible Disease:
Early Blight

Confidence:
87%

Risk:
Moderate

What to monitor:
• Leaf spots
• Spread to nearby leaves
• Changes after rainfall

Next step:
Follow locally approved agricultural guidance.
```

The disease feature is a component of the new platform, not the entire product.

---

# F10 — Multilingual AI

## MVP

- English
- Hindi
- Gujarati

## Optional

- Telugu

The AI advisory should be able to return responses in the selected language.

---

# F11 — Voice Assistant

P2 unless implementation is easy.

Flow:

```text
Voice
 ↓
Google Speech-to-Text
 ↓
Gemini
 ↓
Response
 ↓
Text-to-Speech
```

Example:

```text
Farmer:
"मेरी फसल में पानी की कमी है, क्या करूं?"

↓
Speech-to-Text

↓
Farm context + weather + soil

↓
Gemini

↓
Hindi response
```

Do not let voice work block the core MVP.

---

# F12 — District Agriculture Intelligence

This feature demonstrates that the system is not merely a farmer chatbot.

Create two modes:

```text
Farmer View
     ↕
Agriculture Intelligence View
```

## District dashboard

```text
RAJASTHAN AGRICULTURE INTELLIGENCE

Districts analyzed: 10

🟢 Low Risk       4
🟡 Medium Risk    3
🟠 High Risk      2
🔴 Critical       1
```

## District details

```text
Alwar

Farm profiles: 2,340

Water stress: HIGH
Disease risk: MEDIUM
Vegetation: MODERATE

Top crops:
Wheat
Mustard
Chickpea
```

---

# F13 — Map

Use Google Maps.

Layers:

- Districts
- Farms
- Risk
- Crop
- Vegetation

Risk colors:

```text
LOW       🟢
MEDIUM    🟡
HIGH      🟠
CRITICAL  🔴
```

Keep GIS implementation simple.

---

# F14 — Government Intervention Recommendations

Given district-level structured signals:

```text
District:
Alwar

Water stress:
High

Rainfall:
Low

Crop concentration:
Wheat
```

Gemini can generate:

```text
Suggested intervention priorities:

1. Promote water-efficient irrigation scheduling
2. Prioritize drought-resilient crop planning
3. Monitor high-risk farming clusters
4. Increase agricultural extension outreach
```

AI recommendations are decision support for officials, not automatic government decisions.

---

# 12. System Architecture

```text
┌─────────────────────────────────────────────┐
│                  FRONTEND                   │
│                                             │
│ React + Vite + TypeScript + Tailwind       │
│ Google Maps + Recharts                      │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                 API SERVER                  │
│                                             │
│ Node.js + Express                           │
│ Farm APIs / Weather / Data / Auth          │
└───────────────┬─────────────────┬───────────┘
                │                 │
                ▼                 ▼
       ┌────────────────┐  ┌──────────────────┐
       │    MongoDB     │  │ Python AI        │
       │                │  │ FastAPI          │
       │ Farm data      │  │ Disease model    │
       │ Profiles       │  │ Gemini           │
       └────────────────┘  └────────┬─────────┘
                                    │
                     ┌──────────────┼─────────────┐
                     ▼              ▼             ▼
                  Gemini           GEE       Weather API
```

---

# 13. Technology Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Google Maps
- Recharts

## Backend

- Node.js
- Express
- MongoDB

## AI/ML

- Python
- FastAPI
- MobileNetV2
- Google Gemini

## Google Cloud

- Gemini API / Vertex AI
- Google Earth Engine
- Google Maps Platform
- Cloud Run
- Cloud Storage

---



---

# 13A. Expanded Google Technology & Engineering Inventory

## Important implementation rule

**Google AI integration is mandatory.** Google AI must be a real part of the product architecture, not just a logo, mention, or optional chatbot.

This section is intentionally exhaustive. Claude Code should inspect the repository and integrate the technologies that are applicable to each feature. The 48-hour MVP must remain stable; technologies that cannot be fully operationalized can be represented through clean interfaces and documented as scale extensions.

## Hackathon-mandated / explicitly recommended Google technologies

1. Gemini API
2. Google AI Studio
3. Vertex AI
4. Gemini multimodal
5. Vertex AI Vision
6. Vertex AI AutoML
7. Vertex AI custom training
8. Vertex AI model serving
9. Cloud Speech-to-Text
10. Cloud Text-to-Speech
11. Google Cloud Translation API
12. Dialogflow
13. Google Maps Platform
14. Google Earth Engine
15. BigQuery
16. Firebase
17. Firebase Authentication
18. Firebase Realtime Database
19. Cloud Firestore
20. Cloud Run
21. Cloud Functions
22. Cloud Storage
23. Google Cloud IAM
24. Google Cloud Secret Manager
25. Google Cloud Logging
26. Google Cloud Monitoring
27. Google Cloud Build
28. Google Artifact Registry
29. Google Cloud Pub/Sub
30. Google Cloud Scheduler

## Public-data integrations

31. data.gov.in
32. Indian government open-data portals
33. FAO agricultural datasets
34. WHO datasets where relevant
35. ISRO/Bhuvan
36. IMD datasets/services
37. National meteorological services
38. Public soil datasets
39. Public crop datasets
40. Public climate datasets
41. Public land-use/land-cover datasets

## Frontend / Web

42. React
43. Vite
44. TypeScript
45. JavaScript
46. HTML5
47. CSS3
48. Tailwind CSS
49. shadcn/ui
50. Radix UI
51. Lucide Icons
52. Framer Motion
53. React Router
54. TanStack Query
55. React Hook Form
56. Zod
57. Recharts
58. Apache ECharts
59. Progressive Web App
60. Service Workers

## Maps / Geospatial

61. Google Maps JavaScript API
62. Google Places API
63. Google Geocoding API
64. Google Maps visualization capabilities
65. Earth Engine Python API
66. geemap
67. GeoPandas
68. Shapely
69. PyProj
70. Rasterio
71. GDAL
72. GeoJSON
73. PostGIS
74. MapLibre GL JS
75. Spatial indexing
76. NDVI processing
77. Remote-sensing raster processing
78. Satellite time-series analysis

## Backend / APIs

79. Node.js
80. Express.js
81. Python
82. FastAPI
83. Uvicorn
84. REST APIs
85. OpenAPI
86. Swagger UI
87. Axios
88. Pydantic
89. JWT
90. OAuth 2.0
91. CORS
92. Helmet
93. API rate limiting
94. Multipart uploads
95. Webhooks
96. Socket.IO / WebSockets
97. Structured JSON APIs
98. API versioning

## Databases / Data

99. MongoDB
100. Mongoose
101. PostgreSQL
102. PostGIS
103. BigQuery analytics
104. Cloud SQL
105. Cloud Firestore
106. Firebase Realtime Database
107. Redis
108. Memorystore
109. Google Cloud Storage
110. DuckDB
111. Pandas
112. NumPy
113. SQL
114. ETL/ELT pipelines
115. Data validation pipelines
116. Data normalization
117. Geospatial indexing
118. Time-series data modeling

## Generative AI / AI Engineering

119. Gemini API
120. Vertex AI
121. Google AI Studio
122. Gemini multimodal
123. Vertex AI Vision
124. Vertex AI AutoML
125. Vertex AI custom training
126. Vertex AI model serving
127. Gemini structured output
128. Gemini function calling
129. Gemini tool use
130. Gemini safety controls
131. Prompt engineering
132. AI evaluation
133. Embeddings
134. Retrieval-Augmented Generation (RAG)
135. Vector search
136. Context-aware prompting
137. Grounded generation
138. AI response validation
139. AI uncertainty handling
140. AI observability
141. Dialogflow
142. Speech-to-Text
143. Text-to-Speech
144. Translation API

## Machine Learning / Computer Vision

145. PyTorch
146. TensorFlow
147. TensorFlow Lite
148. MobileNetV2
149. OpenCV
150. PIL/Pillow
151. scikit-learn
152. SciPy
153. ML preprocessing
154. Image normalization
155. Image classification
156. Confidence thresholding
157. Model fallback routing
158. Model evaluation
159. Model versioning
160. Batch inference
161. Real-time inference

## Agriculture / Climate Intelligence

162. Crop suitability rules
163. Crop requirement datasets
164. Soil-profile modeling
165. Weather normalization
166. Rainfall analysis
167. Temperature-stress analysis
168. Water-stress modeling
169. Heat-stress modeling
170. Disease-risk modeling
171. Vegetation-health modeling
172. Farm-risk scoring
173. Crop ranking
174. Climate-smart agriculture rules
175. Regenerative agriculture recommendations
176. Irrigation decision support
177. Agricultural intervention analytics
178. District aggregation
179. State aggregation
180. Farm-level time series
181. Crop-health time series
182. Satellite-derived vegetation indicators

## Cloud / DevOps

183. Google Cloud Platform
184. Cloud Run
185. Cloud Functions
186. Cloud Build
187. Artifact Registry
188. Cloud Storage
189. Secret Manager
190. IAM
191. Cloud Logging
192. Cloud Monitoring
193. Cloud Trace
194. Cloud Scheduler
195. Pub/Sub
196. Docker
197. Docker Compose
198. Linux
199. Git
200. GitHub
201. GitHub Actions
202. CI/CD
203. Environment-based configuration
204. Health checks
205. Application logging
206. Error monitoring

## Security / Reliability

207. Environment variables
208. Secret management
209. JWT authentication
210. OAuth 2.0
211. Role-based access control
212. Input validation
213. Output validation
214. File-type validation
215. Image-size limits
216. API rate limiting
217. CORS policy
218. Security headers
219. Audit logging
220. Data minimization
221. Least-privilege IAM
222. HTTPS/TLS
223. Error boundaries
224. Retry/backoff
225. Timeout handling
226. Graceful degradation
227. Service health checks

## Testing / Quality / Observability

228. Jest
229. Vitest
230. Pytest
231. Playwright
232. API integration testing
233. End-to-end testing
234. Postman/REST client testing
235. ESLint
236. Prettier
237. TypeScript type checking
238. Python linting
239. Structured logs
240. Metrics
241. Tracing
242. AI evaluation datasets
243. Golden test cases
244. Regression testing
245. Synthetic/demo-data validation

## Google service → concrete product responsibility

| Technology | Required product role |
|---|---|
| Gemini | Farm-context reasoning and personalized agro-advisory |
| Gemini multimodal | Crop/leaf image reasoning |
| Vertex AI | AI orchestration, production lifecycle, scalable serving |
| Vertex AI Vision | Vision pipeline extension |
| Vertex AI AutoML | Future/optional agriculture model training |
| Vertex AI custom training | Future custom crop/disease/climate models |
| Vertex AI model serving | Scalable ML inference |
| Earth Engine | Satellite, NDVI, vegetation and land intelligence |
| Maps Platform | Farm/district mapping |
| Speech-to-Text | Farmer voice input |
| Text-to-Speech | Spoken farmer advisory |
| Translation API | Indian-language expansion |
| Dialogflow | Conversational/voice orchestration where useful |
| BigQuery | Large-scale district/state/national analytics |
| Firebase | Authentication/realtime application capabilities |
| Cloud Run | Deploy scalable API/AI services |
| Cloud Functions | Event-driven processing |
| Cloud Storage | Images, satellite artifacts and generated files |
| Pub/Sub | Asynchronous AI/data processing |
| Cloud Scheduler | Scheduled data refresh |
| Secret Manager | API and cloud credentials |
| IAM | Least-privilege access |
| Cloud Logging | Runtime diagnostics |
| Cloud Monitoring | Service health/metrics |
| Cloud Build | Automated builds/deployments |
| Artifact Registry | Container image storage |

## Priority tiers

### Tier A — Must be genuinely connected

- Gemini
- Gemini multimodal
- Google Earth Engine
- Google Maps Platform
- Cloud Run
- Cloud Storage
- public agricultural/weather data
- existing AgriMitra React/Node/MongoDB/FastAPI/Python/MobileNetV2 foundation

### Tier B — Connect where practical during the hackathon

- Vertex AI
- Vertex AI Vision
- Speech-to-Text
- Text-to-Speech
- Translation API
- Firebase
- BigQuery
- Cloud Functions
- Pub/Sub
- Secret Manager
- Cloud Logging
- Cloud Monitoring
- Docker
- GitHub Actions
- PostGIS
- GeoPandas
- Rasterio
- OpenCV
- Redis

### Tier C — Scale architecture / extension

- Vertex AI AutoML
- Vertex AI custom training
- advanced RAG
- vector search
- embeddings
- advanced BigQuery pipelines
- Cloud Scheduler
- advanced observability
- national/state analytics
- BRICS country-specific data adapters

**Important:** Claude must not create disconnected fake integrations simply to increase the technology count. Each technology must have a real architectural or product purpose, and the final README must distinguish **implemented**, **integrated**, and **future/scale-ready** components.

# 14. API Design

```http
POST /api/farms
GET  /api/farms/:id
PUT  /api/farms/:id

GET  /api/weather?lat=&lng=

GET  /api/satellite?lat=&lng=

GET  /api/farms/:id/risk

POST /api/recommendations/crops

POST /api/advisory

POST /api/disease/analyze

POST /api/ai/chat
```

Reuse existing API conventions where practical instead of unnecessarily rewriting the backend.

---

# 15. Database Schema

## Farmer

```text
id
name
phone
language
createdAt
```

## Farm

```text
id
farmerId
location
state
district
area
crop
season
soil
irrigation
createdAt
updatedAt
```

## WeatherSnapshot

```text
farmId
temperature
humidity
rainfall
windSpeed
forecast
timestamp
```

## SatelliteSnapshot

```text
farmId
ndvi
vegetationHealth
date
source
```

## FarmRisk

```text
farmId
waterStress
heatStress
rainfallRisk
diseaseRisk
vegetationRisk
overallScore
level
timestamp
```

## DiseaseAnalysis

```text
farmId
crop
imageUrl
disease
confidence
source
timestamp
```

---

# 16. Data Strategy

Use a hybrid data model.

## Real data where practical

- Weather API
- Public agricultural datasets
- Public soil datasets
- Google Earth Engine
- Government/open data

## Realistic demo data

Use seeded data for:

- District farms
- Crop distributions
- Sample soil profiles
- Historical farm records
- District risk

Clearly label simulated/demo data.

Example UI label:

```text
Demo Dataset
```

Never represent simulated information as live government data.

---

# 17. Seed Dataset

Target:

```text
10 districts
100 farms
10 crops
10 soil profiles
7-day weather
risk values
```

This is enough for the prototype.

---

# 18. Security

Required:

- Environment variables
- Server-side Gemini calls
- Input validation
- File upload validation
- Image size limit
- CORS restrictions
- Rate limiting where practical

Never commit:

```text
.env
API keys
Gemini credentials
MongoDB credentials
GCP credentials
```

---

# 19. AI Safety

Agricultural recommendations can affect livelihoods.

Therefore:

Use:

> "Possible disease"

instead of:

> "Definitely disease."

Use:

> "Suitability score"

instead of:

> "Guaranteed best crop."

Display weather source/timestamp.

Avoid unsupported pesticide dosage recommendations.

---

# 20. UI Requirements

The visual style should feel:

**Agricultural + Government-grade + Modern AI**

Avoid making the application look like a generic chatbot.

## Main dashboard

```text
AGRIMITRA CLIMATE

Welcome, Ravi

Alwar, Rajasthan
Wheat — 2 acres

FARM HEALTH

🟡 MEDIUM RISK

Water       🔴
Weather     🟡
Disease     🟢
Vegetation  🟡

[Get AI Advisory]
```

---

# 21. Required Screens

## Screen 1 — Landing

```text
AI-powered climate-smart farming

Understand your farm.
Predict risks.
Make better decisions.

[Start Farm Assessment]
```

## Screen 2 — Farmer Dashboard

Farm health, weather, risk, advisory.

## Screen 3 — Crop Recommendation

Ranked crops + explanations.

## Screen 4 — Disease Scanner

Upload image + analysis.

## Screen 5 — AI Advisor

Context-aware AI conversation.

## Screen 6 — Agriculture Intelligence

District map + risk + intervention.

---

# 22. 48-Hour Development Plan

## Hours 0–4

- Clone baseline
- Create new GitHub repo
- Establish baseline commit
- Configure Gemini
- Configure GCP
- Configure weather API
- Create PRD and architecture docs

## Hours 4–10

Farm Profile:

- Farm creation
- Location
- Crop
- Soil
- Irrigation
- Language

## Hours 10–16

Weather + Risk:

- Weather API
- Risk engine
- Dashboard

## Hours 16–22

Crop Recommendation:

- Crop dataset
- Suitability algorithm
- Gemini explanation

## Hours 22–28

Gemini Advisor:

- Structured prompts
- JSON output
- Advisory UI
- Multilingual responses

## Hours 28–32

Disease:

- Reuse/fix existing disease pipeline
- Connect diagnosis to farm context

## Hours 32–36

Satellite:

- Earth Engine integration
- One meaningful satellite indicator
- Fallback/demo dataset if necessary

## Hours 36–40

District dashboard:

- Map
- Risk visualization
- District statistics
- Intervention summary

## Hours 40–44

Polish:

- Loading states
- Error handling
- Responsive UI
- Seed data
- Demo flow

## Hours 44–46

Deployment.

## Hours 46–48

- Demo video
- Pitch deck
- README
- Final testing
- Submission

---

# 23. Definition of Done

## Farmer

- [ ] Create farm
- [ ] Select location
- [ ] Select crop
- [ ] Enter soil
- [ ] See weather
- [ ] See farm risk
- [ ] Receive AI advisory
- [ ] Receive crop recommendations
- [ ] Upload leaf
- [ ] Receive disease analysis
- [ ] Use at least 3 languages

## Government

- [ ] District map
- [ ] Risk hotspots
- [ ] District details
- [ ] Crop/risk statistics
- [ ] AI intervention summary

## Technical

- [ ] Gemini integrated
- [ ] Earth Engine/satellite layer integrated
- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] Database deployed
- [ ] Secrets protected
- [ ] README complete

---

# 24. Demo Script

Target: 3–5 minutes.

## 0:00–0:30 — Problem

Explain:

> Farmers don't need another isolated weather app or disease detector. They need one system that understands the context of their actual farm.

## 0:30–1:00 — Create Farm

```text
Alwar
Wheat
2 acres
Loamy soil
Limited irrigation
```

## 1:00–1:30 — Farm Intelligence

Show:

```text
Weather
+
Soil
+
Satellite
```

↓

```text
Farm Risk: MEDIUM
```

## 1:30–2:00 — Crop Recommendation

```text
Mustard 91%
Chickpea 87%
Wheat 72%
```

Explain the ranking.

## 2:00–2:30 — Disease

Upload leaf.

Show AI diagnosis.

## 2:30–3:00 — AI Advisory

Ask:

> "What should I do this week?"

Gemini generates localized advice.

## 3:00–3:30 — Language

Show:

Hindi → English → Gujarati.

## 3:30–4:00 — Government View

Show:

```text
District
↓
Crop
↓
Risk
↓
Intervention
```

End with:

> AgriMitra converts fragmented agricultural signals into localized intelligence for farmers and scalable decision support for agricultural systems.

---

# 25. Pitch Deck

Use 11 slides.

1. AgriMitra Climate
2. Problem
3. Solution
4. How it works
5. AI architecture
6. Satellite intelligence
7. Farmer experience
8. Government intelligence
9. India-scale architecture
10. Digital Public Good / BRICS scalability
11. Impact + future roadmap

---

# 26. README Requirements

README must contain:

```text
# AgriMitra Climate

## Problem
## Solution
## Hackathon Track
## Existing Foundation
## New Hackathon Extensions
## Features
## Architecture
## AI Architecture
## Google Technologies
## Data Sources
## Setup
## Environment Variables
## Deployment
## Demo
## Limitations
## Future Work
## License
```

## Critical section

Add:

```text
## Existing Foundation vs Hackathon Work
```

Clearly explain:

### Existing foundation

- Disease detection
- Weather
- AI assistant
- Farming calendar
- Market insights
- Existing frontend/backend/ML infrastructure

### Hackathon extensions

- Climate intelligence
- Farm risk engine
- Crop suitability engine
- Satellite intelligence
- Gemini agro-advisory
- District intelligence
- Government intervention layer
- New multilingual AI workflow
- New hackathon dashboard

This documentation helps demonstrate that the project was **substantially extended** rather than merely resubmitted.

---

# 27. Claude Code Development Instructions

AI coding agents MUST follow these rules.

## Rule 1

Read:

```text
PRD.md
ARCHITECTURE.md
```

before changing code.

## Rule 2

Inspect existing code before rewriting.

## Rule 3

Reuse working AgriMitra functionality.

## Rule 4

Do not rewrite the entire project.

## Rule 5

Do not change unrelated functionality.

## Rule 6

Do not introduce unnecessary dependencies.

## Rule 7

Do not expose API keys.

## Rule 8

Use small, testable changes.

## Rule 9

Run the relevant application/tests after changes.

## Rule 10

Before implementing a feature, identify existing components/services that can be reused.

---

# 28. Agent Prompt Template

Use this template with Claude Code:

```text
You are working on AgriMitra Climate, a 48-hour hackathon extension of the existing AgriMitra project.

Read:
- PRD.md
- ARCHITECTURE.md
- existing source code

Before making changes:
1. Inspect the existing implementation.
2. Identify reusable components/services.
3. Do not rewrite working features unnecessarily.
4. Follow the PRD.
5. Keep API keys server-side.
6. Keep changes focused.

Task:
[DESCRIBE ONE TASK]

Requirements:
[LIST REQUIREMENTS]

Acceptance criteria:
[LIST ACCEPTANCE CRITERIA]

After implementation:
1. Run tests/build.
2. Fix errors.
3. Summarize files changed.
4. Explain how the implementation satisfies the acceptance criteria.
```

---

# 29. Recommended Agent Task Sequence

### Agent Task 1

Repository audit only.

No code changes.

### Agent Task 2

Farm Profile.

### Agent Task 3

Weather service.

### Agent Task 4

Risk engine.

### Agent Task 5

Crop suitability engine.

### Agent Task 6

Gemini advisory.

### Agent Task 7

Disease integration.

### Agent Task 8

Satellite integration.

### Agent Task 9

District dashboard.

### Agent Task 10

QA/deployment.

---

# 30. Git Commit Strategy

Recommended commits:

```text
chore: establish AgriMitra baseline for hackathon

feat: add farm intelligence profile

feat: add weather intelligence service

feat: add farm risk engine

feat: add crop suitability engine

feat: integrate Gemini agro advisory

feat: integrate climate satellite intelligence

feat: add district agriculture dashboard

feat: add multilingual advisory

fix: improve AI error handling

chore: prepare production deployment
```

Do not squash everything into one commit.

---

# 31. Scalability Architecture

The product should be designed as:

```text
                 COMMON PLATFORM
                       │
        ┌──────────────┼───────────────┐
        ↓              ↓               ↓
   India Adapter   Country Adapter  Country Adapter
        ↓              ↓               ↓
    Local Data      Local Data       Local Data
        │              │               │
        └──────────────┼───────────────┘
                       ↓
               Common AI Layer
                       ↓
              Localized Advisory
```

The AI/application layer should not hard-code every country-specific data source.

---

# 32. Digital Public Good Principles

The architecture should emphasize:

- Interoperability
- Modular data adapters
- Open standards
- Transparent recommendation logic
- Explainable AI outputs
- Local-language support
- Human oversight
- Privacy-aware data handling
- Reusable APIs

---

# 33. India Scale

Prototype:

```text
100 farms
10 districts
```

Architecture:

```text
100 farms
   ↓
10 districts
   ↓
State
   ↓
India
```

The demo only needs a small dataset, but the architecture should not depend on a single district.

---

# 34. BRICS Scalability

Future:

```text
India
Brazil
Russia
China
South Africa
```

Each country can supply country-specific:

- Weather
- Soil
- Crop
- Satellite
- Agricultural datasets

while sharing:

- AI architecture
- Risk-engine concepts
- Data schemas
- APIs
- Model evaluation framework

---

# 35. Product Success Metrics

For the hackathon prototype:

### Technical

- Successful Gemini calls
- Successful disease predictions
- Successful weather retrieval
- Successful satellite retrieval/demo
- Dashboard load
- Deployment availability

### Product

- Farmer can complete assessment
- Advisory generated
- Crop recommendations generated
- Disease diagnosis generated
- District intelligence displayed

### Demo

The entire primary workflow must work from:

```text
Farm creation
→
Data aggregation
→
Risk
→
Recommendation
→
Disease
→
AI advisory
→
District view
```

without manual developer intervention.

---

# 36. Failure/Fallback Strategy

Because the build window is only 48 hours:

## Gemini unavailable

Use cached/demo advisory data and clearly show fallback state.

## Weather API unavailable

Use seeded weather data.

## Earth Engine unavailable

Use precomputed satellite indicators.

## ML service unavailable

Use a deterministic demo disease response for the demo dataset, but clearly distinguish it from live inference.

## External API timeout

Never let the dashboard crash.

Show:

```text
Live data temporarily unavailable.
Showing latest available data.
```

---

# 37. Core Product Principle

The platform must follow:

```text
REAL/STRUCTURED DATA
        ↓
DETERMINISTIC COMPUTATION
        ↓
AI REASONING
        ↓
EXPLAINABLE RECOMMENDATION
        ↓
HUMAN DECISION
```

Not:

```text
User
 ↓
Generic chatbot
 ↓
Random farming answer
```

---

# 38. Final Product Statement

> **AgriMitra Climate is an AI-powered climate-smart agriculture network that combines weather, soil, satellite and crop-health data to deliver localized agro-advisories and climate-resilient crop recommendations to farmers.**

---

# 39. Final 48-Hour Priority

If time becomes limited, implement in this order:

## P0

1. Existing application working
2. Farm profile
3. Weather
4. Risk engine
5. Gemini advisory
6. Crop suitability
7. Disease detection
8. Deployment

## P1

9. Satellite indicator
10. District dashboard
11. Multilingual AI

## P2

12. Voice
13. Government intervention recommendations
14. Advanced map layers
15. Additional crops
16. Additional languages

**Never sacrifice a working end-to-end flow for additional features.**
