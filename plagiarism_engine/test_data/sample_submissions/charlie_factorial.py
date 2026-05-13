"""
Charlie's submission - Iterative factorial (different algorithm)
"""

def factorial(n):
    """Calculate factorial iteratively"""
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result


if __name__ == "__main__":
    print(factorial(5))
