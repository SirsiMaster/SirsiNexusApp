#!/bin/bash

# Enable Firebase Services Script
# This opens the required URLs to enable Firebase services

echo "🔥 Opening Firebase Console to enable services..."
echo "================================================"
echo ""
echo "Please enable the following services in each tab that opens:"
echo ""

# Array of services to enable
declare -a services=(
    "https://console.firebase.google.com/project/sirsi-nexus-live/authentication"
    "https://console.firebase.google.com/project/sirsi-nexus-live/firestore" 
    "https://console.firebase.google.com/project/sirsi-nexus-live/database"
    "https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=sirsi-nexus-live"
    "https://console.developers.google.com/apis/api/firebasedatabase.googleapis.com/overview?project=sirsi-nexus-live"
    "https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=sirsi-nexus-live"
)

echo "📌 Services to enable:"
echo "1. Authentication - Click 'Get Started', enable Email/Password"
echo "2. Firestore - Click 'Create Database', choose Production mode"
echo "3. Realtime Database - Click 'Create Database', choose Locked mode"
echo "4. Firestore API - Click 'Enable'"
echo "5. Realtime Database API - Click 'Enable'"
echo "6. Identity Toolkit API - Click 'Enable'"
echo ""

# Open each URL
for url in "${services[@]}"
do
    echo "Opening: $url"
    open "$url" 2>/dev/null || xdg-open "$url" 2>/dev/null || echo "Please manually open: $url"
    sleep 2
done

echo ""
echo "✅ All tabs opened. Please enable each service."
echo ""
echo "After enabling all services, wait 2-3 minutes, then run:"
echo "firebase deploy --only firestore,database --project sirsi-nexus-live"
echo ""
