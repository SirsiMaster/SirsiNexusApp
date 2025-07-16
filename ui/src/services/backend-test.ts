/**
 * Backend Integration Test Service
 * Tests and validates the connection to the Rust core engine
 */

import { agentWebSocket } from './websocket';

interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'pending';
  message: string;
  timestamp: Date;
  duration?: number;
}

interface BackendHealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  services: {
    grpc: boolean;
    websocket: boolean;
    database: boolean;
    redis: boolean;
  };
  version: string;
  uptime: number;
}

export class BackendTestService {
  private baseUrl: string;
  private grpcUrl: string;
  private wsUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
    this.grpcUrl = process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:50051';
    this.wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/agent-ws';
  }

  async runFullIntegrationTest(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    console.log('🧪 Starting backend integration tests...');

    // Test 1: HTTP Health Check
    results.push(await this.testHttpHealthCheck());

    // Test 2: WebSocket Connection
    results.push(await this.testWebSocketConnection());

    // Test 3: Agent Message Flow
    results.push(await this.testAgentMessageFlow());

    // Test 4: Credential Validation
    results.push(await this.testCredentialValidation());

    // Test 5: Resource Discovery
    results.push(await this.testResourceDiscovery());

    console.log('✅ Backend integration tests completed');
    return results;
  }

  private async testHttpHealthCheck(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const healthData: BackendHealthCheck = await response.json();
        
        return {
          testName: 'HTTP Health Check',
          status: 'passed',
          message: `Backend is ${healthData.status}. Version: ${healthData.version}`,
          timestamp: new Date(),
          duration,
        };
      } else {
        return {
          testName: 'HTTP Health Check',
          status: 'failed',
          message: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date(),
          duration,
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        testName: 'HTTP Health Check',
        status: 'failed',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        duration,
      };
    }
  }

  private async testWebSocketConnection(): Promise<TestResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      try {
        const testWs = new WebSocket(this.wsUrl);
        
        const timeout = setTimeout(() => {
          testWs.close();
          resolve({
            testName: 'WebSocket Connection',
            status: 'failed',
            message: 'Connection timeout after 5 seconds',
            timestamp: new Date(),
            duration: Date.now() - startTime,
          });
        }, 5000);

        testWs.onopen = () => {
          clearTimeout(timeout);
          const duration = Date.now() - startTime;
          testWs.close();
          
          resolve({
            testName: 'WebSocket Connection',
            status: 'passed',
            message: 'WebSocket connection established successfully',
            timestamp: new Date(),
            duration,
          });
        };

        testWs.onerror = (error) => {
          clearTimeout(timeout);
          const duration = Date.now() - startTime;
          
          resolve({
            testName: 'WebSocket Connection',
            status: 'failed',
            message: 'WebSocket connection failed',
            timestamp: new Date(),
            duration,
          });
        };

      } catch (error) {
        const duration = Date.now() - startTime;
        resolve({
          testName: 'WebSocket Connection',
          status: 'failed',
          message: `WebSocket error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          duration,
        });
      }
    });
  }

  private async testAgentMessageFlow(): Promise<TestResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      if (!agentWebSocket.isConnected()) {
        resolve({
          testName: 'Agent Message Flow',
          status: 'failed',
          message: 'WebSocket not connected',
          timestamp: new Date(),
          duration: Date.now() - startTime,
        });
        return;
      }

      let messageReceived = false;
      
      const timeout = setTimeout(() => {
        if (!messageReceived) {
          resolve({
            testName: 'Agent Message Flow',
            status: 'failed',
            message: 'No response received within 10 seconds',
            timestamp: new Date(),
            duration: Date.now() - startTime,
          });
        }
      }, 10000);

      const messageHandler = (message: any) => {
        if (message.type === 'agent' && message.content.includes('test')) {
          clearTimeout(timeout);
          messageReceived = true;
          
          agentWebSocket.off('message', messageHandler);
          
          resolve({
            testName: 'Agent Message Flow',
            status: 'passed',
            message: 'Agent responded to test message successfully',
            timestamp: new Date(),
            duration: Date.now() - startTime,
          });
        }
      };

      agentWebSocket.on('message', messageHandler);
      
      // Send test message
      agentWebSocket.sendRawMessage({
        type: 'user',
        content: 'test connection',
        agentName: 'TestUser',
        metadata: { 
          sessionId: 'test-session',
          context: { testId: 'integration-test' }
        }
      });
    });
  }

  private async testCredentialValidation(): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/credentials/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'aws',
          credentials: {
            accessKeyId: 'test',
            secretAccessKey: 'test',
            region: 'us-east-1'
          }
        }),
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const result = await response.json();
        return {
          testName: 'Credential Validation',
          status: 'passed',
          message: `Credential validation endpoint responding: ${result.status}`,
          timestamp: new Date(),
          duration,
        };
      } else {
        return {
          testName: 'Credential Validation',
          status: 'failed',
          message: `Validation endpoint error: ${response.status}`,
          timestamp: new Date(),
          duration,
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        testName: 'Credential Validation',
        status: 'failed',
        message: `Credential validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        duration,
      };
    }
  }

  private async testResourceDiscovery(): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/discovery/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'aws',
          resourceTypes: ['ec2', 's3'],
          region: 'us-east-1'
        }),
      });

      const duration = Date.now() - startTime;

      if (response.ok) {
        const result = await response.json();
        return {
          testName: 'Resource Discovery',
          status: 'passed',
          message: `Discovered ${result.resourceCount || 0} resources in ${result.scanTime || 0}ms`,
          timestamp: new Date(),
          duration,
        };
      } else {
        return {
          testName: 'Resource Discovery',
          status: 'failed',
          message: `Discovery endpoint error: ${response.status}`,
          timestamp: new Date(),
          duration,
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        testName: 'Resource Discovery',
        status: 'failed',
        message: `Resource discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        duration,
      };
    }
  }

  async testSpecificEndpoint(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const duration = Date.now() - startTime;

      return {
        testName: `Custom Endpoint Test: ${endpoint}`,
        status: response.ok ? 'passed' : 'failed',
        message: `${method} ${endpoint}: ${response.status} ${response.statusText}`,
        timestamp: new Date(),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        testName: `Custom Endpoint Test: ${endpoint}`,
        status: 'failed',
        message: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        duration,
      };
    }
  }

  generateTestReport(results: TestResult[]): string {
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const pending = results.filter(r => r.status === 'pending').length;

    let report = '# Backend Integration Test Report\n\n';
    report += `**Summary:** ${passed} passed, ${failed} failed, ${pending} pending\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    results.forEach(result => {
      const statusIcon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏳';
      report += `${statusIcon} **${result.testName}**\n`;
      report += `   Status: ${result.status}\n`;
      report += `   Message: ${result.message}\n`;
      if (result.duration) {
        report += `   Duration: ${result.duration}ms\n`;
      }
      report += `   Timestamp: ${result.timestamp.toISOString()}\n\n`;
    });

    return report;
  }
}

// Export singleton instance
export const backendTestService = new BackendTestService();
