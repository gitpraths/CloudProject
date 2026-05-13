# Plagiarism Engine Architecture

Visual guide to understanding how the plagiarism detection engine works.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PLAGIARISM ENGINE                            │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │  CodeParser    │  │ ASTNormalizer  │  │ Similarity     │       │
│  │  (parser.py)   │→ │ (normalizer.py)│→ │ Analyzer       │       │
│  │                │  │                │  │ (similarity.py)│       │
│  │ • Tree-sitter  │  │ • Remove IDs   │  │ • TF-IDF       │       │
│  │ • Multi-lang   │  │ • Normalize    │  │ • Cosine sim   │       │
│  │ • AST parsing  │  │ • Tokenize     │  │ • Flagging     │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              PlagiarismEngine (engine.py)                     │  │
│  │              Main Orchestrator                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Step-by-Step Processing

```
INPUT: Code Submissions
         │
         ▼
┌─────────────────────────────────────────┐
│ 1. PARSE CODE TO AST                    │
│    (CodeParser)                         │
│                                         │
│    Code String → Tree-sitter → AST     │
│                                         │
│    Example:                             │
│    "def factorial(n): ..."              │
│         ↓                               │
│    function_definition                  │
│      ├─ name: "factorial"               │
│      ├─ parameters: ["n"]               │
│      └─ body: [...]                     │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 2. NORMALIZE AST                        │
│    (ASTNormalizer)                      │
│                                         │
│    AST → Normalized Tokens              │
│                                         │
│    Transformations:                     │
│    • "factorial" → "FUNC_0"             │
│    • "n" → "VAR_0"                      │
│    • 0 → "NUM"                          │
│    • Remove comments                    │
│                                         │
│    Result:                              │
│    ["function_definition", "FUNC_0",    │
│     "VAR_0", "if_statement", ...]       │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 3. CONVERT TO TOKEN STRING              │
│    (ASTNormalizer)                      │
│                                         │
│    Token List → Space-separated String  │
│                                         │
│    ["function_definition", "FUNC_0", ...]│
│         ↓                               │
│    "function_definition FUNC_0 VAR_0 ..." │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 4. COMPUTE TF-IDF VECTORS               │
│    (SimilarityAnalyzer)                 │
│                                         │
│    Token Strings → TF-IDF Matrix        │
│                                         │
│    Corpus: All submissions              │
│    ["sub1 tokens", "sub2 tokens", ...]  │
│         ↓                               │
│    [[0.23, 0.45, 0.67, ...],  # Sub 1   │
│     [0.22, 0.44, 0.68, ...],  # Sub 2   │
│     [0.15, 0.30, 0.50, ...]]  # Sub 3   │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 5. COMPUTE COSINE SIMILARITY            │
│    (SimilarityAnalyzer)                 │
│                                         │
│    TF-IDF Matrix → Similarity Matrix    │
│                                         │
│    Pairwise cosine similarity:          │
│    [[1.0,  0.95, 0.35],  # Sub 1 vs all │
│     [0.95, 1.0,  0.33],  # Sub 2 vs all │
│     [0.35, 0.33, 1.0]]   # Sub 3 vs all │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 6. FLAG HIGH-SIMILARITY PAIRS           │
│    (SimilarityAnalyzer)                 │
│                                         │
│    Similarity Matrix → Flagged Pairs    │
│                                         │
│    Threshold: 0.80                      │
│    If score ≥ 0.80 → FLAGGED            │
│                                         │
│    Result:                              │
│    [{                                   │
│      "student_a": "alice",              │
│      "student_b": "bob",                │
│      "similarity_score": 0.95,          │
│      "flagged": true                    │
│    }]                                   │
└─────────────────────────────────────────┘
         │
         ▼
OUTPUT: Analysis Results
```

---

## Component Architecture

### 1. CodeParser

