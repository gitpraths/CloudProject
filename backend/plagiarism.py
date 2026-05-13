from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def detect_plagiarism(file1_content: str, file2_content: str) -> dict:
    vectorizer = TfidfVectorizer()
    tfidf = vectorizer.fit_transform([file1_content, file2_content])
    score = float(cosine_similarity(tfidf[0], tfidf[1])[0][0])

    return {
        "similarity_score": round(score, 4),
        "is_plagiarised": score > 0.7,
        "highlighted_lines": [],
        "method": "TF-IDF cosine similarity",
    }