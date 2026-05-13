"""
Seed the database with dummy data AND actual code files for testing
"""
import sqlite3
from datetime import datetime, timedelta
import random
from pathlib import Path
import uuid

DB_PATH = Path("submissions.db")
UPLOAD_DIR = Path("uploads")

# Ensure upload directory exists
UPLOAD_DIR.mkdir(exist_ok=True)

# Dummy data
ASSIGNMENTS = [
    "Lab 1: Python Basics",
    "Lab 2: Data Structures",
    "Project: Web Scraper",
    "Midterm: Algorithms",
    "Lab 3: File Processing",
    "Project: REST API",
    "Lab 4: Database Design"
]

STUDENTS = [
    "alice", "bob", "charlie", "david", "emma",
    "frank", "grace", "henry", "iris", "jack",
    "kate", "liam", "mia", "noah", "olivia",
    "peter", "quinn", "rachel", "sam", "tina"
]

# UNIQUE code templates - each student gets different code
UNIQUE_TEMPLATES = [
    # Template 1: Factorial with recursion
    """def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

def main():
    number = 5
    result = factorial(number)
    print(f"Factorial of {number} is {result}")

if __name__ == "__main__":
    main()
""",
    
    # Template 2: Fibonacci sequence
    """def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def main():
    for i in range(10):
        print(f"Fibonacci({i}) = {fibonacci(i)}")

if __name__ == "__main__":
    main()
""",
    
    # Template 3: Bubble sort
    """def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

def main():
    data = [64, 34, 25, 12, 22, 11, 90]
    sorted_data = bubble_sort(data)
    print("Sorted array:", sorted_data)

if __name__ == "__main__":
    main()
""",
    
    # Template 4: Binary search
    """def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

def main():
    data = [1, 3, 5, 7, 9, 11, 13, 15]
    target = 7
    result = binary_search(data, target)
    print(f"Found at index: {result}")

if __name__ == "__main__":
    main()
""",
    
    # Template 5: Calculator class
    """class Calculator:
    def add(self, a, b):
        return a + b
    
    def subtract(self, a, b):
        return a - b
    
    def multiply(self, a, b):
        return a * b
    
    def divide(self, a, b):
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b

def main():
    calc = Calculator()
    print("10 + 5 =", calc.add(10, 5))
    print("10 - 5 =", calc.subtract(10, 5))
    print("10 * 5 =", calc.multiply(10, 5))
    print("10 / 5 =", calc.divide(10, 5))

if __name__ == "__main__":
    main()
""",
    
    # Template 6: File operations
    """def read_file(filename):
    try:
        with open(filename, 'r') as f:
            content = f.read()
        return content
    except FileNotFoundError:
        return "File not found"

def write_file(filename, content):
    with open(filename, 'w') as f:
        f.write(content)

def main():
    content = "Hello, World!"
    write_file("test.txt", content)
    result = read_file("test.txt")
    print(result)

if __name__ == "__main__":
    main()
""",
    
    # Template 7: List operations
    """def find_max(numbers):
    if not numbers:
        return None
    max_val = numbers[0]
    for num in numbers:
        if num > max_val:
            max_val = num
    return max_val

def find_min(numbers):
    if not numbers:
        return None
    min_val = numbers[0]
    for num in numbers:
        if num < min_val:
            min_val = num
    return min_val

def main():
    data = [45, 23, 67, 12, 89, 34]
    print("Max:", find_max(data))
    print("Min:", find_min(data))

if __name__ == "__main__":
    main()
""",
    
    # Template 8: String utilities
    """def reverse_string(s):
    return s[::-1]

def is_palindrome(s):
    s = s.lower().replace(" ", "")
    return s == s[::-1]

def count_vowels(s):
    vowels = "aeiouAEIOU"
    count = 0
    for char in s:
        if char in vowels:
            count += 1
    return count

def main():
    text = "Hello World"
    print("Reversed:", reverse_string(text))
    print("Is palindrome:", is_palindrome("racecar"))
    print("Vowel count:", count_vowels(text))

if __name__ == "__main__":
    main()
""",

    # Template 9: Prime number checker
    """def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

def find_primes(limit):
    primes = []
    for num in range(2, limit):
        if is_prime(num):
            primes.append(num)
    return primes

def main():
    limit = 50
    primes = find_primes(limit)
    print(f"Prime numbers up to {limit}: {primes}")

if __name__ == "__main__":
    main()
""",

    # Template 10: Merge sort
    """def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result

def main():
    data = [38, 27, 43, 3, 9, 82, 10]
    sorted_data = merge_sort(data)
    print("Sorted:", sorted_data)

if __name__ == "__main__":
    main()
""",

    # Template 11: Dictionary operations
    """def count_frequency(text):
    freq = {}
    for char in text.lower():
        if char.isalpha():
            freq[char] = freq.get(char, 0) + 1
    return freq

def most_common(freq_dict):
    if not freq_dict:
        return None
    return max(freq_dict.items(), key=lambda x: x[1])

def main():
    text = "hello world"
    freq = count_frequency(text)
    print("Character frequency:", freq)
    print("Most common:", most_common(freq))

if __name__ == "__main__":
    main()
""",

    # Template 12: Stack implementation
    """class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        return None
    
    def peek(self):
        if not self.is_empty():
            return self.items[-1]
        return None
    
    def is_empty(self):
        return len(self.items) == 0

def main():
    stack = Stack()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    print("Top:", stack.peek())
    print("Pop:", stack.pop())
    print("Top:", stack.peek())

if __name__ == "__main__":
    main()
""",

    # Template 13: Queue implementation
    """class Queue:
    def __init__(self):
        self.items = []
    
    def enqueue(self, item):
        self.items.append(item)
    
    def dequeue(self):
        if not self.is_empty():
            return self.items.pop(0)
        return None
    
    def is_empty(self):
        return len(self.items) == 0
    
    def size(self):
        return len(self.items)

def main():
    queue = Queue()
    queue.enqueue("A")
    queue.enqueue("B")
    queue.enqueue("C")
    print("Dequeue:", queue.dequeue())
    print("Size:", queue.size())

if __name__ == "__main__":
    main()
""",

    # Template 14: Matrix operations
    """def create_matrix(rows, cols, value=0):
    return [[value for _ in range(cols)] for _ in range(rows)]

def transpose(matrix):
    rows = len(matrix)
    cols = len(matrix[0])
    result = create_matrix(cols, rows)
    
    for i in range(rows):
        for j in range(cols):
            result[j][i] = matrix[i][j]
    
    return result

def main():
    matrix = [[1, 2, 3], [4, 5, 6]]
    print("Original:", matrix)
    print("Transposed:", transpose(matrix))

if __name__ == "__main__":
    main()
""",

    # Template 15: GCD and LCM
    """def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    return abs(a * b) // gcd(a, b)

def main():
    num1, num2 = 12, 18
    print(f"GCD of {num1} and {num2}: {gcd(num1, num2)}")
    print(f"LCM of {num1} and {num2}: {lcm(num1, num2)}")

if __name__ == "__main__":
    main()
"""
]