```
┌─────────────────────────────────────────────────────────┐
│                      CodeParser                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Responsibilities:                                      │
│  • Load tree-sitter language parsers                    │
│  • Detect language from file extension                  │
│  • Parse code into AST                                  │
│                                                         │
│  Supported Languages:                                   │
│  ┌──────────┬─────────────────────────────┐            │
│  │ Python   │ .py                         │            │
│  │ JavaScript│ .js, .jsx                  │            │
│  │ TypeScript│ .ts, .tsx                  │            │
│  │ Java     │ .java                       │            │
│  │ C        │ .c, .h                      │            │
│  │ C++      │ .cpp, .cc, .cxx             │            │
│  └──────────┴─────────────────────────────┘            │
│                                                         │
│  Key Methods:                                           │
│  • parse(code, language) → Tree                         │
│  • detect_language(filename) → str                      │
│  • is_supported(filename) → bool                        │
└─────────────────────────────────────────────────────────┘
```

### 2. ASTNormalizer

```
┌─────────────────────────────────────────────────────────┐
│                    ASTNormalizer                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Responsibilities:                                      │
│  • Traverse AST recursively                             │
│  • Normalize identifiers (variables, functions)         │
│  • Normalize literals (numbers, strings)                │
│  • Remove comments and whitespace                       │
│  • Preserve structural elements                         │
│                                                         │
│  Normalization Rules:                                   │
│  ┌─────────────────┬──────────────────────┐            │
│  │ Original        │ Normalized           │            │
│  ├─────────────────┼──────────────────────┤            │
│  │ factorial       │ VAR_0                │            │
│  │ n               │ VAR_1                │            │
│  │ 42              │ NUM                  │            │
│  │ "hello"         │ STR                  │            │
│  │ true            │ BOOL                 │            │
│  │ // comment      │ (removed)            │            │
│  │ if, for, while  │ (preserved)          │            │
│  └─────────────────┴──────────────────────┘            │
│                                                         │
│  Key Methods:                                           │
│  • normalize(tree) → List[str]                          │
│  • get_token_string(tokens) → str                       │
└─────────────────────────────────────────────────────────┘
```

### 3. SimilarityAnalyzer

```
┌─────────────────────────────────────────────────────────┐
│                  SimilarityAnalyzer                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Responsibilities:                                      │
│  • Compute TF-IDF vectors                               │
│  • Calculate cosine similarity                          │
│  • Find similar pairs above threshold                   │
│  • Generate statistics                                  │
│                                                         │
│  TF-IDF Configuration:                                  │
│  • N-gram range: (1, 3)                                 │
│  • Min document frequency: 1                            │
│  • Max document frequency: 0.9                          │
│  • Sublinear TF: True (log scaling)                     │
│                                                         │
│  Similarity Formula:                                    │
│  ┌─────────────────────────────────────────┐           │
│  │ similarity(A, B) = (A · B)              │           │
│  │                    ─────────            │           │
│  │                    ||A|| × ||B||        │           │
│  │                                         │           │
│  │ Result: 0.0 (different) to 1.0 (same)  │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
│  Key Methods:                                           │
│  • compute_similarity_matrix(tokens) → ndarray          │
│  • find_similar_pairs(matrix, ids) → List[Dict]         │
│  • get_similarity_statistics(matrix) → Dict             │
└─────────────────────────────────────────────────────────┘
```

### 4. PlagiarismEngine

```
┌─────────────────────────────────────────────────────────┐
│                   PlagiarismEngine                      │
│                   (Main Orchestrator)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Responsibilities:                                      │
│  • Coordinate all components                            │
│  • Handle multiple submissions                          │
│  • Format results for output                            │
│  • Provide high-level API                               │
│                                                         │
│  Workflow:                                              │
│  1. Initialize components (parser, normalizer, analyzer)│
│  2. For each submission:                                │
│     a. Parse code to AST                                │
│     b. Normalize AST to tokens                          │
│     c. Convert to token string                          │
│  3. Compute similarity matrix for all submissions       │
│  4. Find pairs above threshold                          │
│  5. Generate statistics                                 │
│  6. Format and return results                           │
│                                                         │
│  Key Methods:                                           │
│  • analyze_submissions(subs, id) → Dict                 │
│  • analyze_files(paths, ids, id) → Dict                 │
│  • compare_two_submissions(a, b, ...) → Dict            │
│  • export_results(results, path) → None                 │
└─────────────────────────────────────────────────────────┘
```

