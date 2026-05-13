"""
Basic Usage Example for Plagiarism Engine

This example demonstrates how to use the plagiarism engine
to analyze code submissions.
"""

import sys
sys.path.append('..')

from plagiarism_engine import PlagiarismEngine


def example_1_basic_analysis():
    """Example 1: Analyze a list of code submissions"""
    
    print("=" * 60)
    print("Example 1: Basic Analysis")
    print("=" * 60)
    
    # Initialize engine with 80% threshold
    engine = PlagiarismEngine(threshold=0.80)
    
    # Sample submissions
    submissions = [
        {
            'id': 'sub_001',
            'student_id': 'alice',
            'code': '''
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)
''',
            'filename': 'solution.py'
        },
        {
            'id': 'sub_002',
            'student_id': 'bob',
            'code': '''
def fact(num):
    if num == 0:
        return 1
    return num * fact(num - 1)
''',
            'filename': 'solution.py'
        },
        {
            'id': 'sub_003',
            'student_id': 'charlie',
            'code': '''
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result
''',
            'filename': 'solution.py'
        }
    ]
    
    # Run analysis
    results = engine.analyze_submissions(submissions, assignment_id='hw1')
    
    # Print results
    print(f"\nTotal submissions: {results['total_submissions']}")
    print(f"Flagged pairs: {len(results['flagged_pairs'])}")
    print(f"\nStatistics:")
    for key, value in results['statistics'].items():
        print(f"  {key}: {value}")
    
    print(f"\nFlagged pairs:")
    for pair in results['flagged_pairs']:
        print(f"  {pair['student_a']} vs {pair['student_b']}: {pair['similarity_score']:.2%}")
    
    print(f"\nAll pairs:")
    for pair in results['all_pairs']:
        flag = "🚩" if pair['flagged'] else "✓"
        print(f"  {flag} {pair['student_a']} vs {pair['student_b']}: {pair['similarity_score']:.2%}")


def example_2_compare_two():
    """Example 2: Compare two code snippets directly"""
    
    print("\n" + "=" * 60)
    print("Example 2: Compare Two Submissions")
    print("=" * 60)
    
    engine = PlagiarismEngine(threshold=0.80)
    
    code_a = '''
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
'''
    
    code_b = '''
def sort_array(array):
    length = len(array)
    for x in range(length):
        for y in range(0, length-x-1):
            if array[y] > array[y+1]:
                array[y], array[y+1] = array[y+1], array[y]
    return array
'''
    
    result = engine.compare_two_submissions(
        code_a=code_a,
        code_b=code_b,
        filename_a='sort.py',
        filename_b='sort.py'
    )
    
    print(f"\nSimilarity score: {result['similarity_score']:.2%}")
    print(f"Flagged: {'Yes' if result['flagged'] else 'No'}")
    print(f"Threshold: {result['threshold']:.2%}")


def example_3_different_thresholds():
    """Example 3: Test different threshold values"""
    
    print("\n" + "=" * 60)
    print("Example 3: Different Thresholds")
    print("=" * 60)
    
    code_a = '''
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
'''
    
    code_b = '''
def fib(num):
    if num <= 1:
        return num
    return fib(num-1) + fib(num-2)
'''
    
    thresholds = [0.70, 0.80, 0.90]
    
    for threshold in thresholds:
        engine = PlagiarismEngine(threshold=threshold)
        result = engine.compare_two_submissions(
            code_a=code_a,
            code_b=code_b,
            filename_a='fib.py',
            filename_b='fib.py'
        )
        
        print(f"\nThreshold: {threshold:.0%}")
        print(f"  Similarity: {result['similarity_score']:.2%}")
        print(f"  Flagged: {'Yes' if result['flagged'] else 'No'}")


def example_4_multi_language():
    """Example 4: Analyze submissions in different languages"""
    
    print("\n" + "=" * 60)
    print("Example 4: Multi-Language Support")
    print("=" * 60)
    
    engine = PlagiarismEngine(threshold=0.80)
    
    # Python submission
    python_code = '''
def max_value(arr):
    max_val = arr[0]
    for num in arr:
        if num > max_val:
            max_val = num
    return max_val
'''
    
    # JavaScript submission
    js_code = '''
function maxValue(arr) {
    let maxVal = arr[0];
    for (let num of arr) {
        if (num > maxVal) {
            maxVal = num;
        }
    }
    return maxVal;
}
'''
    
    submissions = [
        {'id': 'sub_py', 'student_id': 'alice', 'code': python_code, 'filename': 'max.py'},
        {'id': 'sub_js', 'student_id': 'bob', 'code': js_code, 'filename': 'max.js'}
    ]
    
    results = engine.analyze_submissions(submissions)
    
    print(f"\nSupported languages: {', '.join(engine.get_supported_languages())}")
    print(f"Supported extensions: {', '.join(engine.get_supported_extensions())}")
    
    if results['all_pairs']:
        pair = results['all_pairs'][0]
        print(f"\nCross-language similarity:")
        print(f"  Python vs JavaScript: {pair['similarity_score']:.2%}")


if __name__ == "__main__":
    # Run all examples
    example_1_basic_analysis()
    example_2_compare_two()
    example_3_different_thresholds()
    example_4_multi_language()
    
    print("\n" + "=" * 60)
    print("Examples completed!")
    print("=" * 60)