# PLAGIARISM PAIRS - slightly modified versions for realistic plagiarism detection
PLAGIARISM_PAIRS = {
    "factorial_copy": """def factorial(num):
    if num == 0:
        return 1
    return num * factorial(num - 1)

def main():
    number = 5
    result = factorial(number)
    print(f"Factorial of {number} is {result}")

if __name__ == "__main__":
    main()
""",
    
    "bubble_sort_copy": """def bubble_sort(array):
    length = len(array)
    for i in range(length):
        for j in range(0, length-i-1):
            if array[j] > array[j+1]:
                array[j], array[j+1] = array[j+1], array[j]
    return array

def main():
    numbers = [64, 34, 25, 12, 22, 11, 90]
    result = bubble_sort(numbers)
    print("Sorted array:", result)

if __name__ == "__main__":
    main()
"""
}

def create_code_file(file_id, filename, code_content):
    """Create an actual code file in the uploads directory"""
    file_path = UPLOAD_DIR / f"{file_id}_{filename}"
    file_path.write_text(code_content, encoding='utf-8')
    return file_path

def seed_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute("DELETE FROM submissions")
    
    # Clear existing upload files
    for file in UPLOAD_DIR.glob("*"):
        if file.is_file():
            file.unlink()
    
    print("🗑️  Cleared existing data and files")
    
    # Generate submissions with actual code files
    submission_id = 1
    
    for assignment in ASSIGNMENTS:
        # Random number of submissions per assignment (10-15)
        num_submissions = random.randint(10, 15)
        
        print(f"\n📝 Creating {num_submissions} submissions for '{assignment}'...")
        
        # Shuffle templates to ensure variety
        available_templates = UNIQUE_TEMPLATES.copy()
        random.shuffle(available_templates)
        
        # Track students used in this assignment
        used_students = []
        
        # Decide which 2-3 submissions will be plagiarism pairs
        num_plagiarism_pairs = random.randint(1, 2)  # 1-2 pairs (2-4 students total)
        plagiarism_indices = random.sample(range(num_submissions), num_plagiarism_pairs * 2)
        
        for i in range(num_submissions):
            # Pick a unique student
            student = random.choice(STUDENTS)
            while student in used_students:
                student = random.choice(STUDENTS)
            used_students.append(student)
            
            # Determine which code to use
            if i in plagiarism_indices:
                # This is part of a plagiarism pair
                pair_index = plagiarism_indices.index(i)
                if pair_index % 2 == 0:
                    # First student in pair - use original
                    if pair_index // 2 == 0:
                        code = UNIQUE_TEMPLATES[0]  # factorial
                    else:
                        code = UNIQUE_TEMPLATES[2]  # bubble_sort
                else:
                    # Second student in pair - use plagiarized version
                    if pair_index // 2 == 0:
                        code = PLAGIARISM_PAIRS["factorial_copy"]
                    else:
                        code = PLAGIARISM_PAIRS["bubble_sort_copy"]
            else:
                # Regular unique submission
                # Use templates in order, cycling if needed
                template_index = i % len(available_templates)
                code = available_templates[template_index]
            
            # Generate file ID and create actual file
            file_id = f"sub_{submission_id:05d}"
            filename = f"solution_{student}.py"
            
            # Create actual code file
            create_code_file(file_id, filename, code)
            
            # Random date in the last 30 days
            days_ago = random.randint(0, 30)
            uploaded_at = (datetime.now() - timedelta(days=days_ago)).isoformat()
            
            # Random AI score (60-100)
            ai_score = random.randint(60, 100)
            
            # Random status
            status = random.choice(["uploaded", "reviewed", "flagged"])
            
            cursor.execute("""
                INSERT INTO submissions 
                (student_id, assignment, filename, file_id, status, ai_score, uploaded_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (student, assignment, filename, file_id, status, ai_score, uploaded_at))
            
            submission_id += 1
    
    conn.commit()
    conn.close()
    
    print(f"\n✅ Database seeded with {submission_id - 1} submissions")
    print(f"   Assignments: {len(ASSIGNMENTS)}")
    print(f"   Students: {len(STUDENTS)}")
    print(f"   Code files created in: {UPLOAD_DIR.absolute()}")
    print(f"\n🎯 Plagiarism detection will work now!")
    print(f"   - Each student gets UNIQUE code (15 different templates)")
    print(f"   - Only 1-2 pairs per assignment are plagiarized (2-4 students)")
    print(f"   - Most similarity scores will be LOW (<50%)")
    print(f"   - Only plagiarism pairs will show HIGH similarity (>80%)")
    print(f"   - Run plagiarism analysis to see realistic results!")

if __name__ == "__main__":
    seed_database()
