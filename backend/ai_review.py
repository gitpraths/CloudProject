"""
ai_review.py
============
AI-powered code review module.

YOUR TEAMMATE fills in the real logic here (e.g. Vertex AI / Gemini call).
The backend calls  review_code()  and expects the return shape below.
Do NOT change the function signature or return structure — the backend depends on it.
"""


def review_code(file_content: str, language: str = "unknown") -> dict:
    """
    Analyse a code file and return structured review feedback.

    Parameters
    ----------
    file_content : str   Raw source code to review.
    language     : str   Programming language hint (e.g. 'python', 'java').

    Returns
    -------
    dict with keys:
        quality_score    : int        0 – 100
        bugs             : list[str]  Identified bugs or errors
        code_smells      : list[str]  Bad practices / smells detected
        best_practices   : list[str]  Suggestions to improve the code
        complexity       : str        'low' | 'medium' | 'high'
        summary          : str        One-paragraph overall assessment
    """

    # ── STUB — replace with real LLM call ────────────────────────────────────
    return {
        "quality_score": 0,
        "bugs": [],
        "code_smells": [],
        "best_practices": [],
        "complexity": "unknown",
        "summary": "AI review module not yet implemented.",
    }