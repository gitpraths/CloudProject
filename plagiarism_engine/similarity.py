"""
Similarity Analyzer Module

Computes code similarity using TF-IDF and cosine similarity.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Dict, Tuple, Optional


class SimilarityAnalyzer:
    """Analyze code similarity using TF-IDF and cosine similarity"""
    
    def __init__(self, 
                 threshold: float = 0.80,
                 ngram_range: Tuple[int, int] = (1, 3),
                 min_df: int = 1,
                 max_df: float = 0.9):
        """
        Initialize the similarity analyzer.
        
        Args:
            threshold: Similarity threshold for flagging (0.0 to 1.0)
            ngram_range: Range of n-grams to use (default: 1-3)
            min_df: Minimum document frequency for tokens
            max_df: Maximum document frequency for tokens (ignore common tokens)
        """
        self.threshold = threshold
        self.ngram_range = ngram_range
        self.min_df = min_df
        self.max_df = max_df
        
        self.vectorizer = TfidfVectorizer(
            analyzer='word',
            ngram_range=self.ngram_range,
            min_df=self.min_df,
            max_df=self.max_df,
            sublinear_tf=True,  # Use log scaling for term frequency
            lowercase=False     # Tokens are already normalized
        )
    
    def compute_similarity_matrix(self, token_strings: List[str]) -> np.ndarray:
        """
        Compute pairwise similarity matrix for a list of token strings.
        
        Args:
            token_strings: List of normalized token strings
            
        Returns:
            NxN similarity matrix where N is the number of submissions
        """
        if len(token_strings) < 2:
            raise ValueError("Need at least 2 submissions to compute similarity")
        
        # For very small datasets, adjust parameters
        n_docs = len(token_strings)
        min_df = min(self.min_df, 1)  # Always at least 1
        max_df = self.max_df if n_docs > 2 else 1.0  # Disable max_df for 2 docs
        
        # Create vectorizer with adjusted parameters
        vectorizer = TfidfVectorizer(
            analyzer='word',
            ngram_range=self.ngram_range,
            min_df=min_df,
            max_df=max_df,
            sublinear_tf=True,
            lowercase=False
        )
        
        try:
            # Compute TF-IDF vectors
            tfidf_matrix = vectorizer.fit_transform(token_strings)
        except ValueError as e:
            # If TF-IDF fails (e.g., no terms remain), fall back to simple token matching
            print(f"Warning: TF-IDF failed ({e}), using simple token matching")
            return self._simple_similarity_matrix(token_strings)
        
        # Compute cosine similarity
        similarity_matrix = cosine_similarity(tfidf_matrix)
        
        return similarity_matrix
    
    def _simple_similarity_matrix(self, token_strings: List[str]) -> np.ndarray:
        """
        Fallback: compute similarity using simple token overlap.
        Used when TF-IDF fails (e.g., very short code).
        """
        n = len(token_strings)
        matrix = np.zeros((n, n))
        
        # Convert to token sets
        token_sets = [set(s.split()) for s in token_strings]
        
        for i in range(n):
            for j in range(n):
                if i == j:
                    matrix[i][j] = 1.0
                else:
                    # Jaccard similarity
                    intersection = len(token_sets[i] & token_sets[j])
                    union = len(token_sets[i] | token_sets[j])
                    matrix[i][j] = intersection / union if union > 0 else 0.0
        
        return matrix
    
    def find_similar_pairs(self, 
                          similarity_matrix: np.ndarray,
                          submission_ids: List[str],
                          student_ids: Optional[List[str]] = None) -> List[Dict]:
        """
        Find pairs of submissions above the similarity threshold.
        
        Args:
            similarity_matrix: NxN similarity matrix
            submission_ids: List of submission IDs
            student_ids: Optional list of student IDs
            
        Returns:
            List of dictionaries containing similar pairs
        """
        if student_ids is None:
            student_ids = [f"student_{i}" for i in range(len(submission_ids))]
        
        similar_pairs = []
        n = len(submission_ids)
        
        # Only check upper triangle (avoid duplicates and self-comparison)
        for i in range(n):
            for j in range(i + 1, n):
                score = similarity_matrix[i][j]
                
                # Check if above threshold
                if score >= self.threshold:
                    similar_pairs.append({
                        'submission_a': submission_ids[i],
                        'submission_b': submission_ids[j],
                        'student_a': student_ids[i],
                        'student_b': student_ids[j],
                        'similarity_score': float(round(score, 4)),
                        'flagged': True
                    })
        
        # Sort by similarity score (descending)
        similar_pairs.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return similar_pairs
    
    def get_all_pairs(self,
                     similarity_matrix: np.ndarray,
                     submission_ids: List[str],
                     student_ids: Optional[List[str]] = None,
                     min_score: float = 0.0) -> List[Dict]:
        """
        Get all pairs with their similarity scores (above min_score).
        
        Args:
            similarity_matrix: NxN similarity matrix
            submission_ids: List of submission IDs
            student_ids: Optional list of student IDs
            min_score: Minimum similarity score to include
            
        Returns:
            List of all pairs with scores above min_score
        """
        if student_ids is None:
            student_ids = [f"student_{i}" for i in range(len(submission_ids))]
        
        all_pairs = []
        n = len(submission_ids)
        
        for i in range(n):
            for j in range(i + 1, n):
                score = similarity_matrix[i][j]
                
                if score >= min_score:
                    all_pairs.append({
                        'submission_a': submission_ids[i],
                        'submission_b': submission_ids[j],
                        'student_a': student_ids[i],
                        'student_b': student_ids[j],
                        'similarity_score': float(round(score, 4)),
                        'flagged': score >= self.threshold
                    })
        
        all_pairs.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return all_pairs
    
    def get_similarity_statistics(self, similarity_matrix: np.ndarray) -> Dict:
        """
        Compute statistics about the similarity matrix.
        
        Args:
            similarity_matrix: NxN similarity matrix
            
        Returns:
            Dictionary with statistics
        """
        n = len(similarity_matrix)
        
        # Extract upper triangle (excluding diagonal)
        upper_triangle = []
        for i in range(n):
            for j in range(i + 1, n):
                upper_triangle.append(similarity_matrix[i][j])
        
        upper_triangle = np.array(upper_triangle)
        
        # Count flagged pairs
        flagged_count = np.sum(upper_triangle >= self.threshold)
        
        return {
            'total_submissions': n,
            'total_pairs': len(upper_triangle),
            'flagged_pairs': int(flagged_count),
            'flagged_percentage': float(round(flagged_count / len(upper_triangle) * 100, 2)),
            'mean_similarity': float(round(np.mean(upper_triangle), 4)),
            'median_similarity': float(round(np.median(upper_triangle), 4)),
            'max_similarity': float(round(np.max(upper_triangle), 4)),
            'min_similarity': float(round(np.min(upper_triangle), 4)),
            'std_similarity': float(round(np.std(upper_triangle), 4))
        }
    
    def format_matrix_for_frontend(self,
                                   similarity_matrix: np.ndarray,
                                   student_ids: List[str]) -> Dict:
        """
        Format similarity matrix for frontend visualization.
        
        Args:
            similarity_matrix: NxN similarity matrix
            student_ids: List of student IDs
            
        Returns:
            Dictionary with matrix data for frontend
        """
        return {
            'students': student_ids,
            'matrix': similarity_matrix.tolist(),
            'threshold': self.threshold
        }
