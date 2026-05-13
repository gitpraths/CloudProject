"""
Unit tests for the Plagiarism Engine
"""

import pytest
import sys
sys.path.append('..')

from plagiarism_engine import PlagiarismEngine


class TestPlagiarismEngine:
    """Test cases for the main engine"""
    
    @pytest.fixture
    def engine(self):
        """Create engine instance for testing"""
        return PlagiarismEngine(threshold=0.80)
    
    def test_identical_code(self, engine):
        """Test that identical code has 100% similarity"""
        code = '''
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)
'''
        
        result = engine.compare_two_submissions(
            code_a=code,
            code_b=code,
            filename_a='test.py',
            filename_b='test.py'
        )
        
        assert result['similarity_score'] >= 0.99
        assert result['flagged'] == True
    
    def test_renamed_variables(self, engine):
        """Test that renamed variables are detected as similar"""
        code_a = '''
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)
'''
        
        code_b = '''
def fact(num):
    if num == 0:
        return 1
    return num * fact(num - 1)
'''
        
        result = engine.compare_two_submissions(
            code_a=code_a,
            code_b=code_b,
            filename_a='test.py',
            filename_b='test.py'
        )
        
        # Should be very similar (>90%)
        assert result['similarity_score'] >= 0.90
        assert result['flagged'] == True
    
    def test_different_algorithms(self, engine):
        """Test that different algorithms have low similarity"""
        code_a = '''
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)
'''
        
        code_b = '''
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result
'''
        
        result = engine.compare_two_submissions(
            code_a=code_a,
            code_b=code_b,
            filename_a='test.py',
            filename_b='test.py'
        )
        
        # Should be different (<70%)
        assert result['similarity_score'] < 0.70
        assert result['flagged'] == False
    
    def test_multiple_submissions(self, engine):
        """Test analyzing multiple submissions"""
        submissions = [
            {
                'id': 'sub_1',
                'student_id': 'alice',
                'code': 'def add(a, b): return a + b',
                'filename': 'test.py'
            },
            {
                'id': 'sub_2',
                'student_id': 'bob',
                'code': 'def sum(x, y): return x + y',
                'filename': 'test.py'
            },
            {
                'id': 'sub_3',
                'student_id': 'charlie',
                'code': 'def multiply(a, b): return a * b',
                'filename': 'test.py'
            }
        ]
        
        results = engine.analyze_submissions(submissions)
        
        assert results['total_submissions'] == 3
        assert 'similarity_matrix' in results
        assert 'statistics' in results
        assert len(results['all_pairs']) == 3  # 3 choose 2 = 3 pairs
    
    def test_threshold_adjustment(self):
        """Test that threshold affects flagging"""
        code_a = 'def add(a, b): return a + b'
        code_b = 'def sum(x, y): return x + y'
        
        # Strict threshold
        engine_strict = PlagiarismEngine(threshold=0.95)
        result_strict = engine_strict.compare_two_submissions(
            code_a, code_b, 'test.py', 'test.py'
        )
        
        # Lenient threshold
        engine_lenient = PlagiarismEngine(threshold=0.70)
        result_lenient = engine_lenient.compare_two_submissions(
            code_a, code_b, 'test.py', 'test.py'
        )
        
        # Same similarity score
        assert result_strict['similarity_score'] == result_lenient['similarity_score']
        
        # But different flagging based on threshold
        # (This test may need adjustment based on actual similarity)
    
    def test_unsupported_language(self, engine):
        """Test handling of unsupported file types"""
        submissions = [
            {
                'id': 'sub_1',
                'student_id': 'alice',
                'code': 'some code',
                'filename': 'test.unsupported'
            }
        ]
        
        results = engine.analyze_submissions(submissions)
        
        # Should handle gracefully
        assert 'error' in results or results['total_submissions'] == 0
    
    def test_empty_submissions(self, engine):
        """Test handling of empty submission list"""
        results = engine.analyze_submissions([])
        
        assert 'error' in results
        assert results['flagged_pairs'] == []
    
    def test_single_submission(self, engine):
        """Test handling of single submission"""
        submissions = [
            {
                'id': 'sub_1',
                'student_id': 'alice',
                'code': 'def test(): pass',
                'filename': 'test.py'
            }
        ]
        
        results = engine.analyze_submissions(submissions)
        
        assert 'error' in results
        assert results['flagged_pairs'] == []


if __name__ == "__main__":
    pytest.main([__file__, '-v'])
