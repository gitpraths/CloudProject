# Code Review & Plagiarism Detection System — Build-from-scratch Roadmap

This roadmap converts the project plan (`Cloud_Project_Plan_Code_Review_Plagiarism.pdf`) into **execution steps** your team can follow from an empty repo to a deployed, integrated system.

## What you are building (frozen scope)
- **Upload pipeline**: multi-language code upload → store in **GCS** at `/submissions/{assignment_id}/{student_id}/{filename}`
- **Plagiarism engine**: **tree-sitter AST parsing** + AST normalization + **TF‑IDF** + cosine similarity → write to **BigQuery**
- **AI code review**: **Vertex AI (Gemini Pro)** code review with **structured JSON** output → store in **BigQuery**
- **Web dashboard**: upload, submission status, similarity matrix, side-by-side diff view, AI review panel
- **Deployment**: containerized **FastAPI** on **Cloud Run**; CI/CD via **Cloud Build** + **Artifact Registry**

## Team structure (recommended)
- **Frontend team**: dashboard UX + API client integration
- **Backend team**: FastAPI, auth, GCS, BigQuery, orchestration, deployment
- **Plagiarism/ML team**: AST normalization, TF‑IDF similarity, diff evidence, thresholds, evaluation
- **AI integration team**: Vertex prompts, JSON schema validation, caching, quotas, safety
- **Integration captain (rotating weekly)**: owns staging health, contract changes, end-to-end demos

## Non-negotiable integration rules (prevents drift)
- **Single contract**: keep an `openapi.yaml` in the repo; FE types are generated from it.
- **Stable response shapes**: AI + plagiarism results must match a fixed schema; model/prompt changes must not break FE.
- **Correlation ID**: FE sends `X-Request-Id`, backend logs it and returns it in every response/error.
- **Vertical slices only**: every stage ends with a **running end-to-end** flow in staging (not “component complete”).

---

## Stage 0 — Repo + contracts + cloud foundation

### Deliverables
- Repo initialized with a runnable skeleton (backend + frontend)
- `openapi.yaml` with initial endpoints + schemas
- GCP project created and core services enabled
- Local dev workflow documented in `README.md`

### Steps
1. **Create GCP project**
   - Enable: **Cloud Run**, **Cloud Build**, **Artifact Registry**, **Cloud Storage**, **BigQuery**, **Vertex AI**
   - Create service accounts:
     - `cloudrun-runtime-sa`: access to GCS + BigQuery + Vertex AI
     - `cloudbuild-deployer-sa`: deploy to Cloud Run, push to Artifact Registry
2. **Create GCS bucket**
   - Bucket name (decide once): e.g. `code-submissions-<project>`
   - Enable **object versioning**
   - IAM: runtime SA can read/write objects; least privilege where possible
3. **Create BigQuery dataset**
   - Dataset e.g. `code_review`
   - Tables (initial):
     - `submissions` (metadata)
     - `similarity_pairs` (submission_a, submission_b, similarity_score, flagged, created_at, assignment_id)
     - `ai_reviews` (submission_id, review_json, overall_score, created_at)
4. **Repo layout (suggested monorepo)**
   - `backend/` (FastAPI)
   - `frontend/` (React/Next)
   - `infra/` (cloudbuild, terraform optional)
   - `contracts/openapi.yaml`
   - `scripts/` (local tooling)
5. **Define the initial API contract (OpenAPI)**
   - Minimal endpoints to unblock parallel work (see Stage 1 list below)
6. **CI/CD skeleton**
   - `backend/Dockerfile` (python:3.11-slim, expose 8080)
   - `cloudbuild.yaml` building/pushing image → deploy Cloud Run

### Integration checkpoint
- Backend returns `200` on `/health`
- Frontend can call `/health` in local dev and show status

---

## Stage 1 — Vertical slice: Upload → stored in GCS → visible in UI

### Goal
Get a real file from the browser into the system and stored correctly in GCS, with submission metadata visible in the dashboard.

### Backend (FastAPI) — steps
1. Implement `/health` (already) and add logging including `X-Request-Id`.
2. Implement **upload endpoint**:
   - `POST /v1/submissions/upload`
   - Accepts `multipart/form-data`:
     - `assignment_id` (string)
     - `student_id` (string)
     - `files[]` (1..N)
   - Validate extensions allowlist: `py, java, cpp, c, h, js, ts, jsx, tsx`
   - Create `submission_id = UUID4`
   - Write objects to GCS:
     - `submissions/{assignment_id}/{student_id}/{submission_id}/{filename}`
   - Write a row in BigQuery `submissions` (minimum):
     - `submission_id`, `assignment_id`, `student_id`, `gcs_prefix`, `status="uploaded"`, `created_at`
3. Implement `GET /v1/submissions?assignment_id=...` returning list view data.

