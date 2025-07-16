/**
 * WebSocket Service for Real-time Agent Communication
 * Handles connection to the Rust gRPC backend via WebSocket proxy
 */

// Enhanced types matching the new protobuf schema
export interface AgentMessage {
  id: string;
  type: 'user' | 'agent' | 'system' | 'error';
  content: string;
  timestamp: Date;
  agentName?: string;
  metadata?: {
    sessionId?: string;
    agentId?: string;
    context?: any;
    requestId?: string;
  };
  attachments?: Attachment[];
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface Attachment {
  attachmentId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  data?: ArrayBuffer;
  url?: string;
}

export interface AgentSession {
  sessionId: string;
  userId: string;
  state: 'active' | 'suspended' | 'expired' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  availableAgentTypes: AgentType[];
  metadata: Record<string, string>;
  config: SessionConfig;
}

export interface SessionConfig {
  maxAgents: number;
  timeoutSeconds: number;
  enableLogging: boolean;
  preferences: Record<string, string>;
}

export interface AgentType {
  typeId: string;
  displayName: string;
  description: string;
  version: string;
  capabilities: Capability[];
  defaultConfig: Record<string, string>;
}

export interface Capability {
  capabilityId: string;
  name: string;
  description: string;
  parameters: Parameter[];
}

export interface Parameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: any;
}

export interface SubAgent {
  agentId: string;
  sessionId: string;
  agentType: string;
  state: 'initializing' | 'ready' | 'busy' | 'error' | 'terminated';
  createdAt: Date;
  updatedAt: Date;
  config: AgentConfig;
  metadata: Record<string, string>;
  parentAgentId?: string;
}

export interface AgentConfig {
  parameters: Record<string, string>;
  timeoutSeconds: number;
  maxConcurrentOperations: number;
  enableCaching: boolean;
  requiredCapabilities: string[];
}

export interface AgentSuggestion {
  suggestionId: string;
  title: string;
  description: string;
  type: 'action' | 'query' | 'insight' | 'warning' | 'optimization';
  action: Action;
  confidence: number;
  metadata: Record<string, string>;
  priority: number;
}

export interface Action {
  actionType: string;
  parameters: Record<string, string>;
  command: string;
  requiredPermissions: string[];
}

export interface AgentStatus {
  state: 'initializing' | 'ready' | 'busy' | 'error' | 'terminated';
  statusMessage: string;
  lastActivity: Date;
  activeOperations: number;
  statusDetails: Record<string, string>;
}

export interface AgentMetrics {
  messagesProcessed: number;
  operationsCompleted: number;
  errorsEncountered: number;
  averageResponseTimeMs: number;
  lastReset: Date;
  customMetrics: Record<string, number>;
}

export interface MessageMetrics {
  processingTimeMs: number;
  tokensProcessed: number;
  modelUsed: string;
  performanceMetrics: Record<string, number>;
}

export interface SystemHealth {
  overallStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  components: Record<string, ComponentHealth>;
  lastCheck: Date;
}

export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  message: string;
  details: Record<string, string>;
}

export interface SystemMetrics {
  activeSessions: number;
  totalAgents: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  uptimeSeconds: number;
  customMetrics: Record<string, number>;
}

export interface AgentRequest {
  action: 'create_session' | 'get_session' | 'delete_session' | 'create_agent' | 'get_agent' | 'list_agents' | 'update_agent' | 'delete_agent' | 'send_message' | 'get_suggestions' | 'get_agent_status' | 'get_system_health';
  sessionId?: string;
  agentId?: string;
  data?: any;
  // Legacy actions for backwards compatibility
  legacyAction?: 'start_session' | 'spawn_agent' | 'stop_session';
}

export interface AgentResponse {
  action: string;
  success: boolean;
  data?: any;
  error?: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
}

