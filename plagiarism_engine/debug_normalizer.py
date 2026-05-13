"""Debug script to check normalizer output"""

from parser import CodeParser
from normalizer import ASTNormalizer

code_alice = '''
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)
'''

code_bob = '''
def fact(num):
    if num == 0:
        return 1
    return num * fact(num - 1)
'''

parser = CodeParser('build/languages.so')
normalizer = ASTNormalizer()

print("=" * 60)
print("ALICE'S CODE:")
print("=" * 60)
tree_alice = parser.parse(code_alice, 'python')
tokens_alice = normalizer.normalize(tree_alice)
token_string_alice = normalizer.get_token_string(tokens_alice)

print(f"Token count: {len(tokens_alice)}")
print(f"Tokens: {tokens_alice}")
print(f"Token string: {token_string_alice}")

print("\n" + "=" * 60)
print("BOB'S CODE:")
print("=" * 60)
normalizer.reset_counters()  # Reset for new file
tree_bob = parser.parse(code_bob, 'python')
tokens_bob = normalizer.normalize(tree_bob)
token_string_bob = normalizer.get_token_string(tokens_bob)

print(f"Token count: {len(tokens_bob)}")
print(f"Tokens: {tokens_bob}")
print(f"Token string: {token_string_bob}")

print("\n" + "=" * 60)
print("COMPARISON:")
print("=" * 60)
print(f"Alice tokens: {len(tokens_alice)}")
print(f"Bob tokens: {len(tokens_bob)}")
print(f"Identical: {token_string_alice == token_string_bob}")
