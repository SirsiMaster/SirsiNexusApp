#!/bin/zsh

# 🚀 SirsiNexus Unified Platform Launcher
# This script provides easy access to the revolutionary unified binary

echo "🚀 SirsiNexus - AI-Powered Infrastructure Management Platform"
echo "============================================================="
echo ""

# Navigate to the SirsiNexus directory
cd "$(dirname "$0")"

# Check if binary exists
if [[ ! -f "./sirsi-nexus" ]]; then
    echo "❌ Error: sirsi-nexus binary not found!"
    echo "Building the binary..."
    cd core-engine
    cargo build --release --bin sirsi-nexus
    cd ..
    cp target/release/sirsi-nexus ./sirsi-nexus
    chmod +x sirsi-nexus
fi

# Show help if no arguments provided
if [[ $# -eq 0 ]]; then
    echo "🔧 Available commands:"
    echo ""
    ./sirsi-nexus --help
    echo ""
    echo "🎯 Quick start:"
    echo "  ./start.sh start         # Start the platform"
    echo "  ./start.sh start --dev   # Start in development mode"
    echo "  ./start.sh status        # Show platform status"
    echo "  ./start.sh health        # Show platform health"
    echo ""
    exit 0
fi

# Pass all arguments to the binary
echo "🎯 Running: sirsi-nexus $@"
echo ""
./sirsi-nexus "$@"
