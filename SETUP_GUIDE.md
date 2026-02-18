# Setting Up GitHub, SSH Keys, GitHub Pages, Actions, and Git LFS

This guide provides detailed steps and an automation script to set up a new repository with GitHub Pages, Actions, and Git LFS integration. Follow these steps to configure your repository efficiently and manage large files seamlessly.

## Step-by-Step Tutorial

### 1. Setup a GitHub Repository
1. **Create a Repository**: Go to GitHub and create a new repository.
2. **Clone the Repository**: Use `git clone` to clone the repository to your local machine.

### 2. Setting Up SSH Keys
1. **Generate SSH Key**:
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ```
2. **Add SSH Key to SSH-Agent**:
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_rsa
   ```
3. **Add SSH Key to GitHub**:
   - Copy the public key to the clipboard: `pbcopy < ~/.ssh/id_rsa.pub`
   - Add it via GitHub's settings under SSH and GPG keys.

### 3. GitHub Pages Configuration
1. **Create `docs` Directory**: Manage Jekyll site content inside the `docs` folder.
2. **Create Content Markdown Files**: Create landing and documentation markdown pages in `docs`.
3. **Setup Jekyll**:
   - Add a `_config.yml` file in `docs` for Jekyll configuration.
4. **Custom Domain**: Add a `CNAME` file with your domain name.

### 4. GitHub Actions Setup
1. **Create `.github/workflows` Directory**: Store workflow YAML files here.
2. **Create Deployment Workflow**:
   - Write a YAML file to automate the Jekyll build and deployment process.
3. **Push Workflow**: Ensure the workflow is pushed to GitHub.

### 5. Large Files Management with Git LFS
1. **Install Git LFS**:
   ```bash
   brew install git-lfs
   git lfs install
   ```
2. **Track Large Files**:
   ```bash
   git lfs track "*.log"
   git lfs track "*.db"
   git lfs track "*.sqlite*"
   git lfs track "temp/**"
   git lfs track "temp/**"
   ```
3. **Commit `.gitattributes`**: Commit the file to store Git LFS settings.

## Automation Script
Here's a simple script that automates the setup:

```bash
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
if ! command -v git-lfs &> /dev/null; then
  echo "Installing Git LFS"
  brew install git-lfs
  git lfs install
fi

echo "Setting up Git LFS tracking"
git lfs track "*.log"
git lfs track "*.db"
git lfs track "*.sqlite*"
git lfs track "temp/**"

git add .gitattributes
git commit -m "Setup Git LFS tracking"

# GitHub Pages
mkdir -p docs
cat <<EOL > docs/index.md
# Welcome to My GitHub Page
This is the landing page of my site.
EOL

echo "
Publishing to GitHub Pages..."
git add docs/
git commit -m "Add GitHub Pages content"
git push
```

Place this script in your repository root and run it on a fresh setup to streamline installation and configuration. Adjust paths, emails, and content as needed for your specific use case.

