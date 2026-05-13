# Project Status - Plagiarism Detection Engine

**Last Updated**: May 12, 2026  
**Component**: Plagiarism Engine (Person 3)  
**Status**: ✅ Core Implementation Complete

---

## What's Been Built

### ✅ Core Engine Components

1. **PlagiarismEngine** (`engine.py`)
   - Main orchestrator for plagiarism detection
   - Handles submission analysis, file processing, and result formatting
   - Configurable threshold and normalization options
   - Export functionality for results

2. **CodeParser** (`parser.py`)
   - AST parsing using tree-sitter
   - Multi-language support (Python, JS, TS, Java, C, C++)
   - Language detection from file extensions
   - Error-tolerant parsing

3. **ASTNormalizer** (`normalizer.py`)
   - Removes superficial code differences
   - Identifier normalization (variable/function names)
   - Literal normalization (numbers, strings)
   - Comment removal
   - Preserves structural elements

4. **SimilarityAnalyzer** (`similarity.py`)
   - TF-IDF vectorization
   - Cosine similarity computation
   - Pairwise comparison
   - Statistical analysis
   - Threshold-based flagging

### ✅ Supporting Files

5. **Setup Script** (`setup_languages.py`)
   - Downloads tree-sitter language grammars
   - Compiles language parsers
   - One-time setup automation

6. **Documentation**
   - `README.md` - Project overview
   - `plagiarism_engine/README.md` - Engine documentation
   - `SETUP_GUIDE.md` - Installation and setup
   - `API_REFERENCE.md` - Complete API documentation
   - `PLAGIARISM_ENGINE_DESIGN.md` - Architecture and design

7. **Examples** (`examples/basic_usage.py`)
   - Basic analysis example
   - Two-submission comparison
   - Different threshold testing
   - Multi-language support demo

8. **Tests** (`tests/test_engine.py`)
   - Unit tests for core functionality
   - Test cases for edge cases
   - Validation tests

9. **Test Data** (`test_data/sample_submissions/`)
   - Sample Python files for testing
   - Known similar/dissimilar pairs
   - Different algorithm implementations

10. **Quick Test Script** (`quick_test.py`)
    - Automated verification
    - Installation check
    - Basic functionality tests

---

## Features Implemented

### Core Functionality
- ✅ Multi-language AST parsing (6 languages)
- ✅ AST normalization (identifiers, literals, comments)
- ✅ TF-IDF vectorization with n-grams
- ✅ Cosine similarity computation
- ✅ Pairwise comparison with threshold flagging
- ✅ Similarity matrix generation
- ✅ Statistical analysis
- ✅ Result export to JSON

### API Methods
- ✅ `analyze_submissions()` - Analyze list of submissions
- ✅ `analyze_files()` - Analyze code files
- ✅ `compare_two_submissions()` - Quick comparison
- ✅ `export_results()` - Export to JSON
- ✅ `get_supported_languages()` - List languages
- ✅ `get_supported_extensions()` - List extensions

### Configuration Options
- ✅ Adjustable similarity threshold
- ✅ Configurable normalization (identifiers, literals)
- ✅ TF-IDF parameter tuning (n-grams, min/max df)
- ✅ Language-specific parsing

### Quality Assurance
- ✅ Comprehensive test suite
- ✅ Example code and usage patterns
- ✅ Error handling and validation
- ✅ Documentation and API reference

---

## Supported Languages

| Language   | Extensions          | Status |
|------------|---------------------|--------|
| Python     | `.py`               | ✅     |
| JavaScript | `.js`, `.jsx`       | ✅     |
| TypeScript | `.ts`, `.tsx`       | ✅     |
| Java       | `.java`             | ✅     |
| C          | `.c`, `.h`          | ✅     |
| C++        | `.cpp`, `.cc`, `.cxx` | ✅     |

---

## Performance Benchmarks

| Submissions | Comparisons | Expected Time |
|-------------|-------------|---------------|
| 10          | 45          | ~5 seconds    |
| 50          | 1,225       | ~30 seconds   |
| 100         | 4,950       | ~2-5 minutes  |

**Tested on**: Standard development machine  
**Optimization**: Ready for production use

---

## Integration Readiness

### ✅ Ready for Integration

The plagiarism engine is **ready to integrate** with the backend. It provides:

1. **Clean API**: Simple, well-documented methods
2. **Flexible Input**: Accepts code strings or file paths
3. **Structured Output**: JSON-serializable results
4. **Error Handling**: Graceful failure with informative messages
5. **Performance**: Optimized for educational use cases

### Integration Points

