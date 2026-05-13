# Integration Guide — Code Review & Plagiarism Detection Backend

## Folder Structure

```
backend/
├── main.py                      ← FastAPI app, CORS, router registration
├── plagiarism.py                ← YOUR MODULE (plagiarism teammate fills this)
├── ai_review.py                 ← YOUR MODULE (AI review teammate fills this)
├── requirements.txt
│
├── routes/
│   ├── upload.py                ← POST /api/upload/
│   ├── plagiarism.py            ← POST /api/plagiarism/compare
│   └── review.py                ← POST /api/review/
│
├── services/
│   ├── plagiarism_service.py    ← calls plagiarism.py, handles file resolution
│   └── review_service.py        ← calls ai_review.py, handles file resolution
│
├── utils/
│   └── file_utils.py            ← file save/read/list helpers
│
└── uploads/                     ← all uploaded files land here (git-ignored)
```

---

## Setup (do this once)

```bash
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

---

## Run the server

```bash
uvicorn main:app --reload --port 8000
```

Interactive API docs → http://localhost:8000/docs

---

## API Reference

### 1. Upload a file

**POST** `/api/upload/`

| Field | Type | Description |
|-------|------|-------------|
| `file` | form-data | The code file to upload |

**Response**
```json
{
  "success": true,
  "file_id": "3f2a1b4c-...",
  "filename": "solution.py",
  "size_bytes": 1024,
  "message": "File uploaded successfully."
}
```
> Save the `file_id` — you'll need it for the next two calls.

---

### 2. Compare two files for plagiarism

**POST** `/api/plagiarism/compare`

```json
{
  "file_id_1": "3f2a1b4c-...",
  "file_id_2": "7e9d0f1a-..."
}
```

**Response**
```json
{
  "success": true,
  "result": {
    "similarity_score": 0.87,
    "is_plagiarised": true,
    "highlighted_lines": ["def bubble_sort(arr):", "for i in range(len(arr)):"],
    "method": "AST + TF-IDF cosine similarity",
    "file1": { "file_id": "3f2a1b4c-...", "filename": "solution.py" },
    "file2": { "file_id": "7e9d0f1a-...", "filename": "submission2.py" }
  }
}
```

---

### 3. AI code review

**POST** `/api/review/`

```json
{
  "file_id": "3f2a1b4c-..."
}
```

**Response**
```json
{
  "success": true,
  "result": {
    "quality_score": 74,
    "bugs": ["Variable 'x' used before assignment on line 12"],
    "code_smells": ["Function exceeds 50 lines", "Magic numbers used"],
    "best_practices": ["Add type hints", "Break into smaller functions"],
    "complexity": "medium",
    "summary": "The code is functional but could be improved...",
    "file": { "file_id": "3f2a1b4c-...", "filename": "solution.py", "language": "python" }
  }
}
```

---

### 4. List all uploaded files

**GET** `/api/upload/list`

```json
{
  "success": true,
  "count": 3,
  "files": [
    { "file_id": "3f2a1b4c", "filename": "solution.py", "size_bytes": 1024, "path": "uploads/..." }
  ]
}
```

---

## For the Plagiarism Teammate

Open `plagiarism.py` (root of backend/). Fill in `detect_plagiarism()`:

```python
def detect_plagiarism(file1_content: str, file2_content: str) -> dict:
    # Your AST parsing + TF-IDF + cosine similarity logic here
    return {
        "similarity_score": 0.87,       # float 0.0–1.0
        "is_plagiarised": True,          # bool
        "highlighted_lines": [...],      # list of suspicious code snippets
        "method": "AST + TF-IDF",       # string label
    }
```

**Do not change the return shape.** The backend wraps it automatically.

---

## For the AI Review Teammate

Open `ai_review.py` (root of backend/). Fill in `review_code()`:

```python
def review_code(file_content: str, language: str = "unknown") -> dict:
    # Call Vertex AI / Gemini / OpenAI here
    return {
        "quality_score": 74,            # int 0–100
        "bugs": [...],                   # list[str]
        "code_smells": [...],            # list[str]
        "best_practices": [...],         # list[str]
        "complexity": "medium",          # 'low' | 'medium' | 'high'
        "summary": "...",               # str
    }
```

**Do not change the return shape.** The backend wraps it automatically.

---

## For the React Frontend Teammate

Base URL: `http://localhost:8000`

### Upload a file
```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const res = await fetch("http://localhost:8000/api/upload/", {
  method: "POST",
  body: formData,
});
const { file_id, filename } = await res.json();
```

### Compare two files
```javascript
const res = await fetch("http://localhost:8000/api/plagiarism/compare", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ file_id_1: id1, file_id_2: id2 }),
});
const { result } = await res.json();
// result.similarity_score, result.is_plagiarised, result.highlighted_lines
```

### AI review
```javascript
const res = await fetch("http://localhost:8000/api/review/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ file_id: fileId }),
});
const { result } = await res.json();
// result.quality_score, result.bugs, result.summary, ...
```

### List files
```javascript
const res = await fetch("http://localhost:8000/api/upload/list");
const { files } = await res.json();
```

---

## Error Responses

All errors follow the same shape:

```json
{ "detail": "Human-readable error message here" }
```

| HTTP Code | Meaning |
|-----------|---------|
| 400 | Bad request (wrong file type, same file compared, etc.) |
| 404 | File ID not found |
| 500 | Unexpected server error |

---

## System Flow

```
React Frontend
      │
      │  POST /api/upload/          (multipart form)
      ▼
FastAPI Backend (main.py)
      │
      ├── routes/upload.py          saves file, returns file_id
      │
      │  POST /api/plagiarism/compare  (JSON body)
      ├── routes/plagiarism.py
      │       └── services/plagiarism_service.py
      │               └── plagiarism.py  ← teammate fills this
      │
      │  POST /api/review/          (JSON body)
      └── routes/review.py
              └── services/review_service.py
                      └── ai_review.py   ← teammate fills this
```