"""
test_local.py

Run this FIRST before integrating with GCS or FastAPI.
Tests that Gemini API is working and returns proper JSON.

Usage:
    python test_local.py

Make sure GOOGLE_APPLICATION_CREDENTIALS is set:
    export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.vertex_service import call_gemini
from app.services.prompt_service import build_review_prompt
from app.services.parser_service import parse_review_response

# ─── Sample code with intentional bugs for testing ───
SAMPLE_CODE = """
def divide(a, b):
    return a / b

def calculate_average(numbers):
    total = 0
    for n in numbers:
        total = total + n
    avg = total / len(numbers)
    return avg

result = divide(10, 0)
print(result)

nums = []
print(calculate_average(nums))
"""

def main():
    print("=" * 50)
    print("AI Code Review — Local Test")
    print("=" * 50)

    print("\n[1] Building prompt...")
    prompt = build_review_prompt(SAMPLE_CODE, "test.py")
    print("Prompt built successfully.")

    print("\n[2] Calling Vertex AI Gemini...")
    try:
        raw = call_gemini(prompt)
        print("Raw Gemini response:")
        print(raw)
    except Exception as e:
        print(f"ERROR calling Gemini: {e}")
        sys.exit(1)

    print("\n[3] Parsing response...")
    review = parse_review_response(raw)

    print("\n[4] Parsed Review Result:")
    print(f"  Overall Score    : {review.overall_score}/100")
    print(f"  Complexity Rating: {review.complexity_rating}/10")
    print(f"  Bugs Found       : {len(review.bugs)}")
    for bug in review.bugs:
        print(f"    - Line {bug.line}: {bug.description}")
    print(f"  Code Smells      : {len(review.code_smells)}")
    for smell in review.code_smells:
        print(f"    - {smell}")
    print(f"  Suggestions      : {len(review.suggestions)}")
    for s in review.suggestions:
        print(f"    - {s}")

    print("\n[OK] Test passed! Gemini integration is working.")

if __name__ == "__main__":
    main()
