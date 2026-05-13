# Plagiarism Engine - Integration Instructions

**For Backend Team (Person 1)**

This document contains everything you need to integrate the plagiarism engine into your FastAPI backend.

---

## ✅ What's Ready

The plagiarism engine is **complete and tested**. It includes:
- Core engine code (`plagiarism_engine/` folder)
- All dependencies listed in `requirements.txt`
- Setup script for language parsers
- Documentation and examples
- Unit tests

---

## 📋 Prerequisites on Your System

### 1. Python
- **Version**: Python 3.8 - 3.11 (NOT 3.12 yet - compatibility issues)
- Check: `python --version`

### 2. Git
- **Required for**: Downloading tree-sitter language grammars
- Check: `git --version`
- Install: https://git-scm.com/downloads

### 3. pip
- **Required for**: Installing Python packages
- Check: `pip --version`
- Usually comes with Python

---

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd CloudProject
```

### Step 2: Create Virtual Environment (Recommended)

```bash
# Create venv
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
cd plagiarism_engine
pip install -r requirements.txt
```

**This installs:**
- `tree-sitter==0.20.1` - AST parser
- `scikit-learn==1.4.0` - TF-IDF and similarity
- `numpy==1.26.3` - Numerical operations
- `pytest==7.4.3` - Testing framework
- `setuptools>=65.0.0` - Python 3.12 compatibility

### Step 4: Build Language Parsers (One-Time Setup)

```bash
python setup_languages.py
```

**This will:**
1. Clone tree-sitter language grammars from GitHub (~2-3 minutes)
2. Compile them into `build/languages.so`
3. Create `build/` directory with language parsers

**Expected output:**
```
Setting up tree-sitter language parsers...

1. Cloning language repositories...
  Cloning python (v0.20.4)...
  ✓ python cloned successfully
  Cloning javascript (v0.20.4)...
  ✓ javascript cloned successfully
  ...

2. Building language library...
  ✓ Language library built successfully
  Location: build/languages.so

✓ Setup complete! You can now use the plagiarism engine.
```

### Step 5: Verify Installation

```bash
cd ..
python quick_test.py
```

**Expected output:**
```
✓ Plagiarism engine imported successfully
✓ Test 1: PASS (identical code)
✓ Test 2: PASS (renamed variables)
✓ Test 3: PASS (different algorithms)
...
```

---

## 📦 What to Push to Git

### ✅ **DO Push:**
```
CloudProject/
├── plagiarism_engine/
│   ├── __init__.py
│   ├── engine.py
│   ├── parser.py
│   ├── normalizer.py
│   ├── similarity.py
│   ├── setup_languages.py
│   ├── requirements.txt
│   └── README.md
├── examples/
│   └── basic_usage.py
├── tests/
│   └── test_engine.py
├── test_data/
│   └── sample_submissions/
│       ├── alice_factorial.py
│       ├── bob_factorial.py
│       ├── charlie_factorial.py
│       └── diana_factorial.py
├── .gitignore
├── README.md
├── SETUP_GUIDE.md
├── API_REFERENCE.md
├── ARCHITECTURE.md
├── PROJECT_STATUS.md
├── INTEGRATION_INSTRUCTIONS.md  (this file)
└── quick_test.py
```

### ❌ **DO NOT Push:**
```
venv/                           # Virtual environment
__pycache__/                    # Python cache
*.pyc                           # Compiled Python
plagiarism_engine/build/        # Generated during setup
*.log                           # Log files
.env                            # Environment variables
```

**Note**: The `.gitignore` file already excludes these.

---

## 🔧 Backend Integration

### Option 1: Import Directly (Recommended for Development)

```python
# backend/main.py
from plagiarism_engine import PlagiarismEngine

# Initialize once at startup
engine = PlagiarismEngine(threshold=0.80)

@app.post("/v1/analysis/run")
async def analyze_plagiarism(assignment_id: str):
    # Fetch submissions from database/GCS
    submissions = fetch_submissions(assignment_id)
    
    # Run analysis
    results = engine.analyze_submissions(submissions, assignment_id)
    
    # Store results in BigQuery
    store_results(results)
    
    return {
        "status": "completed",
        "flagged_pairs": len(results['flagged_pairs'])
    }
```

### Option 2: Install as Package (Recommended for Production)

```bash
# In your backend directory
pip install -e ../plagiarism_engine
```

Then import normally:
```python
from plagiarism_engine import PlagiarismEngine
```

---

## 🐳 Docker Integration

### Dockerfile Example

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install git (required for setup_languages.py)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy and install plagiarism engine
COPY plagiarism_engine/ ./plagiarism_engine/
RUN pip install -r plagiarism_engine/requirements.txt

# Build language parsers (one-time during image build)
RUN cd plagiarism_engine && python setup_languages.py

# Copy backend code
COPY backend/ ./backend/

# Install backend dependencies
RUN pip install -r backend/requirements.txt

# Expose port
EXPOSE 8080

# Start server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

---

## 📝 Backend Requirements

Add to your `backend/requirements.txt`:

```txt
# Existing backend dependencies
fastapi==0.104.1
uvicorn==0.24.0
google-cloud-storage==2.10.0
google-cloud-bigquery==3.13.0
# ... other dependencies

