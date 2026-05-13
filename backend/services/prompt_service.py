def build_review_prompt(code: str, filename: str = "code.py") -> str:
    """
    Build a structured prompt for Gemini to perform a code review.
    The prompt enforces strict JSON output.
    """

    # Guess language from filename extension for better review context
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else "unknown"
    lang_map = {
        "py": "Python", "js": "JavaScript", "ts": "TypeScript",
        "java": "Java", "cpp": "C++", "c": "C", "cs": "C#",
        "go": "Go", "rb": "Ruby", "php": "PHP",
    }
    language = lang_map.get(extension, "code")

    prompt = f"""You are a senior software engineer performing a thorough code review.

Analyze the following {language} code and return ONLY a valid JSON object with no extra text, no markdown, no code fences.

The JSON must follow this exact schema:
{{
  "bugs": [
    {{
      "line": <integer or null>,
      "description": "<string describing the bug>"
    }}
  ],
  "code_smells": [
    "<string describing a code smell or bad practice>"
  ],
  "suggestions": [
    "<string describing an improvement suggestion>"
  ],
  "complexity_rating": <integer from 1 (simple) to 10 (very complex)>,
  "overall_score": <integer from 0 to 100, where 100 is perfect code>
}}

Rules:
- bugs: list actual bugs, errors, or potential runtime failures. Empty list if none.
- code_smells: poor naming, long functions, missing error handling, bad patterns, etc.
- suggestions: concrete improvement ideas.
- complexity_rating: 1 = very simple, 10 = extremely complex.
- overall_score: honest 0-100 quality score.
- Return ONLY the JSON object. Nothing else.

Code to review (filename: {filename}):
```
{code}
```"""

    return prompt
