# Plagiarism Engine Integration

The plagiarism engine has been integrated into the backend!

## ✅ What's Been Done

1. **Updated `services/plagiarism_service.py`**:
   - Now uses the full plagiarism engine (AST + TF-IDF)
   - Added `analyze_assignment_plagiarism()` function
   - Returns similarity matrix and flagged pairs for frontend

2. **Updated `routes/plagiarism.py`**:
   - Added `GET /api/plagiarism/analyze/{assignment_id}` endpoint
   - Kept existing `POST /api/plagiarism/compare` endpoint

3. **Updated `requirements.txt`**:
   - Added `tree-sitter==0.20.1`
   - Added `numpy==1.26.3`

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup Plagiarism Engine

```bash
cd ../plagiarism_engine
python setup_languages.py
```

This will download and compile tree-sitter language parsers (~2-3 minutes).

### 3. Run Backend

```bash
cd ../backend
uvicorn main:app --reload
```

## 📡 API Endpoints

### Analyze Assignment (NEW)

```http
GET /api/plagiarism/analyze/{assignment_id}
```

**Response:**
```json
{
  "success": true,
  "assignment_id": "lab1",
  "similarity_matrix": {
    "student_001": {
      "student_001": 0,
      "student_002": 95,
      "student_003": 35
    },
    "student_002": {
      "student_001": 95,
      "student_002": 0,
      "student_003": 33
    },
    "student_003": {
      "student_001": 35,
      "student_002": 33,
      "student_003": 0
    }
  },
  "flagged_pairs": [
    {
      "id": "1",
      "studentA": "student_001",
      "studentB": "student_002",
      "similarity": 95,
      "filesMatched": 1
    }
  ],
  "statistics": {
    "total_submissions": 3,
    "total_pairs": 3,
    "flagged_pairs": 1,
    "mean_similarity": 0.42
  },
  "total_submissions": 3
}
```

### Compare Two Files (Existing)

```http
POST /api/plagiarism/compare
Content-Type: application/json

{
  "file_id_1": "uuid-1",
  "file_id_2": "uuid-2"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "similarity_score": 0.95,
    "is_plagiarised": true,
    "file1": {
      "file_id": "uuid-1",
      "filename": "solution.py"
    },
    "file2": {
      "file_id": "uuid-2",
      "filename": "solution.py"
    },
    "method": "AST + TF-IDF + Cosine Similarity"
  }
}
```

## 🎨 Frontend Integration

The frontend plagiarism page expects this exact format:

```typescript
interface SimilarityData {
  [key: string]: { [key: string]: number };  // 0-100 scale
}

interface FlaggedPair {
  id: string;
  studentA: string;
  studentB: string;
  similarity: number;  // 0-100 scale
  filesMatched: number;
}
```

The backend now returns data in this format!

## 🧪 Testing

### Test the analyze endpoint:

```bash
# Upload some files first
curl -X POST http://localhost:8000/api/upload \
  -F "file=@test1.py" \
  -F "student_id=student_001" \
  -F "assignment=lab1"

curl -X POST http://localhost:8000/api/upload \
  -F "file=@test2.py" \
  -F "student_id=student_002" \
  -F "assignment=lab1"

# Then analyze
curl http://localhost:8000/api/plagiarism/analyze/lab1
```

## 📝 How It Works

1. **Frontend calls**: `GET /api/plagiarism/analyze/lab1`
2. **Backend**:
   - Fetches all submissions for "lab1" from database
   - Reads file contents from disk
   - Passes to plagiarism engine
   - Engine analyzes all pairs using AST + TF-IDF
   - Returns similarity matrix and flagged pairs
3. **Frontend receives**: Matrix and pairs in the expected format
4. **Frontend displays**: Similarity matrix heatmap and flagged pairs table

## ✅ Integration Complete!

The plagiarism engine is now fully integrated with the backend and ready to use with the frontend.

**Next steps:**
1. Test with real submissions
2. Adjust threshold if needed (currently 0.80 = 80%)
3. Add caching for large assignments (optional)
