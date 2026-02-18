#!/bin/bash

# Exit on any error
set -e

# Create SSH keys if they don't exist
echo "Checking SSH keys"
if [ ! -f ~/.ssh/id_rsa ]; then
  echo "Generating SSH keys"
  ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
  eval "$(ssh-agent -s)"
  ssh-add ~/.ssh/id_rsa
  echo "Please add your SSH key to GitHub (cat ~/.ssh/id_rsa.pub)"
fi

# Git LFS setup
if ! command -v git-lfs > /dev/null; then
  echo "Installing Git LFS"
  brew install git-lfs
  git lfs install
fi

echo "Setting up Git LFS tracking"
git lfs track "*.log"
git lfs track "*.sst"
git lfs track "*.db"
git lfs track "*.sqlite*"
git lfs track "*.wal"
git lfs track "node1/**"
git lfs track "core-engine/postgres-data/**"
git lfs track "temp/**"

git add .gitattributes
git commit -m "Setup Git LFS tracking"

# GitHub Pages
mkdir -p docs
cat <<EOL > docs/index.md
# Welcome to My GitHub Page
This is the landing page of my site.
EOL

echo "\nPublishing to GitHub Pages..."
git add docs/
git commit -m "Add GitHub Pages content"
git push
