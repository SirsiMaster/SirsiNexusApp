import { apiClient } from './apiClient';

export interface CloudProvider {
  id: 'aws' | 'azure' | 'gcp' | 'digitalocean';
  name: string;
  icon: string;
}

export interface Credential {
  id: string;
  provider: CloudProvider['id'];
  alias?: string;
  created_at: string;
  updated_at: string;
  lastTested?: string;
  testStatus?: 'success' | 'failed' | 'pending' | 'never';
}

export interface CredentialFormData {
  provider: CloudProvider['id'];
  alias: string;
  credentials: {
    // AWS
    access_key_id?: string;
    secret_access_key?: string;
    region?: string;
    session_token?: string;
    role_arn?: string;
    external_id?: string;
    // Azure
    client_id?: string;
    client_secret?: string;
    tenant_id?: string;
    subscription_id?: string;
    resource_group?: string;
    // GCP
    service_account_key?: string;
    project_id?: string;
    // DigitalOcean
    api_token?: string;
    spaces_access_key?: string;
    spaces_secret_key?: string;
    spaces_endpoint?: string;
  };
  test_connection: boolean;
}

export interface CredentialTestResult {
  success: boolean;
  message: string;
  details?: Record<string, string>;
}

export interface CredentialResponse {
  id: string;
  provider: CloudProvider['id'];
  alias?: string;
  created_at: string;
  updated_at: string;
  test_result?: CredentialTestResult;
}

export interface ListCredentialsResponse {
  credentials: Credential[];
  total: number;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, string>;
}

class CredentialService {
  private baseUrl = '/api';

  async listCredentials(): Promise<ListCredentialsResponse> {
    const response = await apiClient.get(`${this.baseUrl}/credentials`);
    return response.data;
  }

  async getCredential(id: string): Promise<CredentialResponse> {
    const response = await apiClient.get(`${this.baseUrl}/credentials/${id}`);
    return response.data;
  }

  async createCredential(data: CredentialFormData): Promise<CredentialResponse> {
    const payload = {
      provider: data.provider,
      alias: data.alias || null,
      credentials: data.credentials,
      test_connection: data.test_connection,
    };

    const response = await apiClient.post(`${this.baseUrl}/credentials`, payload);
    return response.data;
  }

  async updateCredential(
    id: string,
    data: Partial<CredentialFormData>
  ): Promise<CredentialResponse> {
    const payload = {
      alias: data.alias,
      credentials: data.credentials,
      test_connection: data.test_connection,
    };

    const response = await apiClient.put(`${this.baseUrl}/credentials/${id}`, payload);
    return response.data;
  }

  async deleteCredential(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/credentials/${id}`);
  }

  async testCredential(id: string): Promise<CredentialTestResult> {
    const response = await apiClient.post(`${this.baseUrl}/credentials/${id}/test`);
    return response.data;
  }

  // Utility methods
  getProviderInfo(providerId: CloudProvider['id']): CloudProvider {
    const providers: Record<CloudProvider['id'], CloudProvider> = {
      aws: { id: 'aws', name: 'AWS', icon: '🟠' },
      azure: { id: 'azure', name: 'Azure', icon: '🔵' },
      gcp: { id: 'gcp', name: 'Google Cloud', icon: '🟡' },
      digitalocean: { id: 'digitalocean', name: 'DigitalOcean', icon: '💙' },
    };
    return providers[providerId];
  }

  getAllProviders(): CloudProvider[] {
    return [
      { id: 'aws', name: 'AWS', icon: '🟠' },
      { id: 'azure', name: 'Azure', icon: '🔵' },
      { id: 'gcp', name: 'Google Cloud', icon: '🟡' },
      { id: 'digitalocean', name: 'DigitalOcean', icon: '💙' },
    ];
  }

  validateCredentials(provider: CloudProvider['id'], credentials: any): string[] {
    const errors: string[] = [];

    switch (provider) {
      case 'aws':
        if (!credentials.access_key_id) errors.push('AWS Access Key ID is required');
        if (!credentials.secret_access_key) errors.push('AWS Secret Access Key is required');
        if (credentials.access_key_id && credentials.access_key_id.length < 16) {
          errors.push('AWS Access Key ID appears to be invalid');
        }
        break;

      case 'azure':
        if (!credentials.client_id) errors.push('Azure Client ID is required');
        if (!credentials.client_secret) errors.push('Azure Client Secret is required');
        if (!credentials.tenant_id) errors.push('Azure Tenant ID is required');
        // Basic UUID validation
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (credentials.client_id && !uuidRegex.test(credentials.client_id)) {
          errors.push('Azure Client ID must be a valid UUID');
        }
        if (credentials.tenant_id && !uuidRegex.test(credentials.tenant_id)) {
          errors.push('Azure Tenant ID must be a valid UUID');
        }
        break;

      case 'gcp':
        if (!credentials.service_account_key) errors.push('GCP Service Account Key is required');
        if (credentials.service_account_key) {
          try {
            JSON.parse(credentials.service_account_key);
          } catch {
            errors.push('GCP Service Account Key must be valid JSON');
          }
        }
        break;

      case 'digitalocean':
        if (!credentials.api_token) errors.push('DigitalOcean API Token is required');
        if (credentials.api_token && credentials.api_token.length < 64) {
          errors.push('DigitalOcean API Token appears to be invalid');
        }
        break;
    }

    return errors;
  }
}

export const credentialService = new CredentialService();
