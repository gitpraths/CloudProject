# Code Review & Plagiarism Detection System

A cloud-based system for detecting code plagiarism and providing AI-powered code reviews for educational assignments.

## Project Overview

This system provides:
- **Plagiarism Detection**: AST-based code similarity analysis using tree-sitter and TF-IDF
- **AI Code Review**: Structured code feedback using Vertex AI (Gemini Pro)
- **Web Dashboard**: Upload submissions, view similarity matrices, and review results
- **Cloud Deployment**: Containerized FastAPI backend on Google Cloud Run

## Project Structure

```
CloudProject/
├── plagiarism_engine/          # Core plagiarism detection engine
│   ├── engine.py               # Main orchestrator
│   ├── parser.py               # AST parsing (tree-sitter)
│   ├── normalizer.py           # AST normalization
│   ├── similarity.py           # TF-IDF + cosine similarity
│   ├── setup_languages.py      # Language setup script
│   └── README.md               # Engine documentation
├── examples/
│   └── basic_usage.py          # Usage examples
├── tests/
│   └── test_engine.py          # Unit tests
├── test_data/
│   └── sample_submissions/     # Sample code files for testing
├── ROADMAP_build_from_scratch.md      # Complete project roadmap
├── PLAGIARISM_ENGINE_DESIGN.md        # Engine architecture & design
├── TEAM_DISTRIBUTION_PLAN.md          # Team task distribution
├── SETUP_GUIDE.md                     # Detailed setup instructions
└── quick_test.py                      # Quick verification script
```

## Quick Start

### 1. Install Dependencies

```bash
cd plagiarism_engine
pip install -r requirements.txt
```

### 2. Setup Language Parsers

```bash
python setup_languages.py
```

This downloads and compiles tree-sitter language grammars for Python, JavaScript, TypeScript, Java, C, and C++.

### 3. Run Quick Test

```bash
cd ..
python quick_test.py
```

This verifies the installation and runs basic tests.

### 4. Try Examples

```bash
python examples/basic_usage.py
```

## Plagiarism Engine Features

### Supported Languages
- Python (`.py`)
- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)
- Java (`.java`)
- C (`.c`, `.h`)
- C++ (`.cpp`, `.cc`, `.cxx`)

### How It Works

1. **AST Parsing**: Converts code to Abstract Syntax Trees using tree-sitter
2. **Normalization**: Removes superficial differences (variable names, formatting)
3. **TF-IDF Vectorization**: Converts normalized code to numerical vectors
4. **Cosine Similarity**: Computes pairwise similarity scores
5. **Threshold Flagging**: Flags pairs above similarity threshold (default: 80%)

### Basic Usage

```python
from plagiarism_engine import PlagiarismEngine

# Initialize engine
engine = PlagiarismEngine(threshold=0.80)

# Analyze submissions
submissions = [
    {
        'id': 'sub_001',
        'student_id': 'alice',
        'code': 'def factorial(n): ...',
        'filename': 'solution.py'
    },
    {
        'id': 'sub_002',
        'student_id': 'bob',
        'code': 'def fact(num): ...',
        'filename': 'solution.py'
    }
]

results = engine.analyze_submissions(submissions, assignment_id='hw1')

# Check flagged pairs
for pair in results['flagged_pairs']:
    print(f"{pair['student_a']} vs {pair['student_b']}: {pair['similarity_score']:.2%}")
```

## Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)**: Complete setup and installation guide
- **[PLAGIARISM_ENGINE_DESIGN.md](PLAGIARISM_ENGINE_DESIGN.md)**: Architecture and technical design
- **[ROADMAP_build_from_scratch.md](ROADMAP_build_from_scratch.md)**: Full project roadmap
- **[plagiarism_engine/README.md](plagiarism_engine/README.md)**: Engine API documentation

## Testing

Run the test suite:

```bash
cd tests
pytest test_engine.py -v
```

## Performance

| Submissions | Comparisons | Processing Time |
|-------------|-------------|-----------------|
| 10          | 45          | ~5 seconds      |
| 50          | 1,225       | ~30 seconds     |
| 100         | 4,950       | ~2-5 minutes    |

## Configuration

### Adjust Threshold

```python
# Strict (fewer false positives)
engine = PlagiarismEngine(threshold=0.85)

# Moderate (default)
engine = PlagiarismEngine(threshold=0.80)

# Lenient (more sensitive)
engine = PlagiarismEngine(threshold=0.70)
```

### Normalization Options

```python
engine = PlagiarismEngine(
    threshold=0.80,
    normalize_identifiers=True,   # Replace variable/function names
    normalize_literals=True        # Replace literal values
)
```

## Integration with Backend

The plagiarism engine is designed to integrate with a FastAPI backend:

```python
from fastapi import FastAPI
from plagiarism_engine import PlagiarismEngine

app = FastAPI()
engine = PlagiarismEngine(threshold=0.80)

@app.post("/v1/analysis/run")
async def analyze_assignment(assignment_id: str):
    # Fetch submissions from database/GCS
    submissions = fetch_submissions(assignment_id)
    
    # Run analysis
    results = engine.analyze_submissions(submissions, assignment_id)
    
    # Store results in BigQuery
    store_results(results)
    
    return {"status": "completed", "flagged_pairs": len(results['flagged_pairs'])}
```

See [PLAGIARISM_ENGINE_DESIGN.md](PLAGIARISM_ENGINE_DESIGN.md) for complete integration details.

## GCP Services (Planned)

- **Cloud Storage**: Store uploaded code files
- **BigQuery**: Store submission metadata and analysis results
- **Vertex AI**: AI-powered code reviews
- **Cloud Run**: Deploy FastAPI backend
- **Cloud Build**: CI/CD pipeline
- **Pub/Sub**: Async analysis orchestration

## Team Roles

- **Person 1**: Backend Infrastructure & Orchestration
- **Person 2**: Frontend & Dashboard
- **Person 3**: Plagiarism Engine & ML (this component)
- **Person 4**: AI Integration & Data Pipeline

See [TEAM_DISTRIBUTION_PLAN.md](TEAM_DISTRIBUTION_PLAN.md) for detailed task breakdown.

## Current Status

✅ Plagiarism engine core implementation complete  
✅ Multi-language AST parsing (tree-sitter)  
✅ Normalization and similarity analysis  
✅ Test suite and examples  
✅ Documentation  
⏳ Backend API integration (next step)  
⏳ Frontend dashboard (teammate)  
⏳ GCP deployment  

## Next Steps

1. **Backend Integration**: Create FastAPI endpoints for the engine
2. **GCS Integration**: Fetch code files from Cloud Storage
3. **BigQuery Integration**: Store analysis results
4. **Pub/Sub Worker**: Async analysis processing
5. **Frontend Integration**: Connect to dashboard

## Troubleshooting

### "Tree-sitter languages library not found"
```bash
cd plagiarism_engine
python setup_languages.py
```

### "ModuleNotFoundError"
```bash
pip install -r plagiarism_engine/requirements.txt
```

### Low similarity for similar code
- Lower threshold: `PlagiarismEngine(threshold=0.70)`
- Check if code is too short (need 5-10+ lines)

### High false positive rate
- Raise threshold: `PlagiarismEngine(threshold=0.85)`
- Disable literal normalization: `normalize_literals=False`

## License

MIT License

## Contributors

- Person 3: Plagiarism Engine Lead