### Frontend — steps
1. Build **Upload Screen** (drag & drop + assignment id + student id).
2. Build **Submissions Dashboard** table:
   - columns: submission_id, student_id, assignment_id, status, created_at
3. Add error handling and show `request_id` in error UI.

### Integration checkpoint (must pass before Stage 2)
- Upload 3+ files from UI, see them in GCS at the correct prefix path.
- Dashboard lists the uploaded submissions from backend.
- API contract updated and FE client regenerated (or types updated).

---

## Stage 2 — Async orchestration: Pub/Sub trigger + analysis job status 

### Goal
Make plagiarism analysis run asynchronously after upload (event-driven), and make its progress visible to the UI.

### Backend — steps
1. Create a **Pub/Sub topic** `submission-uploaded`.
2. On successful upload, publish a message:
   - payload: `{ submission_id, assignment_id, student_id, gcs_prefix }`
3. Add an analysis worker path (choose one):
   - **Option A (simple for semester)**: a second Cloud Run service `plagiarism-worker` that is invoked by Pub/Sub
   - **Option B**: same service handles Pub/Sub push subscription route (works but keep it isolated)
4. Add status fields in BigQuery `submissions`:
   - `status`: `uploaded | analyzing | analyzed | failed`
   - `error_message` (nullable)
5. Implement status endpoints:
   - `POST /v1/analysis/run?assignment_id=...` (manual trigger for demo)
   - `GET /v1/analysis/status?assignment_id=...`

### Frontend — steps
1. Show analysis status per submission.
2. Add “Trigger analysis” button for an assignment (admin/instructor action).
3. Add auto-refresh/polling while analysis is running.

### Integration checkpoint
- Upload → Pub/Sub message created → worker runs → `submissions.status` updates.
- UI reflects `uploaded → analyzing → analyzed` transitions.

---

## Stage 3 — Plagiarism engine MVP: tree-sitter + normalization + TF‑IDF + BigQuery 

### Goal
Compute pairwise similarity for submissions within an assignment, store ranked results in BigQuery, and display them in the UI.

### Plagiarism/ML team — steps (core algorithm)
1. **Parse code to AST** with `tree-sitter` for supported languages:
   - Start with: Python + JavaScript/TypeScript (then add Java/C++ as time allows)
2. **Normalize**:
   - Remove/replace identifiers (variable/function names) with placeholders.
   - Normalize literals (numbers/strings) optionally.
   - Strip comments/whitespace.
3. Produce a normalized token sequence or normalized source text for each file.
4. Build a per-assignment corpus and compute **TF‑IDF vectors** (scikit-learn).
5. Compute **cosine similarity** pairwise:
   - Optimize: only compare within assignment; cap file size; optionally compare at submission-level by concatenation.
6. Flag matches:
   - Default threshold: `0.80`
   - Store both `similarity_score` and `flagged` boolean.

### Backend — steps (pipeline + persistence)
1. Implement worker job for `assignment_id`:
   - Fetch submission file(s) from GCS for that assignment.
   - Run algorithm above.
2. Write results to BigQuery `similarity_pairs`:
   - Required columns:
     - `assignment_id`
     - `submission_a`, `submission_b`
     - `similarity_score` (float)
     - `flagged` (bool)
     - `created_at`
   - Add optional evidence fields:
     - `top_matching_files` (array)
     - `evidence_snippets` (string/JSON) if you implement diff evidence
3. Implement query endpoints:
   - `GET /v1/plagiarism/pairs?assignment_id=...&min_score=...`
   - `GET /v1/plagiarism/matrix?assignment_id=...` (optional; FE can build matrix from pairs)

### Frontend — steps (visualization)
1. **Similarity Matrix View**
   - Color rules:
     - red > 0.80
     - amber 0.60–0.80
     - green < 0.60
2. **Ranked pairs table** with sorting/filtering by score and flagged.
3. **Plagiarism Report** (phase 1):
   - Side-by-side file display for two submissions (basic).
   - Later enhancement: highlighted matching sections if evidence is available.

### Integration checkpoint
- `POST /v1/analysis/run?assignment_id=...` completes and BigQuery has rows in `similarity_pairs`.
- UI can display top flagged pairs and a matrix view for an assignment.

---

## Stage 4 — Vertex AI code review: prompt → JSON → validate → store → render 

### Goal
Generate consistent, structured AI reviews for a submission using Gemini Pro on Vertex AI, store in BigQuery, and display in the dashboard.

### AI integration team — steps (prompt + schema)
1. Freeze the JSON schema (this is the “contract” between model and system):
   - `bugs[]`: `{ line?: number, description: string, severity?: "low"|"med"|"high" }`
   - `code_smells[]`: strings or objects
   - `suggestions[]`: strings
   - `complexity_rating`: 1–10
   - `overall_score`: 0–100
2. Write a **system prompt** that forces “JSON only, no prose”.
3. Add guardrails:
   - Max file size / token budget
   - Timeout and retry policy
   - Fallback behavior: if JSON invalid, return a structured error + request_id

