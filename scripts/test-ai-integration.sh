#!/bin/bash

# SirsiNexus Real AI Integration Test Script

set -e

echo "🤖 Testing SirsiNexus Real AI Integration"
echo "========================================"
echo ""

# Check if platform is running
if ! curl -s http://localhost:8080/health > /dev/null; then
    echo "❌ Platform not running. Please start sirsi-nexus first:"
    echo "   ./target/release/sirsi-nexus --dev"
    exit 1
fi

echo "✅ Platform is running"

# Test AI health endpoint
echo "🏥 Testing AI health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:8080/ai/health)
echo "$HEALTH_RESPONSE" | jq .

# Check if OpenAI is in real mode
OPENAI_MODE=$(echo "$HEALTH_RESPONSE" | jq -r '.data.services.openai.mode')
if [ "$OPENAI_MODE" = "real" ]; then
    echo "✅ OpenAI is in REAL mode"
else
    echo "⚠️  OpenAI is in MOCK mode (API key not configured or invalid)"
fi

# Check if Claude is available
CLAUDE_MODE=$(echo "$HEALTH_RESPONSE" | jq -r '.data.services.claude.mode')
if [ "$CLAUDE_MODE" = "real" ]; then
    echo "✅ Claude is in REAL mode"
else
    echo "⚠️  Claude is in MOCK mode (API key not configured)"
fi

echo ""
echo "🏗️  Testing Infrastructure Generation..."

# Test infrastructure generation
INFRA_REQUEST='{
    "description": "Test web application with database",
    "cloud_provider": "AWS",
    "ai_provider": "OpenAI",
    "requirements": {
        "performance_tier": "Standard",
        "security_level": "Enhanced",
        "budget_limit": 300.0,
        "compliance_requirements": [],
        "scaling_requirements": {
            "min_instances": 1,
            "max_instances": 5,
            "auto_scaling": true,
            "load_balancing": true
        }
    }
}'

INFRA_RESPONSE=$(curl -s -X POST http://localhost:8080/ai/infrastructure/generate \
    -H "Content-Type: application/json" \
    -d "$INFRA_REQUEST")

# Parse response
SUCCESS=$(echo "$INFRA_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
    echo "✅ Infrastructure generation successful!"
    
    TEMPLATE_TYPE=$(echo "$INFRA_RESPONSE" | jq -r '.data.template_type')
    ESTIMATED_COST=$(echo "$INFRA_RESPONSE" | jq -r '.data.estimated_cost')
    AI_PROVIDER=$(echo "$INFRA_RESPONSE" | jq -r '.data.ai_provider_used')
    CONFIDENCE=$(echo "$INFRA_RESPONSE" | jq -r '.data.confidence_score')
    
    echo "   📄 Template Type: $TEMPLATE_TYPE"
    echo "   💰 Estimated Cost: \$$ESTIMATED_COST"
    echo "   🤖 AI Provider: $AI_PROVIDER"
    echo "   📊 Confidence: $(echo "scale=1; $CONFIDENCE * 100" | bc)%"
    
    # Show first few lines of template
    echo ""
    echo "🔍 Generated Template Preview:"
    echo "$INFRA_RESPONSE" | jq -r '.data.template' | head -10
    echo "   ... (truncated)"
    
else
    echo "❌ Infrastructure generation failed:"
    echo "$INFRA_RESPONSE" | jq '.error'
fi

echo ""
echo "📊 Testing Optimization Analysis..."

# Test optimization
OPTIMIZATION_REQUEST='{
    "infrastructure_data": {
        "cloud_provider": "AWS",
        "regions": ["us-west-2"],
        "resources": [
            {
                "resource_type": "EC2",
                "instance_type": "t3.medium",
                "count": 2,
                "utilization": 0.3,
                "cost_per_hour": 0.0416,
                "tags": {"Environment": "test"}
            }
        ],
        "usage_patterns": {
            "cpu_utilization": [0.3, 0.25, 0.35, 0.28, 0.32],
            "memory_utilization": [0.4, 0.38, 0.42, 0.39, 0.41],
            "network_io": [100, 95, 105, 98, 102],
            "storage_io": [50, 48, 52, 49, 51],
            "time_series_data": []
        }
    },
    "performance_metrics": {
        "response_time_ms": 150.0,
        "throughput_rps": 100.0,
        "error_rate": 0.01,
        "availability": 0.999
    },
    "cost_constraints": {
        "monthly_budget": 500.0,
        "cost_optimization_priority": "Aggressive"
    },
    "optimization_goals": ["CostReduction"],
    "ai_provider": "OpenAI"
}'

OPT_RESPONSE=$(curl -s -X POST http://localhost:8080/ai/optimization/analyze \
    -H "Content-Type: application/json" \
    -d "$OPTIMIZATION_REQUEST")

OPT_SUCCESS=$(echo "$OPT_RESPONSE" | jq -r '.success')
if [ "$OPT_SUCCESS" = "true" ]; then
    echo "✅ Optimization analysis successful!"
    
    PREDICTED_SAVINGS=$(echo "$OPT_RESPONSE" | jq -r '.data.predicted_cost_savings')
    RECOMMENDATIONS_COUNT=$(echo "$OPT_RESPONSE" | jq '.data.recommendations | length')
    
    echo "   💰 Predicted Annual Savings: \$$PREDICTED_SAVINGS"
    echo "   📋 Recommendations: $RECOMMENDATIONS_COUNT"
    
else
    echo "❌ Optimization analysis failed:"
    echo "$OPT_RESPONSE" | jq '.error'
fi

echo ""
echo "🎉 AI Integration Test Complete!"
echo ""

if [ "$OPENAI_MODE" = "real" ] && [ "$SUCCESS" = "true" ]; then
    echo "🚀 REAL AI INTEGRATION IS WORKING!"
    echo "   Your OpenAI API key is properly configured and functional."
    echo "   SirsiNexus is now using real GPT-4 for infrastructure generation."
elif [ "$SUCCESS" = "true" ]; then
    echo "✅ Mock mode is working perfectly!"
    echo "   Add your OpenAI API key to enable real AI integration:"
    echo "   ./scripts/setup-openai-key.sh"
else
    echo "⚠️  Some issues detected. Check the logs above."
fi
