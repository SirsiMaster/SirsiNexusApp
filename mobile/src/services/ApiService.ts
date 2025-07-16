import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface DashboardData {
  totalProjects: number;
  activeAgents: number;
  totalResources: number;
  monthlyCost: number;
  recentActivities: Activity[];
  performanceMetrics: PerformanceMetric[];
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
}

interface PerformanceMetric {
  name: string;
  value: number;
  change: number;
  unit: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  resourceCount: number;
  estimatedCost: number;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'error';
  capabilities: string[];
  lastActivity: string;
  metrics: {
    tasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
  };
}

class ApiServiceClass {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = Config.API_BASE_URL || 'http://localhost:3000/api';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear auth and redirect to login
          await this.clearAuth();
          // You might want to emit an event here to redirect to login
        }
        return Promise.reject(error);
      }
    );
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  private async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await this.client.post<ApiResponse<{ token: string; user: any }>>('/auth/login', {
      email,
      password,
    });

    if (response.data.success && response.data.data.token) {
      await this.setAuthToken(response.data.data.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.data.user));
    }

    return response.data.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      await this.clearAuth();
    }
  }

  async refreshToken(): Promise<string> {
    const response = await this.client.post<ApiResponse<{ token: string }>>('/auth/refresh');
    
    if (response.data.success && response.data.data.token) {
      await this.setAuthToken(response.data.data.token);
      return response.data.data.token;
    }
    
    throw new Error('Failed to refresh token');
  }

  // Dashboard methods
  async getDashboardData(): Promise<DashboardData> {
    const response = await this.client.get<ApiResponse<DashboardData>>('/dashboard');
    return response.data.data;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    const response = await this.client.get<ApiResponse<Project[]>>('/projects');
    return response.data.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.client.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    const response = await this.client.post<ApiResponse<Project>>('/projects', projectData);
    return response.data.data;
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    const response = await this.client.put<ApiResponse<Project>>(`/projects/${id}`, projectData);
    return response.data.data;
  }

  async deleteProject(id: string): Promise<void> {
    await this.client.delete(`/projects/${id}`);
  }

  // Agent methods
  async getAgents(): Promise<Agent[]> {
    const response = await this.client.get<ApiResponse<Agent[]>>('/agents');
    return response.data.data;
  }

  async getAgent(id: string): Promise<Agent> {
    const response = await this.client.get<ApiResponse<Agent>>(`/agents/${id}`);
    return response.data.data;
  }

  async spawnAgent(agentType: string, config: Record<string, any>): Promise<Agent> {
    const response = await this.client.post<ApiResponse<Agent>>('/agents/spawn', {
      type: agentType,
      config,
    });
    return response.data.data;
  }

  async stopAgent(id: string): Promise<void> {
    await this.client.post(`/agents/${id}/stop`);
  }

  async sendMessageToAgent(agentId: string, message: string): Promise<{
    messageId: string;
    response: string;
    suggestions: any[];
  }> {
    const response = await this.client.post<ApiResponse<{
      messageId: string;
      response: string;
      suggestions: any[];
    }>>(`/agents/${agentId}/message`, { message });
    return response.data.data;
  }

  // Resource discovery methods
  async discoverResources(provider: 'aws' | 'azure' | 'gcp', config: Record<string, any>): Promise<any[]> {
    const response = await this.client.post<ApiResponse<any[]>>('/resources/discover', {
      provider,
      config,
    });
    return response.data.data;
  }

  // Migration methods
  async createMigrationPlan(projectId: string, resources: any[]): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(`/projects/${projectId}/migration-plan`, {
      resources,
    });
    return response.data.data;
  }

  async executeMigration(projectId: string, planId: string): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(`/projects/${projectId}/migrate`, {
      planId,
    });
    return response.data.data;
  }

  // Performance monitoring
  async getPerformanceMetrics(timeframe: string): Promise<PerformanceMetric[]> {
    const response = await this.client.get<ApiResponse<PerformanceMetric[]>>(`/metrics?timeframe=${timeframe}`);
    return response.data.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get<ApiResponse<{ status: string; timestamp: string }>>('/health');
    return response.data.data;
  }

  // Utility methods
  async checkConnectivity(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  }

  setBaseURL(url: string): void {
    this.baseURL = url;
    this.client.defaults.baseURL = url;
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

export const ApiService = new ApiServiceClass();
export type { DashboardData, Activity, PerformanceMetric, Project, Agent };
