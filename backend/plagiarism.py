"""
plagiarism.py
=============
Plagiarism detection module.

YOUR TEAMMATE fills in the real logic here.
The backend calls  detect_plagiarism()  and expects the return shape below.
Do NOT change the function signature or return structure — the backend depends on it.
"""


def detect_plagiarism(file1_content: str, file2_content: str) -> dict:
    """
    Compare two code files and return a similarity report.

    Parameters
    ----------
    file1_content : str   Raw source code of the first file.
    file2_content : str   Raw source code of the second file.

    Returns
    -------
    dict with keys:
        similarity_score  : float  0.0 – 1.0  (1.0 = identical)
        is_plagiarised    : bool   True if score exceeds threshold
        highlighted_lines : list[str]  Suspicious lines / snippets (can be [])
        method            : str   Algorithm used (for display purposes)
    """

    # ── STUB — replace with real AST / TF-IDF logic ───────────────────────────
    return {
        "similarity_score": 0.0,
        "is_plagiarised": False,
        "highlighted_lines": [],
        "method": "stub — not yet implemented",
    }