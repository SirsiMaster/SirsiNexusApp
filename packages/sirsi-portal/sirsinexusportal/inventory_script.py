#!/usr/bin/env python3
"""
GitHub Pages Directory Inventory Script
This script collects git status, branch info, and timestamps for GitHub Pages directories
"""

import os
import subprocess
import sys
import glob
from datetime import datetime
from pathlib import Path


def run_command(command, cwd=None):
    """Run a shell command and return output"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except subprocess.TimeoutExpired:
        return "", "Command timed out", 1
    except Exception as e:
        return "", str(e), 1


def is_git_repo(directory):
    """Check if directory is a git repository"""
    stdout, stderr, returncode = run_command("git rev-parse --git-dir", cwd=directory)
    return returncode == 0


def get_git_info(directory):
    """Get git information for a directory"""
    if not is_git_repo(directory):
        return None
    
    os.chdir(directory)
    
    # Get basic git info
    short_hash, _, _ = run_command("git rev-parse --short HEAD", cwd=directory)
    branch, _, _ = run_command("git branch --show-current", cwd=directory)
    
    # Get modified files count
    status_output, _, _ = run_command("git status --porcelain", cwd=directory)
    modified_count = len(status_output.splitlines()) if status_output else 0
    
    # Get ahead/behind status
    ahead_behind = get_ahead_behind(directory, branch)
    
    # Get last modified timestamp
    last_modified = get_last_modified(directory)
    
    return {
        'short_hash': short_hash,
        'branch': branch,
        'modified_count': modified_count,
        'ahead_behind': ahead_behind,
        'last_modified': last_modified,
        'status_output': status_output
    }


def get_ahead_behind(directory, branch):
    """Get ahead/behind status with origin"""
    # Check if remote origin exists
    stdout, stderr, returncode = run_command("git remote get-url origin", cwd=directory)
    if returncode != 0:
        return "No remote origin"
    
    # Fetch latest from origin quietly
    run_command("git fetch origin", cwd=directory)
    
    # Get ahead/behind count
    stdout, stderr, returncode = run_command(f"git rev-list --count --left-right HEAD...origin/{branch}", cwd=directory)
    
    if returncode == 0 and stdout:
        try:
            ahead, behind = stdout.split('\t')
            return f"ahead {ahead}, behind {behind}"
        except ValueError:
            return "No tracking branch"
    else:
        return "No tracking branch"


def get_last_modified(directory):
    """Get last modified timestamp of working tree"""
    try:
        # Get modification time of the directory
        stat_result = os.stat(directory)
        return datetime.fromtimestamp(stat_result.st_mtime).strftime("%Y-%m-%d %H:%M:%S")
    except Exception as e:
        return f"Error getting timestamp: {e}"


def find_github_pages_dirs():
    """Find GitHub Pages directories"""
    directories = ["."]  # Start with current directory
    
    try:
        # Search for other GitHub Pages directories
        parent_dir = Path("..").resolve()
        for item in parent_dir.iterdir():
            if item.is_dir() and item.name.endswith(".github.io"):
                # Skip if it's the current directory
                if item.resolve() != Path(".").resolve():
                    relative_path = os.path.relpath(item, ".")
                    directories.append(relative_path)
    except Exception as e:
        print(f"Warning: Could not search parent directory: {e}")
    
    return list(set(directories))  # Remove duplicates


def analyze_directory(directory):
    """Analyze a single directory"""
    abs_path = os.path.abspath(directory)
    
    print(f"## Directory: {abs_path}")
    print()
    
    if not os.path.exists(directory):
        print("❌ Directory not found")
        print()
        return
    
    if not is_git_repo(directory):
        print("❌ Not a git repository")
        print()
        return
    
    git_info = get_git_info(directory)
    
    if git_info:
        print("**Git Information:**")
        print(f"- **Commit Hash:** `{git_info['short_hash']}`")
        print(f"- **Branch:** `{git_info['branch']}`")
        print(f"- **Status vs Origin:** {git_info['ahead_behind']}")
        print(f"- **Modified Files:** {git_info['modified_count']}")
        print(f"- **Last Modified:** {git_info['last_modified']}")
        
        # Show any uncommitted changes
        if git_info['modified_count'] > 0:
            print()
            print("**Uncommitted Changes:**")
            print("```")
            status_lines = git_info['status_output'].splitlines()
            for line in status_lines[:10]:  # Show first 10 lines
                print(line)
            if len(status_lines) > 10:
                print(f"... and {len(status_lines) - 10} more files")
            print("```")
    
    print()


def main():
    """Main execution"""
    print("# GitHub Pages Directory Inventory Report")
    print(f"Generated on: {datetime.now().strftime('%a %b %d %H:%M:%S %Z %Y')}")
    print()
    
    # Find directories to analyze
    directories = find_github_pages_dirs()
    
    print("Searching for GitHub Pages directories...")
    print(f"Found {len(directories)} directories to analyze.")
    print()
    
    # Analyze each directory
    for directory in sorted(directories):
        analyze_directory(directory)
    
    print("---")
    print()
    print("**Summary:**")
    print(f"- Total directories analyzed: {len(directories)}")
    print(f"- Report generated: {datetime.now().strftime('%a %b %d %H:%M:%S %Z %Y')}")
    print()
    print("*Use this report to identify the most up-to-date repository and any divergent commits.*")


if __name__ == "__main__":
    main()
