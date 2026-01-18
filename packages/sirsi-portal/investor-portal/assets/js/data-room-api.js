/**
 * Data Room API Service
 * Handles backend communication for document management
 * This would typically integrate with a server-side API
 */
class DataRoomAPI {
    constructor(baseUrl = '/api/data-room') {
        this.baseUrl = baseUrl;
        this.authToken = this.getAuthToken();
    }

    getAuthToken() {
        const auth = sessionStorage.getItem('investorAuth');
        if (auth) {
            try {
                const authData = JSON.parse(auth);
                return authData.token || null;
            } catch (error) {
                console.error('Error parsing auth token:', error);
                return null;
            }
        }
        return null;
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (this.authToken) {
            defaultHeaders['Authorization'] = `Bearer ${this.authToken}`;
        }

        const requestOptions = {
            method: 'GET',
            headers: { ...defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Document Management APIs

    /**
     * Get all documents with optional filters
     */
    async getDocuments(filters = {}) {
        const queryParams = new URLSearchParams();
        
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.accessLevel) queryParams.append('accessLevel', filters.accessLevel);
        if (filters.limit) queryParams.append('limit', filters.limit);
        if (filters.offset) queryParams.append('offset', filters.offset);

        const endpoint = `/documents${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        return this.makeRequest(endpoint);
    }

    /**
     * Get a specific document by ID
     */
    async getDocument(documentId) {
        return this.makeRequest(`/documents/${documentId}`);
    }

    /**
     * Upload a new document
     */
    async uploadDocument(file, metadata) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', metadata.category);
        formData.append('accessLevel', metadata.accessLevel);
        formData.append('description', metadata.description || '');
        formData.append('tags', JSON.stringify(metadata.tags || []));

        return this.makeRequest('/documents/upload', {
            method: 'POST',
            headers: {
                // Remove Content-Type header to let browser set it with boundary
                'Authorization': `Bearer ${this.authToken}`
            },
            body: formData
        });
    }

    /**
     * Upload multiple documents
     */
    async uploadMultipleDocuments(files, metadata) {
        const formData = new FormData();
        
        files.forEach((file, index) => {
            formData.append(`files`, file);
        });
        
        formData.append('category', metadata.category);
        formData.append('accessLevel', metadata.accessLevel);
        formData.append('description', metadata.description || '');
        formData.append('tags', JSON.stringify(metadata.tags || []));

        return this.makeRequest('/documents/upload-multiple', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.authToken}`
            },
            body: formData
        });
    }

    /**
     * Update document metadata
     */
    async updateDocument(documentId, updates) {
        return this.makeRequest(`/documents/${documentId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    /**
     * Delete a document
     */
    async deleteDocument(documentId) {
        return this.makeRequest(`/documents/${documentId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Download a document
     */
    async downloadDocument(documentId) {
        const response = await fetch(`${this.baseUrl}/documents/${documentId}/download`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.authToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }

        return response.blob();
    }

    /**
     * Get document preview/thumbnail
     */
    async getDocumentPreview(documentId) {
        return this.makeRequest(`/documents/${documentId}/preview`);
    }

    // Version Management APIs

    /**
     * Get version history for a document
     */
    async getVersionHistory(documentId) {
        return this.makeRequest(`/documents/${documentId}/versions`);
    }

    /**
     * Upload a new version of an existing document
     */
    async uploadNewVersion(documentId, file, versionNotes = '') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('versionNotes', versionNotes);

        return this.makeRequest(`/documents/${documentId}/versions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.authToken}`
            },
            body: formData
        });
    }

    /**
     * Download a specific version of a document
     */
    async downloadDocumentVersion(documentId, versionId) {
        const response = await fetch(`${this.baseUrl}/documents/${documentId}/versions/${versionId}/download`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.authToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Version download failed: ${response.status} ${response.statusText}`);
        }

        return response.blob();
    }

    // Access Control APIs

    /**
     * Get access permissions for a document
     */
    async getDocumentPermissions(documentId) {
        return this.makeRequest(`/documents/${documentId}/permissions`);
    }

    /**
     * Update access permissions for a document
     */
    async updateDocumentPermissions(documentId, permissions) {
        return this.makeRequest(`/documents/${documentId}/permissions`, {
            method: 'PUT',
            body: JSON.stringify(permissions)
        });
    }

    /**
     * Grant access to specific users
     */
    async grantDocumentAccess(documentId, userIds, accessLevel = 'read') {
        return this.makeRequest(`/documents/${documentId}/access`, {
            method: 'POST',
            body: JSON.stringify({
                userIds,
                accessLevel
            })
        });
    }

    /**
     * Revoke access from specific users
     */
    async revokeDocumentAccess(documentId, userIds) {
        return this.makeRequest(`/documents/${documentId}/access`, {
            method: 'DELETE',
            body: JSON.stringify({ userIds })
        });
    }

    // Search APIs

    /**
     * Search documents by content
     */
    async searchDocuments(query, filters = {}) {
        const searchParams = {
            query,
            ...filters
        };

        return this.makeRequest('/search/documents', {
            method: 'POST',
            body: JSON.stringify(searchParams)
        });
    }

    /**
     * Search within a specific document
     */
    async searchWithinDocument(documentId, query) {
        return this.makeRequest(`/documents/${documentId}/search`, {
            method: 'POST',
            body: JSON.stringify({ query })
        });
    }

    // Analytics and Statistics APIs

    /**
     * Get document statistics
     */
    async getDocumentStatistics() {
        return this.makeRequest('/statistics/documents');
    }

    /**
     * Get user activity statistics
     */
    async getUserActivity(timeframe = '7d') {
        return this.makeRequest(`/statistics/activity?timeframe=${timeframe}`);
    }

    /**
     * Get download statistics
     */
    async getDownloadStatistics(documentId = null) {
        const endpoint = documentId 
            ? `/statistics/downloads/${documentId}`
            : '/statistics/downloads';
        return this.makeRequest(endpoint);
    }

    // Category Management APIs

    /**
     * Get all available categories
     */
    async getCategories() {
        return this.makeRequest('/categories');
    }

    /**
     * Create a new category
     */
    async createCategory(categoryData) {
        return this.makeRequest('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    }

    /**
     * Update a category
     */
    async updateCategory(categoryId, updates) {
        return this.makeRequest(`/categories/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    /**
     * Delete a category
     */
    async deleteCategory(categoryId) {
        return this.makeRequest(`/categories/${categoryId}`, {
            method: 'DELETE'
        });
    }

    // Utility Methods

    /**
     * Check if user has access to a document
     */
    async checkDocumentAccess(documentId) {
        try {
            await this.makeRequest(`/documents/${documentId}/access-check`);
            return true;
        } catch (error) {
            if (error.message.includes('403') || error.message.includes('401')) {
                return false;
            }
            throw error;
        }
    }

    /**
     * Get signed URL for direct file upload (for large files)
     */
    async getSignedUploadUrl(fileName, fileSize, contentType) {
        return this.makeRequest('/documents/signed-upload-url', {
            method: 'POST',
            body: JSON.stringify({
                fileName,
                fileSize,
                contentType
            })
        });
    }

    /**
     * Validate file before upload
     */
    async validateFile(file) {
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword',
            'application/vnd.ms-excel',
            'application/vnd.ms-powerpoint'
        ];

        const maxSize = 50 * 1024 * 1024; // 50MB

        if (!validTypes.includes(file.type)) {
            throw new Error(`File type ${file.type} is not supported`);
        }

        if (file.size > maxSize) {
            throw new Error(`File size ${file.size} exceeds maximum allowed size of ${maxSize} bytes`);
        }

        return true;
    }

    /**
     * Monitor upload progress
     */
    async uploadWithProgress(file, metadata, onProgress) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', metadata.category);
        formData.append('accessLevel', metadata.accessLevel);
        formData.append('description', metadata.description || '');
        formData.append('tags', JSON.stringify(metadata.tags || []));

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    if (onProgress) {
                        onProgress(percentComplete);
                    }
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        resolve(xhr.responseText);
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed due to network error'));
            });

            xhr.open('POST', `${this.baseUrl}/documents/upload`);
            xhr.setRequestHeader('Authorization', `Bearer ${this.authToken}`);
            xhr.send(formData);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataRoomAPI;
} else {
    window.DataRoomAPI = DataRoomAPI;
}