---

## Example: Detecting Plagiarism

### Scenario: Two Similar Submissions

**Alice's Code:**
```python
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)
```

**Bob's Code (renamed variables):**
```python
def fact(num):
    if num == 0:
        return 1
    return num * fact(num - 1)
```

### Processing Steps

#### Step 1: Parse to AST

**Alice's AST:**
```
function_definition
  ├─ name: "factorial"
  ├─ parameters: ["n"]
  └─ body:
      ├─ if_statement
      │   ├─ condition: (n == 0)
      │   └─ return: 1
      └─ return: (n * factorial(n-1))
```

**Bob's AST:**
```
function_definition
  ├─ name: "fact"
  ├─ parameters: ["num"]
  └─ body:
      ├─ if_statement
      │   ├─ condition: (num == 0)
      │   └─ return: 1
      └─ return: (num * fact(num-1))
```

#### Step 2: Normalize

**Alice's Normalized:**
```
function_definition FUNC_0 VAR_0 if_statement VAR_0 == NUM return NUM return VAR_0 * FUNC_0 VAR_0 - NUM
```

**Bob's Normalized:**
```
function_definition FUNC_0 VAR_0 if_statement VAR_0 == NUM return NUM return VAR_0 * FUNC_0 VAR_0 - NUM
```

**Result**: Identical after normalization! ✅

#### Step 3: TF-IDF

Both submissions have identical token sequences, so their TF-IDF vectors are identical:
```
Alice: [0.23, 0.45, 0.67, 0.12, ...]
Bob:   [0.23, 0.45, 0.67, 0.12, ...]
```

#### Step 4: Cosine Similarity

```
similarity(Alice, Bob) = 1.0 (100% similar)
```

#### Step 5: Flag

```
Threshold: 0.80
Score: 1.0
Result: FLAGGED 🚩
```

---

## Integration Architecture

### Full System Context

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Upload UI    │  │ Matrix View  │  │ Comparison   │          │
│  └──────┬───────┘  └──────▲───────┘  └──────▲───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │ POST /upload     │ GET /pairs       │ GET /compare
          │                  │                  │
┌─────────▼──────────────────┴──────────────────┴─────────────────┐
│                      BACKEND (FastAPI)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Upload Handler│  │Analysis API  │  │Results API   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────▲───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  │
┌─────────────────┐  ┌─────────────────────────┴─────────────────┐
│   GCS Storage   │  │      PLAGIARISM ENGINE                     │
│  (Code Files)   │  │  ┌────────────────────────────────────┐   │
└─────────────────┘  │  │ • Parse AST                        │   │
          │          │  │ • Normalize                        │   │
          │          │  │ • Compute Similarity               │   │
          │          │  │ • Flag Pairs                       │   │
          │          │  └────────────────────────────────────┘   │
          │          └─────────────────────────────────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BigQuery                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ submissions  │  │similarity_   │  │ ai_reviews   │          │
│  │              │  │pairs         │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Performance Characteristics

### Time Complexity

```
┌─────────────────────────────────────────────────────────┐
│ Operation              │ Complexity  │ Notes            │
├────────────────────────┼─────────────┼──────────────────┤
│ Parse single file      │ O(n)        │ n = file size    │
│ Normalize AST          │ O(m)        │ m = AST nodes    │
│ TF-IDF vectorization   │ O(N × T)    │ N = submissions  │
│                        │             │ T = unique tokens│
│ Cosine similarity      │ O(N²)       │ Pairwise compare │
│ Total                  │ O(N²)       │ Dominated by     │
│                        │             │ similarity calc  │
└────────────────────────┴─────────────┴──────────────────┘
```

