# Plagiarism Engine Setup Guide

Complete guide to set up and test the plagiarism detection engine.

## Prerequisites

- Python 3.8 or higher
- Git
- pip (Python package manager)

## Step-by-Step Setup

### 1. Navigate to Project Directory

```bash
cd CloudProject
```

### 2. Install Python Dependencies

```bash
cd plagiarism_engine
pip install -r requirements.txt
```

This installs:
- `tree-sitter` - AST parser
- `scikit-learn` - TF-IDF and similarity computation
- `numpy` - Numerical operations
- `pytest` - Testing framework

### 3. Setup Language Parsers

```bash
python setup_languages.py
```

This will:
1. Clone tree-sitter language grammars from GitHub
2. Compile them into a single library file
3. Create `build/languages.so`

**Expected output:**
```
Setting up tree-sitter language parsers...

1. Cloning language repositories...
  Cloning python...
  ✓ python cloned successfully
  Cloning javascript...
  ✓ javascript cloned successfully
  ...

2. Building language library...
  ✓ Language library built successfully
  Location: build/languages.so

✓ Setup complete! You can now use the plagiarism engine.
```

### 4. Verify Installation

```bash
python -c "from plagiarism_engine import PlagiarismEngine; print('✓ Installation successful!')"
```

## Quick Test

### Test with Sample Data

```bash
cd ..
python examples/basic_usage.py
```

This will run 4 examples demonstrating:
1. Basic analysis of multiple submissions
2. Comparing two code snippets
3. Testing different threshold values
4. Multi-language support

**Expected output:**
```
============================================================
Example 1: Basic Analysis
============================================================
Parsing and normalizing 3 submissions...
Computing similarity matrix...
Analysis complete: 1 flagged pairs found

Total submissions: 3
Flagged pairs: 1

Statistics:
  total_submissions: 3
  total_pairs: 3
  flagged_pairs: 1
  mean_similarity: 0.6234
  ...

Flagged pairs:
  alice vs bob: 95%

All pairs:
  🚩 alice vs bob: 95%
  ✓ alice vs charlie: 42%
  ✓ bob vs charlie: 40%
```

### Test with Real Files

```bash
cd plagiarism_engine
python
```

```python
from plagiarism_engine import PlagiarismEngine

# Initialize engine
engine = PlagiarismEngine(threshold=0.80)

# Analyze sample submissions
file_paths = [
    '../test_data/sample_submissions/alice_factorial.py',
    '../test_data/sample_submissions/bob_factorial.py',
    '../test_data/sample_submissions/charlie_factorial.py',
    '../test_data/sample_submissions/diana_factorial.py'
]

student_ids = ['alice', 'bob', 'charlie', 'diana']

results = engine.analyze_files(file_paths, student_ids, assignment_id='hw1')

# Print results
print(f"Flagged pairs: {len(results['flagged_pairs'])}")
for pair in results['flagged_pairs']:
    print(f"  {pair['student_a']} vs {pair['student_b']}: {pair['similarity_score']:.2%}")
```

**Expected result:**
- Alice vs Bob should be flagged (>80% similar) - same algorithm, renamed variables
- Alice vs Charlie should NOT be flagged (<70%) - different algorithms
- All others should NOT be flagged

## Run Tests

```bash
cd ../tests
pytest test_engine.py -v
```

**Expected output:**
```
test_engine.py::TestPlagiarismEngine::test_identical_code PASSED
test_engine.py::TestPlagiarismEngine::test_renamed_variables PASSED
test_engine.py::TestPlagiarismEngine::test_different_algorithms PASSED
test_engine.py::TestPlagiarismEngine::test_multiple_submissions PASSED
...

============ 8 passed in 2.34s ============
```

## Project Structure

```
CloudProject/
├── plagiarism_engine/          # Main engine code
│   ├── __init__.py
│   ├── engine.py               # Main orchestrator
│   ├── parser.py               # AST parsing
│   ├── normalizer.py           # AST normalization
│   ├── similarity.py           # TF-IDF + cosine similarity
│   ├── setup_languages.py      # Language setup script
│   ├── requirements.txt        # Dependencies
│   ├── README.md               # Documentation
│   └── build/                  # Generated files
│       ├── languages.so        # Compiled language parsers
│       └── tree-sitter-*/      # Language grammar repos
├── examples/
│   └── basic_usage.py          # Usage examples
├── tests/
│   └── test_engine.py          # Unit tests
└── test_data/
    └── sample_submissions/     # Sample code files
        ├── alice_factorial.py
        ├── bob_factorial.py
        ├── charlie_factorial.py
        └── diana_factorial.py
```

