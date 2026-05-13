# AI Code Review Service

AI-powered code review using Google Vertex AI (Gemini). Part of the Cloud Code Review & Plagiarism Detection platform.

---

## What This Does

Given a student's submitted code (via GCS or direct input), this service:

1. Fetches the code from Google Cloud Storage
2. Sends it to Gemini 1.5 Flash on Vertex AI with a structured prompt
3. Parses the AI's JSON response
4. Returns a structured review: bugs, code smells, suggestions, complexity, score
5. Stores results in BigQuery (optional)

---

## File Structure

```
ai-review/
├── app/
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Environment config
│   ├── routes/
│   │   └── review.py            # API endpoints
│   ├── services/
│   │   ├── vertex_service.py    # Vertex AI / Gemini integration
│   │   ├── prompt_service.py    # Prompt engineering
│   │   ├── parser_service.py    # JSON parsing & cleanup
│   │   ├── gcs_service.py       # Google Cloud Storage
│   │   └── bigquery_service.py  # BigQuery storage
│   └── models/
│       └── review_schema.py     # Pydantic schemas
├── test_local.py                # Quick Gemini test (no GCS needed)
├── requirements.txt
├── Dockerfile
├── cloudbuild.yaml
├── .env.example
└── .gitignore
```

---

## Setup

### 1. Clone & install

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Set up GCP

1. Create a GCP project
2. Enable: **Vertex AI API**, **Cloud Storage API**, **BigQuery API**
3. Create a Service Account with roles:
   - `Vertex AI User`
   - `Storage Object Viewer`
   - `BigQuery Data Editor`
4. Download the JSON key

### 3. Configure credentials

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env with your actual values
```

---

## Running Locally

### Quick test (no GCS, no FastAPI)

```bash
python test_local.py
```

This tests Gemini directly with sample buggy code. Run this first.

### Run FastAPI server

```bash
uvicorn app.main:app --reload
```

Open: http://localhost:8000/docs

---

## API Endpoints

### GET `/api/review/{submission_id}`

Review code stored in GCS under `submissions/{submission_id}/`.

**Response:**
```json
{
  "submission_id": "sub_101",
  "filename": "solution.py",
  "review": {
    "bugs": [
      { "line": 5, "description": "Possible division by zero" }
    ],
    "code_smells": ["No error handling", "Magic numbers"],
    "suggestions": ["Add try-except block", "Use named constants"],
    "complexity_rating": 4,
    "overall_score": 72
  },
  "status": "success"
}
```

### POST `/api/review/direct`

Paste code directly — no GCS required. Great for testing.

**Request body:**
```json
{
  "code": "def add(a, b):\n    return a + b",
  "filename": "solution.py"
}
```

### GET `/api/review/health`

Health check for this module.

---

## GCS File Structure Expected

The backend must store uploaded files at:

```
gs://{BUCKET_NAME}/submissions/{submission_id}/{filename}
```

Example:
```
gs://my-bucket/submissions/abc-123/solution.py
```

---

## Integration with Main Backend

The backend member adds this to their `main.py`:

```python
from app.routes.review import router as review_router
app.include_router(review_router, prefix="/api", tags=["review"])
```

That's it. Your endpoint is live.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PROJECT_ID` | GCP Project ID | required |
| `LOCATION` | GCP region | `us-central1` |
| `BUCKET_NAME` | GCS bucket name | required |
| `MODEL_NAME` | Gemini model | `gemini-1.5-flash` |
| `BIGQUERY_DATASET` | BQ dataset name | `code_review` |
| `BIGQUERY_TABLE` | BQ table name | `reviews` |

---

## Deployment (Cloud Run)

```bash
gcloud run deploy ai-review-service \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

Or use `cloudbuild.yaml` for CI/CD via Cloud Build.

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| Gemini 1.5 Flash | Fast, cheap, sufficient for code review |
| `response_mime_type="application/json"` | Forces clean JSON from Gemini |
| Pydantic validation | Ensures consistent output even if Gemini misbehaves |
| BigQuery optional | Won't break the API if BQ fails |
| Two endpoints (GCS + direct) | Easier testing and demo |
