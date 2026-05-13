"""
Setup Script for Tree-Sitter Language Parsers

This script downloads and compiles tree-sitter language grammars.
Run this once before using the plagiarism engine.
"""

import os
import subprocess
from pathlib import Path
from tree_sitter import Language


def setup_languages():
    """Download and build tree-sitter language parsers"""
    
    print("Setting up tree-sitter language parsers...")
    
    # Create build directory
    build_dir = Path("build")
    build_dir.mkdir(exist_ok=True)
    
    # Language repositories with specific versions compatible with tree-sitter 0.20.1
    # Using older commits that support language version 13-14
    languages = {
        'python': ('https://github.com/tree-sitter/tree-sitter-python', 'v0.20.4'),
        'javascript': ('https://github.com/tree-sitter/tree-sitter-javascript', 'v0.20.4'),
        'typescript': ('https://github.com/tree-sitter/tree-sitter-typescript', 'v0.20.5'),
        'java': ('https://github.com/tree-sitter/tree-sitter-java', 'v0.20.2'),
        'cpp': ('https://github.com/tree-sitter/tree-sitter-cpp', 'v0.20.3'),
        'c': ('https://github.com/tree-sitter/tree-sitter-c', 'v0.20.7')
    }
    
    # Clone repositories
    print("\n1. Cloning language repositories...")
    for lang_name, (repo_url, version) in languages.items():
        repo_dir = build_dir / f"tree-sitter-{lang_name}"
        
        if repo_dir.exists():
            print(f"  ✓ {lang_name} already cloned")
        else:
            print(f"  Cloning {lang_name} ({version})...")
            try:
                # Clone with specific version tag
                subprocess.run(
                    ['git', 'clone', '--depth', '1', '--branch', version, repo_url, str(repo_dir)],
                    check=True,
                    capture_output=True
                )
                print(f"  ✓ {lang_name} cloned successfully")
            except subprocess.CalledProcessError as e:
                print(f"  ✗ Failed to clone {lang_name}: {e}")
                return False
    
    # Build language library
    print("\n2. Building language library...")
    try:
        Language.build_library(
            str(build_dir / 'languages.so'),
            [
                str(build_dir / 'tree-sitter-python'),
                str(build_dir / 'tree-sitter-javascript'),
                str(build_dir / 'tree-sitter-typescript' / 'typescript'),
                str(build_dir / 'tree-sitter-java'),
                str(build_dir / 'tree-sitter-cpp'),
                str(build_dir / 'tree-sitter-c'),
            ]
        )
        print("  ✓ Language library built successfully")
        print(f"  Location: {build_dir / 'languages.so'}")
    except Exception as e:
        print(f"  ✗ Failed to build language library: {e}")
        return False
    
    print("\n✓ Setup complete! You can now use the plagiarism engine.")
    return True


if __name__ == "__main__":
    success = setup_languages()
    exit(0 if success else 1)