### Backend — steps (Vertex AI call + validation)
1. Enable Vertex AI API + runtime SA permissions (`aiplatform.user` per plan).
2. Implement:
   - `POST /v1/review/{submission_id}`
   - Backend reads code from GCS, calls Vertex AI (Gemini Pro), receives response.
3. Validate response:
   - Parse JSON strictly.
   - Validate with Pydantic models (reject extra prose).
4. Store in BigQuery `ai_reviews`:
   - `submission_id`, `assignment_id`, `review_json`, `overall_score`, `created_at`, `model_version`, `prompt_version`
5. Add `GET /v1/review/{submission_id}` to fetch cached review.

### Frontend — steps (AI Review Panel)
1. Add “Generate review” button per submission (and/or auto-run after upload).
2. Render **collapsible sections**:
   - Bugs, Code Smells, Suggestions
3. Display `overall_score` and `complexity_rating` clearly.

### Integration checkpoint
- Calling `/v1/review/{submission_id}` returns schema-valid JSON.
- BigQuery contains the stored review.
- UI renders review consistently across multiple submissions.

---

## Stage 5 — Full deployment + CI/CD + staging demo readiness 

### Goal
End-to-end system is deployed on Cloud Run, accessible via a public URL for demos, and stable under basic load.

### Backend/DevOps — steps
1. Containerize backend cleanly:
   - `PORT=8080`, production server (e.g. uvicorn/gunicorn combo)
2. Artifact Registry:
   - create repo (Docker)
3. Cloud Build:
   - build image → push → deploy Cloud Run
4. Cloud Run service config (from plan; adjust if needed):
   - `min-instances=0` (set to `1` before demo to avoid cold starts)
   - `max-instances=10`
   - memory ~512Mi, cpu 1
   - env vars and secrets for:
     - `GCS_BUCKET`
     - `BQ_DATASET`
     - `VERTEX_PROJECT/REGION`
     - `PUBSUB_TOPIC`
5. Add `/docs` (FastAPI Swagger) and ensure it matches `openapi.yaml`.

### Frontend deployment — steps
Choose one and commit to it:
- **Option A**: Firebase Hosting for FE + Cloud Run for API
- **Option B**: Serve FE from Cloud Run as a separate service

### Integration checkpoint (staging demo script)
- Upload from dashboard → see submissions list.
- Trigger analysis → see similarity pairs + matrix.
- Open a flagged pair → view side-by-side report.
- Run AI review → view structured feedback.

---

## Stage 6 — Hardening, performance, and “final submission” readiness 

### Goal
Make the system reliable in front of evaluators: clear UX, predictable runtime, cost controls, and strong evidence for report/viva.

### Engineering hardening
- **Quotas & caching**
  - Cache AI review outputs (BigQuery already) and add “pre-cache” for demo submissions.
  - Add Vertex AI quota monitoring; request increases early if needed.
- **Cost control**
  - BigQuery: partition tables by `created_at` and/or `assignment_id`.
  - Add budget alerts ($10/$20) as in plan.
- **Performance**
  - Reduce redundant downloads from GCS; stream files; cap file sizes.
  - For plagiarism: batch per assignment; optimize pair generation.
- **Security (minimum viable)**
  - If using Firebase Auth/OAuth2: protect instructor endpoints.
  - Lock bucket permissions; avoid public bucket access.

### Testing & QA checklist
- Contract tests: ensure FE/BE schema stability.
- Regression “golden set”: a small fixed set of submissions with expected similarity ordering.
- AI review snapshot tests: validate schema even if text differs.

### Final deliverables (matches PDF checklist)
- 4+ GCP services integrated: **GCS, BigQuery, Vertex AI, Cloud Run** (plus Cloud Build/Artifact Registry)
- Public Cloud Run URL with all endpoints working
- Presentation-ready demo flow + screenshots
- Report artifacts: architecture diagram, sequence diagrams, benchmarks, cost estimate, rubric mapping

---

## Appendix A — Minimum endpoint set (suggested)
- `GET /health`
- `POST /v1/submissions/upload`
- `GET /v1/submissions?assignment_id=...`
- `POST /v1/analysis/run?assignment_id=...`
- `GET /v1/plagiarism/pairs?assignment_id=...`
- `GET /v1/review/{submission_id}`
- `POST /v1/review/{submission_id}`

## Appendix B — BigQuery tables (minimum fields)
- `submissions`: `submission_id`, `assignment_id`, `student_id`, `gcs_prefix`, `status`, `created_at`, `error_message?`
- `similarity_pairs`: `assignment_id`, `submission_a`, `submission_b`, `similarity_score`, `flagged`, `created_at`, `evidence_snippets?`
- `ai_reviews`: `submission_id`, `assignment_id`, `review_json`, `overall_score`, `complexity_rating`, `created_at`, `model_version`, `prompt_version`

