"""
Code Parser Module

Handles AST parsing using tree-sitter for multiple programming languages.
"""

from tree_sitter import Language, Parser
import os
from pathlib import Path
from typing import Optional, Dict


class CodeParser:
    """Parse code into Abstract Syntax Trees using tree-sitter"""
    
    SUPPORTED_LANGUAGES = {
        'python': ['.py'],
        'javascript': ['.js', '.jsx'],
        'typescript': ['.ts', '.tsx'],
        'java': ['.java'],
        'cpp': ['.cpp', '.cc', '.cxx'],
        'c': ['.c', '.h']
    }
    
    def __init__(self, languages_path: str = 'build/languages.so'):
        """
        Initialize the parser with language support.
        
        Args:
            languages_path: Path to the compiled tree-sitter languages library
        """
        # Make path absolute relative to this file's directory
        if not os.path.isabs(languages_path):
            module_dir = Path(__file__).parent
            languages_path = str(module_dir / languages_path)
        
        self.languages_path = languages_path
        self.parser = Parser()
        self.languages: Dict[str, Language] = {}
        self._load_languages()
    
    def _load_languages(self):
        """Load tree-sitter language parsers"""
        if not os.path.exists(self.languages_path):
            raise FileNotFoundError(
                f"Tree-sitter languages library not found at {self.languages_path}. "
                "Run setup_languages.py first to build the language parsers."
            )
        
        # Load each supported language
        for lang_name in self.SUPPORTED_LANGUAGES.keys():
            try:
                self.languages[lang_name] = Language(self.languages_path, lang_name)
            except Exception as e:
                print(f"Warning: Could not load {lang_name} parser: {e}")
    
    def detect_language(self, filename: str) -> Optional[str]:
        """
        Detect programming language from file extension.
        
        Args:
            filename: Name of the code file
            
        Returns:
            Language name or None if not supported
        """
        ext = Path(filename).suffix.lower()
        
        for lang_name, extensions in self.SUPPORTED_LANGUAGES.items():
            if ext in extensions:
                return lang_name
        
        return None
    
    def parse(self, code: str, language: str):
        """
        Parse code into an AST.
        
        Args:
            code: Source code as string
            language: Programming language name
            
        Returns:
            Tree-sitter Tree object
            
        Raises:
            ValueError: If language is not supported
        """
        if language not in self.languages:
            raise ValueError(
                f"Language '{language}' not supported. "
                f"Supported languages: {list(self.languages.keys())}"
            )
        
        # Set the parser language
        self.parser.set_language(self.languages[language])
        
        # Parse the code
        tree = self.parser.parse(bytes(code, "utf8"))
        
        return tree
    
    def parse_file(self, filepath: str, language: Optional[str] = None):
        """
        Parse a code file into an AST.
        
        Args:
            filepath: Path to the code file
            language: Programming language (auto-detected if None)
            
        Returns:
            Tree-sitter Tree object
        """
        # Read file
        with open(filepath, 'r', encoding='utf-8') as f:
            code = f.read()
        
        # Detect language if not provided
        if language is None:
            language = self.detect_language(filepath)
            if language is None:
                raise ValueError(f"Could not detect language for file: {filepath}")
        
        return self.parse(code, language)
    
    def is_supported(self, filename: str) -> bool:
        """Check if a file is supported based on extension"""
        return self.detect_language(filename) is not None
    
    def get_supported_extensions(self) -> list:
        """Get list of all supported file extensions"""
        extensions = []
        for exts in self.SUPPORTED_LANGUAGES.values():
            extensions.extend(exts)
        return extensions
