"""
Main Plagiarism Engine

Orchestrates the complete plagiarism detection pipeline.
"""

from typing import List, Dict, Optional, Tuple
from pathlib import Path
import json

from .parser import CodeParser
from .normalizer import ASTNormalizer
from .similarity import SimilarityAnalyzer


class PlagiarismEngine:
    """Main plagiarism detection engine"""
    
    def __init__(self,
                 threshold: float = 0.80,
                 languages_path: str = 'build/languages.so',
                 normalize_identifiers: bool = True,
                 normalize_literals: bool = True):
        """
        Initialize the plagiarism engine.
        
        Args:
            threshold: Similarity threshold for flagging plagiarism
            languages_path: Path to tree-sitter languages library
            normalize_identifiers: Whether to normalize variable/function names
            normalize_literals: Whether to normalize literal values
        """
        self.threshold = threshold
        
        # Initialize components
        self.parser = CodeParser(languages_path)
        self.normalizer = ASTNormalizer(
            normalize_identifiers=normalize_identifiers,
            normalize_literals=normalize_literals
        )
        self.similarity_analyzer = SimilarityAnalyzer(threshold=threshold)
    
    def analyze_submissions(self,
                          submissions: List[Dict],
                          assignment_id: Optional[str] = None) -> Dict:
        """
        Analyze a list of code submissions for plagiarism.
        
        Args:
            submissions: List of submission dictionaries with keys:
                - 'id': submission ID
                - 'student_id': student ID
                - 'code': source code string
                - 'filename': filename (for language detection)
            assignment_id: Optional assignment identifier
            
        Returns:
            Dictionary with analysis results including:
                - flagged_pairs: List of flagged similar pairs
                - all_pairs: List of all pairs with scores
                - similarity_matrix: NxN similarity matrix
                - statistics: Summary statistics
        """
        if len(submissions) < 2:
            return {
                'error': 'Need at least 2 submissions to analyze',
                'flagged_pairs': [],
                'all_pairs': [],
                'statistics': {}
            }
        
        # Step 1: Parse and normalize all submissions
        print(f"Parsing and normalizing {len(submissions)} submissions...")
        normalized_tokens = []
        valid_submissions = []
        
        for submission in submissions:
            try:
                tokens = self._process_submission(
                    submission['code'],
                    submission['filename']
                )
                normalized_tokens.append(tokens)
                valid_submissions.append(submission)
            except Exception as e:
                print(f"Error processing submission {submission['id']}: {e}")
                continue
        
        if len(valid_submissions) < 2:
            return {
                'error': 'Not enough valid submissions after parsing',
                'flagged_pairs': [],
                'all_pairs': [],
                'statistics': {}
            }
        
        # Step 2: Compute similarity matrix
        print("Computing similarity matrix...")
        similarity_matrix = self.similarity_analyzer.compute_similarity_matrix(
            normalized_tokens
        )
        
        # Step 3: Find similar pairs
        submission_ids = [s['id'] for s in valid_submissions]
        student_ids = [s['student_id'] for s in valid_submissions]
        
        flagged_pairs = self.similarity_analyzer.find_similar_pairs(
            similarity_matrix,
            submission_ids,
            student_ids
        )
        
        all_pairs = self.similarity_analyzer.get_all_pairs(
            similarity_matrix,
            submission_ids,
            student_ids,
            min_score=0.3  # Only include pairs with >30% similarity
        )
        
        # Step 4: Compute statistics
        statistics = self.similarity_analyzer.get_similarity_statistics(
            similarity_matrix
        )
        
        # Step 5: Format results
        results = {
            'assignment_id': assignment_id,
            'total_submissions': len(valid_submissions),
            'flagged_pairs': flagged_pairs,
            'all_pairs': all_pairs,
            'similarity_matrix': similarity_matrix.tolist(),
            'student_ids': student_ids,
            'submission_ids': submission_ids,
            'statistics': statistics,
            'threshold': self.threshold
        }
        
        print(f"Analysis complete: {len(flagged_pairs)} flagged pairs found")
        
        return results
    
    def analyze_files(self,
                     file_paths: List[str],
                     student_ids: Optional[List[str]] = None,
                     assignment_id: Optional[str] = None) -> Dict:
        """
        Analyze code files for plagiarism.
        
        Args:
            file_paths: List of paths to code files
            student_ids: Optional list of student IDs (defaults to filenames)
            assignment_id: Optional assignment identifier
            
        Returns:
            Dictionary with analysis results
        """
        if student_ids is None:
            student_ids = [Path(fp).stem for fp in file_paths]
        
        # Read files and create submissions
        submissions = []
        for i, filepath in enumerate(file_paths):
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    code = f.read()
                
                submissions.append({
                    'id': f"submission_{i}",
                    'student_id': student_ids[i],
                    'code': code,
                    'filename': Path(filepath).name
                })
            except Exception as e:
                print(f"Error reading file {filepath}: {e}")
                continue
        
        return self.analyze_submissions(submissions, assignment_id)
    
    def compare_two_submissions(self,
                               code_a: str,
                               code_b: str,
                               filename_a: str,
                               filename_b: str) -> Dict:
        """
        Compare two code submissions directly.
        
        Args:
            code_a: First code submission
            code_b: Second code submission
            filename_a: Filename for first submission (for language detection)
            filename_b: Filename for second submission
            
        Returns:
            Dictionary with similarity score and details
        """
        submissions = [
            {
                'id': 'submission_a',
                'student_id': 'student_a',
                'code': code_a,
                'filename': filename_a
            },
            {
                'id': 'submission_b',
                'student_id': 'student_b',
                'code': code_b,
                'filename': filename_b
            }
        ]
        
        results = self.analyze_submissions(submissions)
        
        if results.get('error'):
            return results
        
        # Extract the single pair result
        similarity_score = results['similarity_matrix'][0][1]
        
        return {
            'submission_a': 'submission_a',
            'submission_b': 'submission_b',
            'similarity_score': float(round(similarity_score, 4)),
            'flagged': similarity_score >= self.threshold,
            'threshold': self.threshold
        }
    
    def _process_submission(self, code: str, filename: str) -> str:
        """
        Process a single submission: parse and normalize.
        
        Args:
            code: Source code string
            filename: Filename for language detection
            
        Returns:
            Normalized token string
        """
        # Detect language
        language = self.parser.detect_language(filename)
        if language is None:
            raise ValueError(f"Unsupported file type: {filename}")
        
        # Parse to AST
        tree = self.parser.parse(code, language)
        
        # Normalize AST
        tokens = self.normalizer.normalize(tree)
        
        # Convert to string
        token_string = self.normalizer.get_token_string(tokens)
        
        return token_string
    
    def export_results(self, results: Dict, output_path: str):
        """
        Export analysis results to JSON file.
        
        Args:
            results: Results dictionary from analyze_submissions
            output_path: Path to output JSON file
        """
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2)
        
        print(f"Results exported to {output_path}")
    
    def get_supported_languages(self) -> List[str]:
        """Get list of supported programming languages"""
        return list(self.parser.SUPPORTED_LANGUAGES.keys())
    
    def get_supported_extensions(self) -> List[str]:
        """Get list of supported file extensions"""
        return self.parser.get_supported_extensions()
