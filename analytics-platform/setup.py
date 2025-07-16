"""
Setup script for SirsiNexus Analytics Platform
"""

from setuptools import setup, find_packages
import os

# Read the README file
def read_readme():
    readme_path = os.path.join(os.path.dirname(__file__), 'README.md')
    if os.path.exists(readme_path):
        with open(readme_path, 'r', encoding='utf-8') as f:
            return f.read()
    return "SirsiNexus Analytics Platform - AI-powered cloud infrastructure analytics"

# Read requirements
def read_requirements():
    req_path = os.path.join(os.path.dirname(__file__), 'requirements.txt')
    if os.path.exists(req_path):
        with open(req_path, 'r', encoding='utf-8') as f:
            return [line.strip() for line in f if line.strip() and not line.startswith('#')]
    return []

setup(
    name="sirsi-nexus-analytics",
    version="0.7.9",
    author="SirsiNexus Team",
    author_email="dev@sirsinexus.dev",
    description="AI-powered analytics platform for cloud infrastructure optimization",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    url="https://github.com/SirsiNexusDev/SirsiNexus",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: System :: Monitoring",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    python_requires=">=3.8",
    install_requires=read_requirements(),
    extras_require={
        "dev": [
            "pytest",
            "pytest-cov",
            "flake8",
            "black",
            "mypy",
            "isort",
        ],
        "test": [
            "pytest",
            "pytest-cov",
            "pytest-mock",
        ],
    },
    include_package_data=True,
    zip_safe=False,
)
