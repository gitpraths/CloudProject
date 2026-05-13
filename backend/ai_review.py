import google.generativeai as genai
import os
import json

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "AIzaSyBI16-o4mU0HNyogmc_Oy4xfdv1PlTq45k"))

def review_code(file_content: str, language: str = "unknown") -> dict:
    model = genai.GenerativeModel("gemini-2.0-flash")

    prompt = f"""
    Review this {language} code and respond ONLY with a JSON object, no markdown, no backticks.
    
    The JSON must have exactly these fields:
    {{
        "quality_score": <number 0-100>,
        "bugs": [<list of bug descriptions>],
        "code_smells": [<list of code smell descriptions>],
        "best_practices": [<list of improvement suggestions>],
        "complexity": "<low or medium or high>",
        "summary": "<one paragraph overall assessment>"
    }}
    
    Code to review:
    {file_content}
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Clean up if Gemini adds backticks anyway
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        return {
            "quality_score": 0,
            "bugs": [],
            "code_smells": [],
            "best_practices": [],
            "complexity": "unknown",
            "summary": f"AI review failed: {str(e)}",
        }