"""
Integration Test Script
========================
Tests the full plagiarism detection flow:
1. Create dummy code files
2. Upload them as submissions for an assignment
3. Run plagiarism analysis
4. Check results
"""

import requests
import time
from pathlib import Path

BASE_URL = "http://localhost:8000"
ASSIGNMENT_ID = "test_assignment_001"

# Dummy code files - two are very similar (plagiarized), one is different
DUMMY_FILES = {
    "student_alice.py": """
def calculate_factorial(n):
    if n == 0:
        return 1
    return n * calculate_factorial(n - 1)

def main():
    number = 5
    result = calculate_factorial(number)
    print(f"Factorial of {number} is {result}")

if __name__ == "__main__":
    main()
""",
    
    "student_bob.py": """
def calculate_factorial(num):
    if num == 0:
        return 1
    return num * calculate_factorial(num - 1)

def main():
    number = 5
    result = calculate_factorial(number)
    print(f"Factorial of {number} is {result}")

if __name__ == "__main__":
    main()
""",
    
    "student_charlie.py": """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def main():
    for i in range(10):
        print(f"Fibonacci({i}) = {fibonacci(i)}")

if __name__ == "__main__":
    main()
"""
}


def create_dummy_files():
    """Create dummy Python files in a temp directory"""
    temp_dir = Path("temp_test_files")
    temp_dir.mkdir(exist_ok=True)
    
    file_paths = {}
    for filename, content in DUMMY_FILES.items():
        filepath = temp_dir / filename
        filepath.write_text(content)
        file_paths[filename] = filepath
    
    print(f"✓ Created {len(file_paths)} dummy files in {temp_dir}")
    return file_paths


def upload_file(filepath: Path, student_id: str, assignment: str):
    """Upload a file to the backend"""
    with open(filepath, 'rb') as f:
        files = {'file': (filepath.name, f, 'text/plain')}
        data = {
            'student_id': student_id,
            'assignment': assignment
        }
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Uploaded {filepath.name} for {student_id} - file_id: {result['file_id']}")
        return result
    else:
        print(f"✗ Failed to upload {filepath.name}: {response.text}")
        return None


def analyze_plagiarism(assignment_id: str):
    """Run plagiarism analysis on an assignment"""
    print(f"\n🔍 Running plagiarism analysis for {assignment_id}...")
    response = requests.get(f"{BASE_URL}/api/plagiarism/analyze/{assignment_id}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✓ Analysis complete!")
        return result
    else:
        print(f"✗ Analysis failed: {response.text}")
        return None


def print_results(result):
    """Pretty print the plagiarism analysis results"""
    if not result or not result.get('success'):
        print("✗ No results to display")
        return
    
    print("\n" + "="*60)
    print("PLAGIARISM ANALYSIS RESULTS")
    print("="*60)
    
    print(f"\nAssignment: {result['assignment_id']}")
    print(f"Total Submissions: {result['total_submissions']}")
    
    # Print similarity matrix
    print("\n📊 SIMILARITY MATRIX:")
    matrix = result['similarity_matrix']
    students = list(matrix.keys())
    
    # Header
    print(f"{'':15}", end="")
    for student in students:
        print(f"{student:15}", end="")
    print()
    
    # Rows
    for student_a in students:
        print(f"{student_a:15}", end="")
        for student_b in students:
            similarity = matrix[student_a][student_b]
            if student_a == student_b:
                print(f"{'—':>15}", end="")
            else:
                color = "🔴" if similarity > 80 else "🟡" if similarity > 60 else "🟢"
                print(f"{color} {similarity}%{' ':10}", end="")
        print()
    
    # Print flagged pairs
    flagged = result['flagged_pairs']
    print(f"\n🚩 FLAGGED PAIRS ({len(flagged)}):")
    if flagged:
        for pair in flagged:
            print(f"  • {pair['studentA']} vs {pair['studentB']}: {pair['similarity']}% similarity")
    else:
        print("  No plagiarism detected!")
    
    # Print statistics
    if 'statistics' in result:
        stats = result['statistics']
        print(f"\n📈 STATISTICS:")
        print(f"  Mean similarity: {stats.get('mean_similarity', 0):.2f}")
        print(f"  Max similarity: {stats.get('max_similarity', 0):.2f}")
        print(f"  Flagged percentage: {stats.get('flagged_percentage', 0):.2f}%")
    
    print("\n" + "="*60)


def main():
    print("="*60)
    print("INTEGRATION TEST - Plagiarism Detection")
    print("="*60)
    
    # Step 1: Create dummy files
    print("\n[1/4] Creating dummy files...")
    file_paths = create_dummy_files()
    
    # Step 2: Upload files
    print(f"\n[2/4] Uploading files for assignment '{ASSIGNMENT_ID}'...")
    student_mapping = {
        "student_alice.py": "alice",
        "student_bob.py": "bob",
        "student_charlie.py": "charlie"
    }
    
    uploaded = []
    for filename, filepath in file_paths.items():
        student_id = student_mapping[filename]
        result = upload_file(filepath, student_id, ASSIGNMENT_ID)
        if result:
            uploaded.append(result)
    
    print(f"\n✓ Successfully uploaded {len(uploaded)}/{len(file_paths)} files")
    
    # Step 3: Wait a moment for processing
    print("\n[3/4] Waiting for backend to process...")
    time.sleep(2)
    
    # Step 4: Run plagiarism analysis
    print(f"\n[4/4] Analyzing plagiarism...")
    result = analyze_plagiarism(ASSIGNMENT_ID)
    
    # Display results
    if result:
        print_results(result)
        
        # Expected result
        print("\n💡 EXPECTED RESULT:")
        print("  Alice and Bob should be flagged (>80% similarity)")
        print("  Charlie should be different from both")
    else:
        print("\n✗ Test failed - no results returned")
    
    print("\n✅ Test complete!")
    print(f"\nYou can now:")
    print(f"  1. Open http://localhost:3000/assignments/{ASSIGNMENT_ID}/plagiarism")
    print(f"  2. View the similarity matrix in the frontend")
    print(f"  3. Click on flagged pairs to see detailed comparison")


if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Cannot connect to backend at http://localhost:8000")
        print("Make sure the backend is running!")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
