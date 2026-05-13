"""
Alice's submission - Recursive factorial
"""

def factorial(n):
    """Calculate factorial recursively"""
    if n == 0:
        return 1
    return n * factorial(n - 1)


if __name__ == "__main__":
    print(factorial(5))
