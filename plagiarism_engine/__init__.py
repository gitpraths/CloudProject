"""
Plagiarism Detection Engine

A code similarity detection system using AST parsing and TF-IDF analysis.
"""

from .engine import PlagiarismEngine
from .parser import CodeParser
from .normalizer import ASTNormalizer
from .similarity import SimilarityAnalyzer

__version__ = "1.0.0"
__all__ = ["PlagiarismEngine", "CodeParser", "ASTNormalizer", "SimilarityAnalyzer"]