# Plagiarism engine dependencies
tree-sitter==0.20.1
scikit-learn==1.4.0
numpy==1.26.3
```

---

## 🔌 API Endpoints to Create

### 1. Trigger Analysis

```python
@app.post("/v1/analysis/run")
async def trigger_analysis(assignment_id: str):
    """
    Trigger plagiarism analysis for an assignment.
    
    Steps:
    1. Fetch all submissions for assignment from GCS
    2. Run plagiarism engine
    3. Store results in BigQuery
    4. Update submission status
    """
    # Your implementation here
    pass
```

### 2. Get Results

```python
@app.get("/v1/plagiarism/pairs")
async def get_similarity_pairs(
    assignment_id: str,
    min_score: float = 0.0,
    flagged_only: bool = False
):
    """
    Get similarity pairs for an assignment.
    
    Returns:
    {
        "pairs": [
            {
                "submission_a": "uuid",
                "submission_b": "uuid",
                "student_a": "alice",
                "student_b": "bob",
                "similarity_score": 0.95,
                "flagged": true
            }
        ]
    }
    """
    # Query BigQuery for results
    pass
```

### 3. Get Similarity Matrix

```python
@app.get("/v1/plagiarism/matrix")
async def get_similarity_matrix(assignment_id: str):
    """
    Get similarity matrix for visualization.
    
    Returns:
    {
        "students": ["alice", "bob", "charlie"],
        "matrix": [
            [1.0, 0.95, 0.35],
            [0.95, 1.0, 0.33],
            [0.35, 0.33, 1.0]
        ]
    }
    """
    pass
```

---

## 💾 BigQuery Schema

### Table: `similarity_pairs`

```sql
CREATE TABLE `project.dataset.similarity_pairs` (
    assignment_id STRING NOT NULL,
    submission_a STRING NOT NULL,
    submission_b STRING NOT NULL,
    student_a STRING NOT NULL,
    student_b STRING NOT NULL,
    similarity_score FLOAT64 NOT NULL,
    flagged BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP()
);

-- Index for fast queries
CREATE INDEX idx_assignment ON similarity_pairs(assignment_id);
CREATE INDEX idx_flagged ON similarity_pairs(flagged);
```

---

## 🧪 Testing Integration

### Test 1: Import Engine

```python
# test_import.py
from plagiarism_engine import PlagiarismEngine

engine = PlagiarismEngine(threshold=0.80)
print("✓ Engine imported successfully")
```

### Test 2: Analyze Sample Data

```python
# test_analysis.py
from plagiarism_engine import PlagiarismEngine

engine = PlagiarismEngine(threshold=0.80)

submissions = [
    {
        'id': 'sub_1',
        'student_id': 'alice',
        'code': 'def add(a, b): return a + b',
        'filename': 'test.py'
    },
    {
        'id': 'sub_2',
        'student_id': 'bob',
        'code': 'def sum(x, y): return x + y',
        'filename': 'test.py'
    }
]

results = engine.analyze_submissions(submissions)
print(f"✓ Analysis complete: {len(results['flagged_pairs'])} flagged pairs")
```

---

## 🐛 Troubleshooting

### Error: "No module named 'tree_sitter'"

**Solution:**
```bash
pip install -r plagiarism_engine/requirements.txt
```

### Error: "Tree-sitter languages library not found"

**Solution:**
```bash
cd plagiarism_engine
python setup_languages.py
```

### Error: "Incompatible Language version"

**Solution:**
```bash
# Delete old build
rm -rf plagiarism_engine/build

# Rebuild with correct versions
cd plagiarism_engine
python setup_languages.py
```

### Error: "After pruning, no terms remain"

**Solution:** This is already fixed in the latest code. Make sure you have the updated `similarity.py`.

---

## 📚 Documentation Reference

- **API Reference**: `API_REFERENCE.md` - Complete API documentation
- **Setup Guide**: `SETUP_GUIDE.md` - Detailed setup instructions
- **Architecture**: `ARCHITECTURE.md` - System architecture diagrams
- **Engine README**: `plagiarism_engine/README.md` - Engine-specific docs

---

## ✅ Integration Checklist

Before integrating, ensure:

- [ ] Python 3.8-3.11 installed
- [ ] Git installed
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Language parsers built (`python setup_languages.py`)
- [ ] Quick test passes (`python quick_test.py`)
- [ ] Can import engine (`from plagiarism_engine import PlagiarismEngine`)
- [ ] Sample analysis works (see Test 2 above)

---

## 🚀 Next Steps

1. **Backend Team**: Create FastAPI endpoints (see API Endpoints section)
2. **Data Team**: Set up BigQuery schema (see BigQuery Schema section)
3. **Integration**: Connect engine to GCS file fetching
4. **Testing**: End-to-end test with real submissions
5. **Deployment**: Add to Dockerfile and deploy to Cloud Run

---

## 📞 Support

- **Component Owner**: Person 3 (Plagiarism Engine Lead)
- **Documentation**: See `README.md`, `API_REFERENCE.md`, `SETUP_GUIDE.md`
- **Issues**: Run `python quick_test.py` for diagnostics

---

## 🎯 Summary

**What you need to do:**
1. Install Python 3.8-3.11 + Git
2. Clone repo
3. `pip install -r plagiarism_engine/requirements.txt`
4. `python plagiarism_engine/setup_languages.py`
5. Import and use: `from plagiarism_engine import PlagiarismEngine`

**What's already done:**
- ✅ Core engine complete
- ✅ All dependencies specified
- ✅ Setup script ready
- ✅ Documentation complete
- ✅ Tests passing

**Ready for integration!** 🚀
