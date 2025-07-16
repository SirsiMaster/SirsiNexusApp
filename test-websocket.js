#!/usr/bin/env node

/**
 * Simple WebSocket connectivity test
 */

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:8081';

console.log('🧪 Testing WebSocket connectivity to agent backend...');
console.log(`📡 Connecting to: ${WS_URL}`);

const ws = new WebSocket(WS_URL);

// Connection timeout
const timeout = setTimeout(() => {
    console.log('❌ Connection timeout after 5 seconds');
    ws.close();
    process.exit(1);
}, 5000);

ws.on('open', () => {
    clearTimeout(timeout);
    console.log('✅ WebSocket connected successfully!');
    
    // Test basic request
    console.log('📤 Sending test request...');
    const testRequest = {
        requestId: 'test-001',
        action: 'create_session',
        data: {
            userId: 'test-user',
            context: {
                test: 'integration-test'
            }
        }
    };
    
    ws.send(JSON.stringify(testRequest));
});

ws.on('message', (data) => {
    try {
        const response = JSON.parse(data.toString());
        console.log('📥 Received response:');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.requestId === 'test-001' && response.success) {
            console.log('✅ Agent session creation successful!');
            
            // Test agent creation
            console.log('📤 Testing agent creation...');
            const agentRequest = {
                requestId: 'test-002',
                action: 'create_agent',
                sessionId: response.data?.sessionId || 'test-session',
                data: {
                    agentType: 'aws',
                    config: {
                        region: 'us-east-1'
                    }
                }
            };
            
            ws.send(JSON.stringify(agentRequest));
        } else if (response.requestId === 'test-002' && response.success) {
            console.log('✅ Agent creation successful!');
            console.log('🎉 All WebSocket tests passed!');
            ws.close();
            process.exit(0);
        }
    } catch (error) {
        console.error('❌ Failed to parse response:', error);
        console.log('Raw data:', data.toString());
    }
});

ws.on('error', (error) => {
    clearTimeout(timeout);
    console.error('❌ WebSocket error:', error.message);
    process.exit(1);
});

ws.on('close', (code, reason) => {
    clearTimeout(timeout);
    console.log(`🔌 WebSocket closed: ${code} ${reason}`);
    if (code !== 1000) {
        process.exit(1);
    }
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Test interrupted by user');
    ws.close();
    process.exit(0);
});
