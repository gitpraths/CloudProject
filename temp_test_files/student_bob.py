
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