### Space Complexity

```
┌─────────────────────────────────────────────────────────┐
│ Component              │ Space       │ Notes            │
├────────────────────────┼─────────────┼──────────────────┤
│ AST storage            │ O(N × m)    │ N submissions    │
│ Token strings          │ O(N × k)    │ k = avg tokens   │
│ TF-IDF matrix          │ O(N × T)    │ Sparse matrix    │
│ Similarity matrix      │ O(N²)       │ Dense matrix     │
│ Total                  │ O(N²)       │ For large N      │
└────────────────────────┴─────────────┴──────────────────┘
```

### Optimization Strategies

1. **Sparse Matrix Storage**: TF-IDF uses sparse matrices
2. **Batch Processing**: Process assignments in chunks
3. **Caching**: Cache normalized ASTs
4. **Parallel Processing**: Use multiprocessing for large N
5. **Early Termination**: Skip pairs with low token overlap

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Input Validation                     │
│                                                         │
│  • Check submission format                              │
│  • Validate file extensions                             │
│  • Check code is not empty                              │
│                                                         │
│  ✓ Valid → Continue                                     │
│  ✗ Invalid → Return error                               │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Parse Attempt                        │
│                                                         │
│  Try: Parse code to AST                                 │
│                                                         │
│  ✓ Success → Continue                                   │
│  ✗ Parse Error → Log, skip file, continue with others  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Normalization                          │
│                                                         │
│  Try: Normalize AST                                     │
│                                                         │
│  ✓ Success → Continue                                   │
│  ✗ Error → Log, skip file, continue with others        │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                Similarity Computation                   │
│                                                         │
│  Check: At least 2 valid submissions?                   │
│                                                         │
│  ✓ Yes → Compute similarity                             │
│  ✗ No → Return error with message                       │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Return Results                       │
│                                                         │
│  • Flagged pairs                                        │
│  • All pairs                                            │
│  • Statistics                                           │
│  • Error messages (if any)                              │
└─────────────────────────────────────────────────────────┘
```

---

## Configuration Options

### Threshold Tuning

```
┌─────────────────────────────────────────────────────────┐
│ Threshold │ Behavior                                    │
├───────────┼─────────────────────────────────────────────┤
│ 0.95      │ Very strict - only near-identical code      │
│ 0.85      │ Strict - minor changes allowed              │
│ 0.80      │ Moderate (default) - balanced               │
│ 0.70      │ Lenient - more sensitive                    │
│ 0.60      │ Very lenient - may have false positives     │
└───────────┴─────────────────────────────────────────────┘
```

### Normalization Impact

```
┌─────────────────────────────────────────────────────────┐
│ Setting              │ Effect                           │
├──────────────────────┼──────────────────────────────────┤
│ normalize_identifiers│ Catches renamed variables        │
│ = True (default)     │ Higher similarity scores         │
│                      │                                  │
│ normalize_identifiers│ Stricter matching                │
│ = False              │ Lower similarity scores          │
│                      │                                  │
│ normalize_literals   │ Ignores number/string values     │
│ = True (default)     │ Focuses on structure             │
│                      │                                  │
│ normalize_literals   │ Considers literal values         │
│ = False              │ More precise matching            │
└──────────────────────┴──────────────────────────────────┘
```

---

## Summary

The plagiarism engine uses a **three-stage pipeline**:

1. **Parse**: Convert code to AST using tree-sitter
2. **Normalize**: Remove superficial differences
3. **Analyze**: Compute similarity using TF-IDF + cosine similarity

This approach is:
- ✅ **Fast**: No training required, classical ML
- ✅ **Accurate**: Detects structural similarity
- ✅ **Robust**: Handles renamed variables, reformatting
- ✅ **Multi-language**: Supports 6 languages
- ✅ **Configurable**: Adjustable threshold and normalization

**Ready for integration** with FastAPI backend and GCP services.
