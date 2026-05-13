import json
import re


class Bug:
    def __init__(self, line, description):
        self.line = line
        self.description = description
    
    def dict(self):
        return {"line": self.line, "description": self.description}


class ReviewResponse:
    def __init__(self, bugs, code_smells, suggestions, complexity_rating, overall_score):
        self.bugs = bugs
        self.code_smells = code_smells
        self.suggestions = suggestions
        self.complexity_rating = complexity_rating
        self.overall_score = overall_score
    
    def dict(self):
        return {
            "bugs": [b.dict() for b in self.bugs],
            "code_smells": self.code_smells,
            "suggestions": self.suggestions,
            "complexity_rating": self.complexity_rating,
            "overall_score": self.overall_score
        }


def clean_json_string(raw: str) -> str:
    """
    Strip any markdown code fences or extra whitespace that Gemini may add.
    Handles cases like:
        ```json\n{...}\n```
        ```\n{...}\n```
        or just raw {...}
    """
    raw = raw.strip()

    # Remove ```json ... ``` or ``` ... ``` wrappers
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    return raw.strip()


def parse_review_response(raw_text: str) -> ReviewResponse:
    """
    Parse Gemini's raw text output into a validated ReviewResponse object.
    Falls back to a safe default if parsing fails.
    """
    try:
        cleaned = clean_json_string(raw_text)
        data = json.loads(cleaned)

        # Normalise bugs — Gemini sometimes returns strings instead of dicts
        raw_bugs = data.get("bugs", [])
        bugs = []
        for b in raw_bugs:
            if isinstance(b, dict):
                bugs.append(Bug(
                    line=b.get("line"),
                    description=b.get("description", str(b))
                ))
            elif isinstance(b, str):
                bugs.append(Bug(line=None, description=b))

        return ReviewResponse(
            bugs=bugs,
            code_smells=_ensure_str_list(data.get("code_smells", [])),
            suggestions=_ensure_str_list(data.get("suggestions", [])),
            complexity_rating=int(data.get("complexity_rating", 5)),
            overall_score=int(data.get("overall_score", 50)),
        )

    except (json.JSONDecodeError, KeyError, ValueError, TypeError) as e:
        # Return a safe fallback so the API never crashes
        return ReviewResponse(
            bugs=[],
            code_smells=["Could not fully parse AI response."],
            suggestions=["Please try again or check the code manually."],
            complexity_rating=5,
            overall_score=50,
        )


def _ensure_str_list(value) -> list:
    """Ensure we always return a list of strings."""
    if not isinstance(value, list):
        return []
    return [str(item) for item in value]
