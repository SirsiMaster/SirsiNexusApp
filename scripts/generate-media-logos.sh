#!/bin/bash

# Sirsi Media Logo Generator Script
# Generates all required logo sizes for social media platforms

set -e

# Source logo (high-res)
SOURCE_LOGO="/Users/thekryptodragon/Development/SirsiNexusApp/packages/sirsi-portal/assets/images/Sirsi_Logo_300ppi_cguiyg.png"

# Output directories
DIR1="/Users/thekryptodragon/Development/SirsiNexusApp/packages/sirsi-portal/assets/images/media-logos"
DIR2="/Users/thekryptodragon/Development/SirsiNexusApp/packages/sngp/assets/images/media-logos"
DIR3="/Users/thekryptodragon/Library/Mobile Documents/com~apple~CloudDocs/Sirsi/General Logo folder/hi res logo/media logo"

# Create directories if they don't exist
mkdir -p "$DIR1" "$DIR2" "$DIR3"

echo "🎨 Generating Sirsi Media Logos..."
echo "Source: $SOURCE_LOGO"
echo ""

# Function to generate a square logo
generate_square_logo() {
    local size=$1
    local name=$2
    local output_file="sirsi-logo-${name}-${size}x${size}.png"
    
    echo "📐 Creating ${name} (${size}x${size}px)..."
    
    # Copy source and resize
    cp "$SOURCE_LOGO" "$DIR1/$output_file"
    sips -z $size $size "$DIR1/$output_file" --out "$DIR1/$output_file" > /dev/null 2>&1
    
    # Copy to other directories
    cp "$DIR1/$output_file" "$DIR2/$output_file"
    cp "$DIR1/$output_file" "$DIR3/$output_file"
    
    echo "   ✅ $output_file"
}

# Function to generate a banner/rectangular logo
generate_banner_logo() {
    local width=$1
    local height=$2
    local name=$3
    local output_file="sirsi-logo-${name}-${width}x${height}.png"
    
    echo "📐 Creating ${name} (${width}x${height}px)..."
    
    # For banners, we need to pad the image to fit the aspect ratio
    # First, resize to fit within bounds maintaining aspect ratio
    cp "$SOURCE_LOGO" "$DIR1/$output_file"
    sips --resampleHeightWidth $height $width "$DIR1/$output_file" --out "$DIR1/$output_file" > /dev/null 2>&1
    
    # Copy to other directories
    cp "$DIR1/$output_file" "$DIR2/$output_file"
    cp "$DIR1/$output_file" "$DIR3/$output_file"
    
    echo "   ✅ $output_file"
}

echo "=========================================="
echo "Generating Square/Profile Logos"
echo "=========================================="

# App Icon (Required: 1024x1024)
generate_square_logo 1024 "app-icon"

# Facebook Profile (170x170)
generate_square_logo 170 "facebook-profile"

# Twitter/X Profile (400x400)
generate_square_logo 400 "twitter-profile"

# LinkedIn Profile (400x400)
generate_square_logo 400 "linkedin-profile"

# Instagram Profile (320x320)
generate_square_logo 320 "instagram-profile"

# YouTube Channel Icon (800x800)
generate_square_logo 800 "youtube-channel"

# Google Business (720x720)
generate_square_logo 720 "google-business"

# Apple Touch Icon (180x180)
generate_square_logo 180 "apple-touch"

# Favicon large (512x512)
generate_square_logo 512 "favicon-512"

# Favicon medium (192x192)
generate_square_logo 192 "favicon-192"

# Favicon small (32x32)
generate_square_logo 32 "favicon-32"

# Favicon tiny (16x16)
generate_square_logo 16 "favicon-16"

echo ""
echo "=========================================="
echo "Generating Banner/Cover Logos"
echo "=========================================="

# Facebook Cover (820x312)
generate_banner_logo 820 312 "facebook-cover"

# Twitter/X Banner (1500x500)
generate_banner_logo 1500 500 "twitter-banner"

# LinkedIn Banner (1128x191)
generate_banner_logo 1128 191 "linkedin-banner"

# YouTube Banner (2560x1440)
generate_banner_logo 2560 1440 "youtube-banner"

# Email Signature (300x100)
generate_banner_logo 300 100 "email-signature"

echo ""
echo "=========================================="
echo "Additional Standard Sizes"
echo "=========================================="

# Open Graph (1200x630) - for social shares
generate_banner_logo 1200 630 "og-image"

# WhatsApp Profile (640x640)
generate_square_logo 640 "whatsapp-profile"

# Discord Profile (512x512)
generate_square_logo 512 "discord-profile"

# Slack Profile (512x512)
generate_square_logo 512 "slack-profile"

# TikTok Profile (200x200)
generate_square_logo 200 "tiktok-profile"

# Pinterest Profile (165x165)
generate_square_logo 165 "pinterest-profile"

echo ""
echo "=========================================="
echo "✨ All logos generated successfully!"
echo "=========================================="
echo ""
echo "📁 Output Locations:"
echo "   1. $DIR1"
echo "   2. $DIR2"
echo "   3. $DIR3"
echo ""

# List all generated files
echo "📋 Generated Files:"
ls -la "$DIR1" | tail -n +4

# Check file size of the 1024x1024 (should be under 4MB)
SIZE_1024=$(stat -f%z "$DIR1/sirsi-logo-app-icon-1024x1024.png" 2>/dev/null || echo 0)
SIZE_MB=$(echo "scale=2; $SIZE_1024 / 1048576" | bc)
echo ""
echo "📊 1024x1024 App Icon Size: ${SIZE_MB}MB (requirement: under 4MB)"

if (( $(echo "$SIZE_MB < 4" | bc -l) )); then
    echo "   ✅ Size requirement met!"
else
    echo "   ⚠️  File may need compression"
fi
