"""
AST Normalizer Module

Normalizes Abstract Syntax Trees to remove superficial differences
while preserving structural similarity.
"""

from typing import List, Dict, Set


class ASTNormalizer:
    """Normalize AST to detect structural similarity"""
    
    # Node types that represent identifiers (variables, functions, classes)
    IDENTIFIER_TYPES = {
        'identifier', 'type_identifier', 'field_identifier',
        'property_identifier', 'shorthand_property_identifier'
    }
    
    # Node types that represent literals
    LITERAL_TYPES = {
        'integer', 'float', 'number', 'string', 'character',
        'true', 'false', 'null', 'none', 'boolean'
    }
    
    # Node types to ignore (comments, whitespace)
    IGNORE_TYPES = {
        'comment', 'line_comment', 'block_comment',
        'documentation_comment', 'doc_comment'
    }
    
    # Important structural node types to preserve
    STRUCTURAL_TYPES = {
        'if_statement', 'for_statement', 'while_statement',
        'function_definition', 'class_definition', 'method_definition',
        'return_statement', 'assignment', 'binary_operator',
        'call_expression', 'import_statement', 'try_statement'
    }
    
    def __init__(self, 
                 normalize_identifiers: bool = True,
                 normalize_literals: bool = True,
                 remove_comments: bool = True):
        """
        Initialize the normalizer.
        
        Args:
            normalize_identifiers: Replace variable/function names with placeholders
            normalize_literals: Replace literal values with type placeholders
            remove_comments: Remove comments from the AST
        """
        self.normalize_identifiers = normalize_identifiers
        self.normalize_literals = normalize_literals
        self.remove_comments = remove_comments
        
        # Counters for generating unique placeholders
        self.reset_counters()
    
    def reset_counters(self):
        """Reset normalization counters for a new file"""
        self.identifier_map: Dict[str, str] = {}
        self.identifier_counter = 0
    
    def normalize(self, tree) -> List[str]:
        """
        Normalize an AST tree into a token sequence.
        
        Args:
            tree: Tree-sitter Tree object
            
        Returns:
            List of normalized tokens
        """
        self.reset_counters()
        tokens = []
        self._traverse_and_normalize(tree.root_node, tokens)
        return tokens
    
    def _traverse_and_normalize(self, node, tokens: List[str]):
        """
        Recursively traverse AST and extract normalized tokens.
        
        Args:
            node: Tree-sitter Node object
            tokens: List to append tokens to
        """
        # Skip ignored node types
        if self.remove_comments and node.type in self.IGNORE_TYPES:
            return
        
        # Normalize identifiers
        if self.normalize_identifiers and node.type in self.IDENTIFIER_TYPES:
            text = node.text.decode('utf8') if isinstance(node.text, bytes) else node.text
            
            # Skip built-in keywords and common library functions
            if not self._is_builtin(text):
                normalized = self._normalize_identifier(text)
                tokens.append(normalized)
                return  # Don't process children
        
        # Normalize literals
        if self.normalize_literals and node.type in self.LITERAL_TYPES:
            tokens.append(self._normalize_literal(node.type))
            return  # Don't process children
        
        # Keep structural node types
        if node.type in self.STRUCTURAL_TYPES:
            tokens.append(node.type)
        
        # Keep operators (but don't add text for complex expressions)
        if self._is_operator(node) and len(node.children) == 0:
            text = node.text.decode('utf8') if isinstance(node.text, bytes) else node.text
            tokens.append(text)
        
        # Recursively process children
        for child in node.children:
            self._traverse_and_normalize(child, tokens)
    
    def _normalize_identifier(self, name: str) -> str:
        """
        Normalize an identifier (variable/function name).
        
        Args:
            name: Original identifier name
            
        Returns:
            Normalized placeholder (e.g., VAR_0, VAR_1)
        """
        if name not in self.identifier_map:
            self.identifier_map[name] = f"VAR_{self.identifier_counter}"
            self.identifier_counter += 1
        
        return self.identifier_map[name]
    
    def _normalize_literal(self, literal_type: str) -> str:
        """
        Normalize a literal value.
        
        Args:
            literal_type: Type of the literal node
            
        Returns:
            Normalized placeholder (NUM, STR, BOOL, NULL)
        """
        if literal_type in {'integer', 'float', 'number'}:
            return "NUM"
        elif literal_type in {'string', 'character'}:
            return "STR"
        elif literal_type in {'true', 'false', 'boolean'}:
            return "BOOL"
        elif literal_type in {'null', 'none'}:
            return "NULL"
        else:
            return "LITERAL"
    
    def _is_operator(self, node) -> bool:
        """Check if node represents an operator"""
        operator_types = {
            '+', '-', '*', '/', '%', '**', '//',
            '==', '!=', '<', '>', '<=', '>=',
            'and', 'or', 'not', '&&', '||', '!',
            '&', '|', '^', '~', '<<', '>>',
            '=', '+=', '-=', '*=', '/=',
            '.', '->', '::', '?', ':'
        }
        
        if isinstance(node.text, bytes):
            text = node.text.decode('utf8')
        else:
            text = node.text
        
        return text in operator_types or 'operator' in node.type
    
    def _is_builtin(self, name: str) -> bool:
        """Check if identifier is a built-in keyword or common function"""
        # Common built-ins across languages
        builtins = {
            # Python
            'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict',
            'set', 'tuple', 'open', 'input', 'type', 'isinstance', 'enumerate',
            # JavaScript
            'console', 'log', 'Math', 'Array', 'Object', 'String', 'Number',
            'parseInt', 'parseFloat', 'JSON', 'Date', 'Promise',
            # Java
            'System', 'String', 'Integer', 'Double', 'Boolean', 'Math',
            'ArrayList', 'HashMap', 'Scanner',
            # Common keywords
            'if', 'else', 'for', 'while', 'return', 'class', 'def', 'function',
            'var', 'let', 'const', 'import', 'from', 'public', 'private'
        }
        
        return name in builtins
    
    def get_token_string(self, tokens: List[str]) -> str:
        """
        Convert token list to space-separated string.
        
        Args:
            tokens: List of normalized tokens
            
        Returns:
            Space-separated token string
        """
        return " ".join(tokens)