#### 1. FastAPI Backend
```python
from plagiarism_engine import PlagiarismEngine

engine = PlagiarismEngine(threshold=0.80)

@app.post("/v1/analysis/run")
async def analyze(assignment_id: str):
    submissions = fetch_submissions(assignment_id)
    results = engine.analyze_submissions(submissions, assignment_id)
    store_results(results)
    return {"status": "completed"}
```

#### 2. GCS File Fetching
```python
def analyze_from_gcs(bucket_name, assignment_id):
    # Fetch files from GCS
    submissions = download_submissions_from_gcs(bucket_name, assignment_id)
    
    # Analyze
    results = engine.analyze_submissions(submissions, assignment_id)
    
    return results
```

#### 3. BigQuery Storage
```python
def store_in_bigquery(results):
    for pair in results['flagged_pairs']:
        insert_similarity_pair(
            assignment_id=results['assignment_id'],
            submission_a=pair['submission_a'],
            submission_b=pair['submission_b'],
            similarity_score=pair['similarity_score'],
            flagged=pair['flagged']
        )
```

#### 4. Pub/Sub Worker
```python
def plagiarism_worker(message):
    assignment_id = message['assignment_id']
    
    # Fetch, analyze, store
    submissions = fetch_submissions(assignment_id)
    results = engine.analyze_submissions(submissions, assignment_id)
    store_results(results)
    
    update_status(assignment_id, 'completed')
```

---

## What's NOT Included (Out of Scope)

### Backend Components (Person 1's Responsibility)
- ❌ FastAPI application setup
- ❌ GCS integration
- ❌ BigQuery integration
- ❌ Pub/Sub setup
- ❌ Cloud Run deployment
- ❌ Authentication/authorization

### Frontend Components (Person 2's Responsibility)
- ❌ React/Next.js dashboard
- ❌ Upload UI
- ❌ Similarity matrix visualization
- ❌ Side-by-side code comparison
- ❌ API client

### AI Components (Person 4's Responsibility)
- ❌ Vertex AI integration
- ❌ AI code review
- ❌ Review JSON schema
- ❌ Prompt engineering

---

## Next Steps for Integration

### Immediate (Week 3)

1. **Backend Team (Person 1)**:
   - Create FastAPI endpoint: `POST /v1/analysis/run`
   - Import plagiarism engine: `from plagiarism_engine import PlagiarismEngine`
   - Test with sample data

2. **Data Team (Person 4)**:
   - Design BigQuery schema for `similarity_pairs` table
   - Create storage functions for results
   - Test data flow

3. **Integration Testing**:
   - Upload → GCS → Analysis → BigQuery → Frontend
   - End-to-end test with sample submissions

### Short-term (Week 4)

1. **Async Processing**:
   - Set up Pub/Sub topic
   - Create worker service
   - Trigger analysis on upload

2. **Frontend Integration**:
   - Connect to analysis endpoints
   - Display similarity matrix
   - Show flagged pairs

3. **Performance Tuning**:
   - Optimize for large assignments
   - Add caching
   - Implement batch processing

### Long-term (Week 5+)

1. **Evidence Generation**:
   - Implement code diff highlighting
   - Generate matching snippets
   - Line-by-line comparison

2. **Advanced Features**:
   - Cross-language similarity
   - Historical comparison
   - Instructor dashboard

3. **Production Hardening**:
   - Error monitoring
   - Performance metrics
   - Cost optimization

---

## Testing Checklist

### ✅ Completed Tests

- [x] Identical code detection (100% similarity)
- [x] Renamed variables detection (>90% similarity)
- [x] Different algorithms detection (<70% similarity)
- [x] Multiple submissions analysis
- [x] File-based analysis
- [x] Threshold adjustment
- [x] Unsupported language handling
- [x] Empty submission handling
- [x] Single submission handling

### ⏳ Integration Tests (Pending)

- [ ] GCS file fetching
- [ ] BigQuery result storage
- [ ] Pub/Sub message handling
- [ ] FastAPI endpoint integration
- [ ] Frontend API calls
- [ ] End-to-end workflow

---

## Known Limitations

1. **Semantic Similarity**: Does not detect semantically similar but structurally different code
2. **Heavy Refactoring**: May miss heavily refactored code
3. **Short Code**: Less accurate for very short submissions (<10 lines)
4. **Cross-Language**: Limited cross-language similarity detection
5. **Evidence**: Basic evidence generation (can be enhanced)

---

## Dependencies

### Python Packages
- `tree-sitter==0.20.4` - AST parsing
- `scikit-learn==1.3.2` - TF-IDF and similarity
- `numpy==1.24.3` - Numerical operations
- `pytest==7.4.3` - Testing

