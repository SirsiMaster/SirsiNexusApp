/**
 * SirsiNexus API Service
 * Comprehensive API integration layer with authentication, error handling, and caching
 * @version 1.0.0
 */

class APIService {
    constructor(baseUrl = '/api/v1') {
        this.baseUrl = baseUrl;
        this.defaultTimeout = 30000; // 30 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
        
        // Initialize request interceptors
        this.interceptors = {
            request: [],
            response: [],
            error: []
        };
        
        this.setupDefaults();
    }

    /**
     * Setup default configurations
     */
    setupDefaults() {
        // Add auth token to all requests
        this.addRequestInterceptor((config) => {
            if (typeof sessionManager !== 'undefined' && sessionManager.getAuthToken) {
                const token = sessionManager.getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            
            // Add timestamp to prevent caching
            if (!config.cache) {
                config.headers = config.headers || {};
                config.headers['Cache-Control'] = 'no-cache';
                config.headers['X-Timestamp'] = Date.now();
            }
            
            return config;
        });

        // Handle token refresh on 401
        this.addResponseInterceptor(
            (response) => response,
            async (error) => {
                if (error.status === 401 && !error.config._retry) {
                    error.config._retry = true;
                    
                    try {
                        if (typeof sessionManager !== 'undefined' && sessionManager.refreshToken) {
                            await sessionManager.refreshToken();
                            // Retry the original request
                            return this.request(error.config);
                        }
                    } catch (refreshError) {
                        if (typeof sessionManager !== 'undefined' && sessionManager.logout) {
                            sessionManager.logout('token_expired');
                        }
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Add request interceptor
     */
    addRequestInterceptor(onFulfilled, onRejected) {
        this.interceptors.request.push({ onFulfilled, onRejected });
    }

    /**
     * Add response interceptor
     */
    addResponseInterceptor(onFulfilled, onRejected) {
        this.interceptors.response.push({ onFulfilled, onRejected });
    }

    /**
     * Add error interceptor
     */
    addErrorInterceptor(handler) {
        this.interceptors.error.push(handler);
    }

    /**
     * Make HTTP request
     */
    async request(config) {
        // Apply request interceptors
        let requestConfig = { ...config };
        for (const interceptor of this.interceptors.request) {
            if (interceptor.onFulfilled) {
                try {
                    requestConfig = await interceptor.onFulfilled(requestConfig);
                } catch (error) {
                    if (interceptor.onRejected) {
                        return interceptor.onRejected(error);
                    }
                    throw error;
                }
            }
        }

        const url = this.buildUrl(requestConfig.url);
        const options = this.buildRequestOptions(requestConfig);

        try {
            let response = await this.fetchWithRetry(url, options);
            
            // Apply response interceptors
            for (const interceptor of this.interceptors.response) {
                if (interceptor.onFulfilled) {
                    try {
                        response = await interceptor.onFulfilled(response);
                    } catch (error) {
                        if (interceptor.onRejected) {
                            return interceptor.onRejected(error);
                        }
                        throw error;
                    }
                }
            }

            return response;
        } catch (error) {
            // Apply error interceptors
            for (const interceptor of this.interceptors.error) {
                try {
                    await interceptor(error);
                } catch (handlerError) {
                    console.error('Error in error interceptor:', handlerError);
                }
            }

            // Apply response error interceptors
            for (const interceptor of this.interceptors.response) {
                if (interceptor.onRejected) {
                    try {
                        return await interceptor.onRejected(error);
                    } catch (rejectionError) {
                        // Continue to next interceptor
                    }
                }
            }

            throw error;
        }
    }

    /**
     * Build full URL
     */
    buildUrl(endpoint) {
        if (endpoint.startsWith('http')) {
            return endpoint;
        }
        return `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    }

    /**
     * Build fetch options from config
     */
    buildRequestOptions(config) {
        const options = {
            method: config.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...config.headers
            },
            signal: this.createTimeoutSignal(config.timeout || this.defaultTimeout)
        };

        if (config.body) {
            if (config.body instanceof FormData) {
                // Remove Content-Type header for FormData
                delete options.headers['Content-Type'];
                options.body = config.body;
            } else if (typeof config.body === 'object') {
                options.body = JSON.stringify(config.body);
            } else {
                options.body = config.body;
            }
        }

        return options;
    }

    /**
     * Create timeout signal
     */
    createTimeoutSignal(timeout) {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeout);
        return controller.signal;
    }

    /**
     * Fetch with retry logic
     */
    async fetchWithRetry(url, options, attempt = 1) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.config = options;
                
                // Clone response before reading to avoid stream issues
                const clonedResponse = response.clone();
                
                // Try to parse error response
                try {
                    const errorData = await clonedResponse.json();
                    error.data = errorData;
                } catch (parseError) {
                    try {
                        error.data = await response.text();
                    } catch (textError) {
                        error.data = null;
                    }
                }
                
                throw error;
            }

            // Parse response based on content type
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else if (contentType && contentType.includes('text/')) {
                data = await response.text();
            } else {
                data = await response.blob();
            }

            return {
                data,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                config: options
            };
        } catch (error) {
            if (attempt < this.retryAttempts && this.shouldRetry(error)) {
                console.warn(`Request failed, retrying (${attempt}/${this.retryAttempts})...`);
                await this.delay(this.retryDelay * attempt);
                return this.fetchWithRetry(url, options, attempt + 1);
            }
            throw error;
        }
    }

    /**
     * Determine if request should be retried
     */
    shouldRetry(error) {
        // Retry on network errors or server errors (5xx)
        return !error.status || (error.status >= 500 && error.status < 600);
    }

    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // HTTP Methods

    /**
     * GET request
     */
    async get(url, config = {}) {
        return this.request({
            ...config,
            method: 'GET',
            url
        });
    }

    /**
     * POST request
     */
    async post(url, data = null, config = {}) {
        return this.request({
            ...config,
            method: 'POST',
            url,
            body: data
        });
    }

    /**
     * PUT request
     */
    async put(url, data = null, config = {}) {
        return this.request({
            ...config,
            method: 'PUT',
            url,
            body: data
        });
    }

    /**
     * PATCH request
     */
    async patch(url, data = null, config = {}) {
        return this.request({
            ...config,
            method: 'PATCH',
            url,
            body: data
        });
    }

    /**
     * DELETE request
     */
    async delete(url, config = {}) {
        return this.request({
            ...config,
            method: 'DELETE',
            url
        });
    }

    /**
     * Upload file(s)
     */
    async upload(url, files, additionalData = {}, config = {}) {
        const formData = new FormData();
        
        // Add files
        if (files instanceof FileList || Array.isArray(files)) {
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
        } else {
            formData.append('file', files);
        }
        
        // Add additional data
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        return this.request({
            ...config,
            method: 'POST',
            url,
            body: formData
        });
    }

    /**
     * Download file
     */
    async download(url, config = {}) {
        const response = await this.request({
            ...config,
            method: 'GET',
            url
        });

        // Create download link
        const blob = response.data;
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Get filename from response headers or URL
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'download';
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        } else {
            const urlParts = url.split('/');
            filename = urlParts[urlParts.length - 1] || 'download';
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        return response;
    }
}

// DashboardAPI is now defined in dashboard-api.js to avoid duplication

// Global API service instance
const apiService = new APIService();

// Expose to global window object
window.APIService = APIService;
window.apiService = apiService;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIService };
}
