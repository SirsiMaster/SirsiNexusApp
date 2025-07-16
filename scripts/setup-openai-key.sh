#!/bin/bash

# SirsiNexus OpenAI API Key Setup Script
# This script securely adds your OpenAI API key to the environment

set -e

echo "🔑 SirsiNexus OpenAI API Key Setup"
echo "=================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please run this script from the SirsiNexus root directory."
    exit 1
fi

echo "Please enter your OpenAI API key (it should start with 'sk-'):"
echo "Note: Your input will be hidden for security"
read -s OPENAI_KEY

# Basic validation
if [[ ! $OPENAI_KEY =~ ^sk- ]]; then
    echo "❌ Invalid API key format. OpenAI keys should start with 'sk-'"
    exit 1
fi

if [ ${#OPENAI_KEY} -lt 20 ]; then
    echo "❌ API key seems too short. Please check your key."
    exit 1
fi

# Backup existing .env
cp .env .env.backup
echo "✅ Backed up existing .env to .env.backup"

# Update the .env file
sed -i.tmp "s/OPENAI_API_KEY=your_openai_api_key_here/OPENAI_API_KEY=$OPENAI_KEY/" .env
rm .env.tmp

echo "✅ OpenAI API key added successfully!"
echo ""
echo "🔄 To apply the changes:"
echo "   1. Stop any running sirsi-nexus processes"
echo "   2. Restart the platform"
echo ""
echo "🧪 Test the integration:"
echo "   ./scripts/test-ai-integration.sh"
echo ""
echo "🔒 Security note: Your API key is stored in .env (which is gitignored)"
echo "   Never commit this file to version control!"