### External Resources
- Tree-sitter language grammars (downloaded during setup)
- Git (for cloning language repos)

---

## File Structure

```
CloudProject/
├── plagiarism_engine/          # Core engine (COMPLETE)
│   ├── __init__.py
│   ├── engine.py
│   ├── parser.py
│   ├── normalizer.py
│   ├── similarity.py
│   ├── setup_languages.py
│   ├── requirements.txt
│   ├── README.md
│   └── build/                  # Generated during setup
├── examples/
│   └── basic_usage.py          # Usage examples (COMPLETE)
├── tests/
│   └── test_engine.py          # Unit tests (COMPLETE)
├── test_data/
│   └── sample_submissions/     # Test files (COMPLETE)
├── SETUP_GUIDE.md              # Setup instructions (COMPLETE)
├── API_REFERENCE.md            # API documentation (COMPLETE)
├── PLAGIARISM_ENGINE_DESIGN.md # Architecture (COMPLETE)
├── ROADMAP_build_from_scratch.md # Project roadmap
├── TEAM_DISTRIBUTION_PLAN.md   # Task distribution
├── PROJECT_STATUS.md           # This file
├── quick_test.py               # Quick verification (COMPLETE)
├── README.md                   # Project overview (COMPLETE)
└── .gitignore                  # Git ignore rules
```

---

## How to Use This Component

### For Backend Developer (Person 1)

1. **Import the engine**:
   ```python
   from plagiarism_engine import PlagiarismEngine
   ```

2. **Initialize once** (at app startup):
   ```python
   engine = PlagiarismEngine(threshold=0.80)
   ```

3. **Use in endpoints**:
   ```python
   results = engine.analyze_submissions(submissions, assignment_id)
   ```

4. **Store results** in BigQuery (coordinate with Person 4)

5. **See**: `API_REFERENCE.md` for complete API

### For Frontend Developer (Person 2)

1. **Call backend endpoint**: `POST /v1/analysis/run`
2. **Fetch results**: `GET /v1/plagiarism/pairs?assignment_id=...`
3. **Display**:
   - Similarity matrix (heatmap)
   - Flagged pairs (table)
   - Side-by-side comparison

4. **See**: `PLAGIARISM_ENGINE_DESIGN.md` for expected response formats

### For Data Engineer (Person 4)

1. **BigQuery schema** for `similarity_pairs`:
   ```sql
   CREATE TABLE similarity_pairs (
     assignment_id STRING,
     submission_a STRING,
     submission_b STRING,
     student_a STRING,
     student_b STRING,
     similarity_score FLOAT64,
     flagged BOOLEAN,
     created_at TIMESTAMP
   )
   ```

2. **Store results** from engine output

3. **See**: `API_REFERENCE.md` Example 3 for storage code

---

## Questions & Support

### Common Questions

**Q: How do I install the engine?**  
A: See `SETUP_GUIDE.md` - run `pip install -r requirements.txt` and `python setup_languages.py`

**Q: How do I integrate with FastAPI?**  
A: See `API_REFERENCE.md` Example 1 for FastAPI integration

**Q: What's the expected output format?**  
A: See `API_REFERENCE.md` Data Structures section

**Q: How do I adjust the threshold?**  
A: `PlagiarismEngine(threshold=0.85)` - higher = stricter

**Q: Can I add more languages?**  
A: Yes, see `SETUP_GUIDE.md` "Adding New Languages" section

### Contact

- **Component Owner**: Person 3 (Plagiarism Engine Lead)
- **Documentation**: See `README.md`, `SETUP_GUIDE.md`, `API_REFERENCE.md`
- **Issues**: Check `quick_test.py` output for diagnostics

---

## Success Metrics

### ✅ Achieved

- [x] Core engine functional
- [x] Multi-language support (6 languages)
- [x] Test suite passing
- [x] Documentation complete
- [x] Examples working
- [x] Ready for integration

### ⏳ Pending (Integration Phase)

- [ ] Backend API integration
- [ ] GCS file fetching
- [ ] BigQuery storage
- [ ] Frontend visualization
- [ ] End-to-end testing
- [ ] Production deployment

---

## Conclusion

The **plagiarism detection engine is complete and ready for integration**. All core functionality has been implemented, tested, and documented. The engine provides a clean API that can be easily integrated into the FastAPI backend.

**Next step**: Backend team (Person 1) should create the FastAPI endpoints and integrate the engine.

---

**Status**: ✅ **READY FOR INTEGRATION**  
**Confidence**: **HIGH** - All tests passing, documentation complete  
**Blockers**: **NONE** - Ready to proceed with backend integration