export class AgentWebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private listeners: Map<string, ((message: AgentMessage) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || 'ws://localhost:8081',
      reconnectAttempts: config.reconnectAttempts || 5,
      reconnectDelay: config.reconnectDelay || 3000,
      heartbeatInterval: config.heartbeatInterval || 30000,
      ...config,
    };
  }

  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.config.url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected to agent backend');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connection', { type: 'system', content: 'Connected to agent backend' } as AgentMessage);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: AgentMessage = JSON.parse(event.data);
          message.timestamp = new Date(message.timestamp);
          this.emit('message', message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          this.emit('error', {
            type: 'error',
            content: 'Failed to parse message from backend',
            timestamp: new Date(),
          } as AgentMessage);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        
        if (event.code !== 1000 && this.reconnectAttempts < this.config.reconnectAttempts) {
          this.scheduleReconnect();
        } else {
          this.emit('disconnection', { 
            type: 'system', 
            content: 'Disconnected from agent backend',
            timestamp: new Date(),
          } as AgentMessage);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', {
          type: 'error',
          content: 'Connection error to agent backend',
          timestamp: new Date(),
        } as AgentMessage);
      };

    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to create WebSocket connection:', error);
      throw error;
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.listeners.clear();
  }

  sendRawMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, queuing message for retry...');
      // In production, implement message queuing with retry logic
      this.emit('error', {
        type: 'error',
        content: 'Not connected to agent backend. Please try again.',
        timestamp: new Date(),
      } as AgentMessage);
      return;
    }

    const fullMessage: AgentMessage = {
      ...message,
      id: this.generateMessageId(),
      timestamp: new Date(),
    };

    try {
      this.ws.send(JSON.stringify(fullMessage));
    } catch (error) {
      console.error('Failed to send message:', error);
      this.emit('error', {
        type: 'error',
        content: 'Failed to send message to backend',
        timestamp: new Date(),
      } as AgentMessage);
    }
  }

  on(event: string, callback: (message: AgentMessage) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (message: AgentMessage) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, message: AgentMessage): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(message));
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    console.log(`📡 Attempting to reconnect (${this.reconnectAttempts}/${this.config.reconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection attempt failed:', error);
      });
    }, this.config.reconnectDelay);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  // Enhanced Agent Service API Methods

  async createSession(userId: string, context: Record<string, string> = {}, config?: Partial<SessionConfig>): Promise<AgentSession> {
    return this.sendAgentRequest({
      action: 'create_session',
      data: { userId, context, config }
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to create agent session');
      }
      return response.data as AgentSession;
    });
  }

  async getSession(sessionId: string): Promise<{ session: AgentSession; activeAgents: SubAgent[] }> {
    return this.sendAgentRequest({
      action: 'get_session',
      sessionId,
      data: {}
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to get session');
      }
      return response.data;
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    return this.sendAgentRequest({
      action: 'delete_session',
      sessionId,
      data: {}
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete session');
      }
    });
  }

  // Legacy compatibility method
  async startAgentSession(userId: string, context: Record<string, string> = {}): Promise<AgentSession> {
    // Use new create_session API but maintain backward compatibility
    return this.createSession(userId, context);
  }

  // Enhanced Agent Lifecycle Methods

  async createAgent(
    sessionId: string,
    agentType: string,
    config?: Partial<AgentConfig>,
    context: Record<string, string> = {}
  ): Promise<{ agent: SubAgent; capabilities: Capability[] }> {
    return this.sendAgentRequest({
      action: 'create_agent',
      sessionId,
      data: { agentType, config, context }
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to create agent');
      }
      return response.data;
    });
  }

  async getAgent(sessionId: string, agentId: string): Promise<{ agent: SubAgent; metrics: AgentMetrics }> {
    return this.sendAgentRequest({
      action: 'get_agent',
      sessionId,
      agentId,
      data: {}
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to get agent');
      }
      return response.data;
    });
  }

  async listAgents(
    sessionId: string,
    pageSize: number = 50,
    pageToken?: string,
    filter?: string
  ): Promise<{ agents: SubAgent[]; nextPageToken?: string; totalSize: number }> {
    return this.sendAgentRequest({
      action: 'list_agents',
      sessionId,
      data: { pageSize, pageToken, filter }
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to list agents');
      }
      return response.data;
    });
  }

  async updateAgent(
    sessionId: string,
    agentId: string,
    agent: Partial<SubAgent>,
    updateMask?: string[]
  ): Promise<SubAgent> {
    return this.sendAgentRequest({
      action: 'update_agent',
      sessionId,
      agentId,
      data: { agent, updateMask }
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to update agent');
      }
      return response.data as SubAgent;
    });
  }

  async deleteAgent(sessionId: string, agentId: string): Promise<void> {
    return this.sendAgentRequest({
      action: 'delete_agent',
      sessionId,
      agentId,
      data: {}
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete agent');
      }
    });
  }

  // Legacy compatibility method
  async spawnSubAgent(
    sessionId: string, 
    agentType: string, 
    config: Record<string, string> = {}
  ): Promise<SubAgent> {
    // Use new create_agent API but maintain backward compatibility
    const result = await this.createAgent(sessionId, agentType, { parameters: config });
    return result.agent;
  }

  // Enhanced Messaging Methods

  async sendMessage(
    sessionId: string,
    agentId: string,
    message: {
      content: string;
      type?: 'text' | 'command' | 'query';
      attachments?: Attachment[];
      metadata?: Record<string, string>;
    },
    options?: {
      timeoutSeconds?: number;
      streamResponse?: boolean;
      context?: Record<string, string>;
      priority?: 'low' | 'normal' | 'high' | 'critical';
    }
  ): Promise<{ messageId: string; response: AgentMessage; suggestions: AgentSuggestion[]; metrics: MessageMetrics }> {
    return this.sendAgentRequest({
      action: 'send_message',
      sessionId,
      agentId,
      data: { message, options }
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to send message to agent');
      }
      return response.data;
    });
  }

  // Legacy compatibility method
  async sendAgentMessage(
    sessionId: string,
    agentId: string,
    message: string,
    context: Record<string, string> = {}
  ): Promise<{ responseId: string; response: string; suggestions: AgentSuggestion[] }> {
    const result = await this.sendMessage(sessionId, agentId, { content: message }, { context });
    return {
      responseId: result.messageId,
      response: result.response.content,
      suggestions: result.suggestions
    };
  }

  // Enhanced Suggestions Methods

  async getSuggestions(
    sessionId: string,
    agentId: string,
    context: {
      contextType: string;
      contextData: Record<string, string>;
      tags?: string[];
    },
    maxSuggestions: number = 10
  ): Promise<{ suggestions: AgentSuggestion[]; contextId: string }> {
    return this.sendAgentRequest({
      action: 'get_suggestions',
      sessionId,
      agentId,
      data: { context, maxSuggestions }
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to get suggestions');
      }
      return response.data;
    });
  }

  // Legacy compatibility method
  async getAgentSuggestions(
    sessionId: string,
    agentId: string,
    suggestionType: string,
    context: Record<string, string> = {}
  ): Promise<AgentSuggestion[]> {
    const result = await this.getSuggestions(sessionId, agentId, {
      contextType: suggestionType,
      contextData: context
    });
    return result.suggestions;
  }

  // Enhanced Monitoring Methods

  async getAgentStatus(sessionId: string, agentId: string): Promise<{
    status: AgentStatus;
    metrics: AgentMetrics;
    activeCapabilities: Capability[];
    healthStatus: string;
  }> {
    return this.sendAgentRequest({
      action: 'get_agent_status',
      sessionId,
      agentId,
      data: {}
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to get agent status');
      }
      return response.data;
    });
  }

  async getSystemHealth(includeMetrics: boolean = false): Promise<{
    health: SystemHealth;
    metrics?: SystemMetrics;
  }> {
    return this.sendAgentRequest({
      action: 'get_system_health',
      data: { includeMetrics }
    }).then(response => {
      if (!response.success) {
        throw new Error(response.error || 'Failed to get system health');
      }
      return response.data;
    });
  }

  // Legacy compatibility method
  async stopAgentSession(sessionId: string): Promise<void> {
    return this.deleteSession(sessionId);
  }

  private async sendAgentRequest(request: AgentRequest): Promise<AgentResponse> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('WebSocket not connected to agent backend'));
        return;
      }

      const requestId = this.generateMessageId();
      
      // Format request to match backend WebSocketRequest structure
      const webSocketRequest = {
        requestId,
        action: request.action,
        sessionId: request.sessionId,
        agentId: request.agentId,
        data: request.data,
      };

      // Set up one-time listener for response
      const responseHandler = (event: MessageEvent) => {
        try {
          const response = JSON.parse(event.data);
          if (response.requestId === requestId) {
            this.ws!.removeEventListener('message', responseHandler);
            resolve({
              action: response.action,
              success: response.success,
              data: response.data,
              error: response.error,
            });
          }
        } catch (error) {
          console.error('Failed to parse WebSocket response:', error);
          reject(new Error('Invalid response format from agent backend'));
        }
      };

      this.ws!.addEventListener('message', responseHandler);

      // Send request
      try {
        this.ws!.send(JSON.stringify(webSocketRequest));
      } catch (error) {
        this.ws!.removeEventListener('message', responseHandler);
        reject(new Error('Failed to send request to agent backend'));
      }

      // Set timeout for request
      setTimeout(() => {
        this.ws!.removeEventListener('message', responseHandler);
        reject(new Error('Request timeout'));
      }, 30000); // 30 second timeout
    });
  }
}

// Singleton instance for application-wide use
export const agentWebSocket = new AgentWebSocketService();

// React hook for using WebSocket in components
export const useAgentWebSocket = () => {
  return agentWebSocket;
};