## Usage Patterns

### Pattern 1: Analyze Code Strings

```python
from plagiarism_engine import PlagiarismEngine

engine = PlagiarismEngine(threshold=0.80)

submissions = [
    {
        'id': 'sub_001',
        'student_id': 'alice',
        'code': 'def factorial(n): ...',
        'filename': 'solution.py'
    },
    # ... more submissions
]

results = engine.analyze_submissions(submissions, assignment_id='hw1')
```

### Pattern 2: Analyze Files

```python
file_paths = ['student1.py', 'student2.py', 'student3.py']
student_ids = ['alice', 'bob', 'charlie']

results = engine.analyze_files(file_paths, student_ids, assignment_id='hw1')
```

### Pattern 3: Quick Comparison

```python
result = engine.compare_two_submissions(
    code_a="def add(a, b): return a + b",
    code_b="def sum(x, y): return x + y",
    filename_a="solution.py",
    filename_b="solution.py"
)

print(f"Similarity: {result['similarity_score']:.2%}")
```

### Pattern 4: Export Results

```python
results = engine.analyze_submissions(submissions)
engine.export_results(results, 'results.json')
```

## Configuration Options

### Threshold

```python
# Strict (fewer false positives, may miss some plagiarism)
engine = PlagiarismEngine(threshold=0.85)

# Moderate (default, balanced)
engine = PlagiarismEngine(threshold=0.80)

# Lenient (more sensitive, may have false positives)
engine = PlagiarismEngine(threshold=0.70)
```

### Normalization

```python
engine = PlagiarismEngine(
    threshold=0.80,
    normalize_identifiers=True,   # Replace variable/function names
    normalize_literals=True        # Replace literal values (numbers, strings)
)
```

### TF-IDF Parameters

```python
from plagiarism_engine.similarity import SimilarityAnalyzer

analyzer = SimilarityAnalyzer(
    threshold=0.80,
    ngram_range=(1, 3),    # Use 1-grams, 2-grams, 3-grams
    min_df=1,              # Minimum document frequency
    max_df=0.9             # Ignore tokens in >90% of documents
)
```

## Troubleshooting

### Issue: "Tree-sitter languages library not found"

**Solution:**
```bash
cd plagiarism_engine
python setup_languages.py
```

### Issue: "ModuleNotFoundError: No module named 'tree_sitter'"

**Solution:**
```bash
pip install -r requirements.txt
```

### Issue: Git clone fails during setup

**Solution:**
- Check internet connection
- Ensure git is installed: `git --version`
- Try cloning manually:
  ```bash
  cd plagiarism_engine/build
  git clone https://github.com/tree-sitter/tree-sitter-python
  ```

### Issue: Low similarity for obviously similar code

**Solution:**
- Lower the threshold: `PlagiarismEngine(threshold=0.70)`
- Check if code is too short (need at least 5-10 lines)
- Verify language is supported

### Issue: High false positive rate

**Solution:**
- Raise the threshold: `PlagiarismEngine(threshold=0.85)`
- Disable literal normalization: `normalize_literals=False`
- Check if submissions are too similar by design (e.g., following strict template)

## Next Steps

### Integration with Backend

See `PLAGIARISM_ENGINE_DESIGN.md` for:
- FastAPI integration
- GCS file fetching
- BigQuery result storage
- Pub/Sub async processing

### Adding New Languages

1. Find tree-sitter grammar: https://github.com/tree-sitter
2. Add to `setup_languages.py`:
   ```python
   languages = {
       ...
       'rust': 'https://github.com/tree-sitter/tree-sitter-rust'
   }
   ```
3. Add to `parser.py`:
   ```python
   SUPPORTED_LANGUAGES = {
       ...
       'rust': ['.rs']
   }
   ```
4. Rebuild: `python setup_languages.py`

### Performance Optimization

For large assignments (100+ submissions):
- Use batch processing
- Cache normalized ASTs
- Implement parallel processing
- Add file size limits

## Support

For issues or questions:
1. Check `plagiarism_engine/README.md`
2. Review `PLAGIARISM_ENGINE_DESIGN.md`
3. Run tests: `pytest tests/ -v`
4. Check examples: `python examples/basic_usage.py`

## Success Criteria

✓ `python setup_languages.py` completes without errors  
✓ `build/languages.so` file exists  
✓ `python examples/basic_usage.py` runs successfully  
✓ `pytest tests/test_engine.py` all tests pass  
✓ Can analyze sample submissions and get expected results  

---

**You're ready to integrate the plagiarism engine into your backend!** 🚀
