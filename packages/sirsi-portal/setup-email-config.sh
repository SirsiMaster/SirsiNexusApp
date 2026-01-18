#!/bin/bash

# Email Configuration Setup Script for SirsiNexus
# This script configures email settings for Firebase Cloud Functions

echo "========================================="
echo "Email Configuration Setup for SirsiNexus"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will help you configure email settings for alerts and notifications.${NC}"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Firebase CLI is not installed. Please install it first.${NC}"
    exit 1
fi

echo "To set up email notifications, you'll need:"
echo "1. A Gmail account for sending emails"
echo "2. An App Password (not your regular password)"
echo ""
echo "To create an App Password:"
echo "1. Go to https://myaccount.google.com/apppasswords"
echo "2. Sign in to your Google account"
echo "3. Select 'Mail' as the app"
echo "4. Select 'Other' as the device and name it 'SirsiNexus'"
echo "5. Copy the generated 16-character password"
echo ""

read -p "Do you have your Gmail address and App Password ready? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please get your credentials first, then run this script again."
    exit 1
fi

# Get email credentials
echo ""
read -p "Enter your Gmail address: " GMAIL_EMAIL
read -s -p "Enter your App Password (hidden): " GMAIL_PASSWORD
echo ""
read -p "Enter alerts recipient email: " ALERTS_EMAIL

# Set Firebase Functions config
echo ""
echo "Setting Firebase Functions configuration..."

firebase functions:config:set \
    gmail.email="$GMAIL_EMAIL" \
    gmail.password="$GMAIL_PASSWORD" \
    alerts.email="$ALERTS_EMAIL" \
    reports.email="$ALERTS_EMAIL" \
    --project sirsi-nexus-live

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Email configuration set successfully!${NC}"
    echo ""
    echo "Configuration set:"
    echo "- Sender email: $GMAIL_EMAIL"
    echo "- Alerts recipient: $ALERTS_EMAIL"
    echo ""
    echo "To deploy the configuration, run:"
    echo -e "${YELLOW}firebase deploy --only functions --project sirsi-nexus-live${NC}"
else
    echo -e "${RED}✗ Failed to set configuration. Please check your Firebase authentication.${NC}"
    exit 1
fi

echo ""
echo "========================================="
echo "Additional Configuration Options"
echo "========================================="
echo ""
echo "You can also configure SendGrid for production emails:"
echo "firebase functions:config:set sendgrid.key=\"YOUR_SENDGRID_API_KEY\""
echo ""
echo "Or configure custom SMTP:"
echo "firebase functions:config:set smtp.host=\"smtp.example.com\" smtp.port=\"587\" smtp.user=\"user\" smtp.pass=\"pass\""
echo ""
