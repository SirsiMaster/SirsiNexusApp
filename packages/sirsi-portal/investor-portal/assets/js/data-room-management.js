/**
 * Data Room Management System
 * Handles document upload, preview, search, categorization, access control, and version history
 */
class DataRoomManager {
    constructor() {
        console.log('Initializing DataRoomManager...');
        this.documents = this.loadDocuments();
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.selectedFiles = [];
        
        // Initialize sub-systems if available
        try {
            if (typeof AccessControlManager !== 'undefined') {
                this.accessControl = new AccessControlManager();
                console.log('AccessControlManager initialized');
            } else {
                console.warn('AccessControlManager not found');
            }
            
            if (typeof DocumentSearchEngine !== 'undefined') {
                this.searchEngine = new DocumentSearchEngine(this.documents);
                console.log('DocumentSearchEngine initialized');
            } else {
                console.warn('DocumentSearchEngine not found');
            }
        } catch (error) {
            console.error('Error initializing sub-systems:', error);
        }
        
        this.init();
        this.loadSampleData();
    }

    init() {
        this.bindEventListeners();
        this.renderDocuments();
        this.updateStatistics();
        this.setupDragAndDrop();
    }

    bindEventListeners() {
        // Upload button
        document.getElementById('uploadBtn').addEventListener('click', () => {
            this.openUploadModal();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderDocuments();
        });

        // Category filters
        document.querySelectorAll('.category-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                this.setActiveFilter(e.target);
                this.currentFilter = e.target.dataset.category;
                this.renderDocuments();
            });
        });

        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });

        // Upload button
        document.getElementById('uploadButton').addEventListener('click', () => {
            this.uploadDocuments();
        });
    }

    setupDragAndDrop() {
        const dropZone = document.getElementById('dropZone');
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.handleFileSelection(e.dataTransfer.files);
        });

        // Click to select files
        dropZone.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
    }

    setActiveFilter(activeButton) {
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active', 'bg-primary-100', 'dark:bg-primary-900', 'text-primary-700', 'dark:text-primary-300');
            btn.classList.add('bg-slate-100', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-300');
        });
        
        activeButton.classList.add('active', 'bg-primary-100', 'dark:bg-primary-900', 'text-primary-700', 'dark:text-primary-300');
        activeButton.classList.remove('bg-slate-100', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-300');
    }

    loadDocuments() {
        const saved = localStorage.getItem('sirsi_data_room_documents');
        return saved ? JSON.parse(saved) : [];
    }

    saveDocuments() {
        localStorage.setItem('sirsi_data_room_documents', JSON.stringify(this.documents));
    }

    async loadSampleData() {
        // Add some sample documents if none exist
        console.log('Loading sample data. Current documents:', this.documents.length);
        
        // First, try to load documents from config file
        try {
            const response = await fetch('assets/data-room-config.json');
            if (response.ok) {
                const config = await response.json();
                console.log('Loaded config:', config);
                
                // Convert config documents to the format we need
                const configDocs = [];
                let docId = 1;
                
                for (const [sectionKey, section] of Object.entries(config.sections)) {
                    if (section.files && Array.isArray(section.files)) {
                        for (const file of section.files) {
                            // Determine category based on section
                            let category = 'strategic';
                            if (sectionKey.includes('financial')) category = 'financial';
                            else if (sectionKey.includes('legal')) category = 'legal';
                            else if (sectionKey.includes('technical')) category = 'technical';
                            else if (sectionKey.includes('marketing')) category = 'marketing';
                            else if (sectionKey.includes('metrics')) category = 'operations';
                            
                            configDocs.push({
                                id: 'doc_config_' + docId++,
                                name: file.name,
                                category: category,
                                size: 1024 * 1024, // Default 1MB
                                type: 'text/html',
                                uploadDate: new Date().toISOString(),
                                lastModified: new Date().toISOString(),
                                description: file.description || '',
                                accessLevel: 'public',
                                version: 1,
                                versions: [{
                                    version: 1,
                                    date: new Date().toISOString(),
                                    uploadedBy: 'System',
                                    notes: 'Initial document'
                                }],
                                tags: [category, 'committee'],
                                downloadCount: 0,
                                isConfidential: false,
                                url: file.path // Use the path from config
                            });
                        }
                    }
                }
                
                if (configDocs.length > 0) {
                    this.documents = [...configDocs, ...this.documents];
                    this.saveDocuments();
                    console.log('Loaded documents from config:', configDocs.length);
                }
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }
        
        if (this.documents.length === 0) {
            console.log('No documents found, adding sample data...');
            const sampleDocs = [
                {
                    id: 'doc_1',
                    name: 'Financial Report Q4 2024.pdf',
                    category: 'financial',
                    size: 2458642,
                    type: 'application/pdf',
                    uploadDate: new Date('2024-12-15').toISOString(),
                    lastModified: new Date('2024-12-15').toISOString(),
                    description: 'Quarterly financial report with revenue, expenses, and projections',
                    accessLevel: 'restricted',
                    version: 1,
                    versions: [{
                        version: 1,
                        date: new Date('2024-12-15').toISOString(),
                        uploadedBy: 'CFO',
                        notes: 'Initial upload'
                    }],
                    tags: ['quarterly', 'revenue', 'financial'],
                    downloadCount: 15,
                    isConfidential: false,
                    url: 'documents/financial-report-q4-2024.pdf' // Direct URL for static file
                },
                {
                    id: 'doc_2',
                    name: 'Legal Compliance Framework.docx',
                    category: 'legal',
                    size: 1852963,
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    uploadDate: new Date('2024-12-10').toISOString(),
                    lastModified: new Date('2024-12-12').toISOString(),
                    description: 'Comprehensive legal compliance framework and policies',
                    accessLevel: 'confidential',
                    version: 2,
                    versions: [{
                        version: 1,
                        date: new Date('2024-12-10').toISOString(),
                        uploadedBy: 'Legal Team',
                        notes: 'Initial draft'
                    }, {
                        version: 2,
                        date: new Date('2024-12-12').toISOString(),
                        uploadedBy: 'Legal Team',
                        notes: 'Updated with new regulations'
                    }],
                    tags: ['compliance', 'legal', 'framework'],
                    downloadCount: 8,
                    isConfidential: true
                },
                {
                    id: 'doc_3',
                    name: 'Strategic Roadmap 2025.pptx',
                    category: 'strategic',
                    size: 8426793,
                    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    uploadDate: new Date('2024-12-08').toISOString(),
                    lastModified: new Date('2024-12-14').toISOString(),
                    description: 'Company strategic roadmap and objectives for 2025',
                    accessLevel: 'restricted',
                    version: 3,
                    versions: [{
                        version: 1,
                        date: new Date('2024-12-08').toISOString(),
                        uploadedBy: 'Strategy Team',
                        notes: 'Initial roadmap'
                    }, {
                        version: 2,
                        date: new Date('2024-12-11').toISOString(),
                        uploadedBy: 'Strategy Team',
                        notes: 'Added Q1 milestones'
                    }, {
                        version: 3,
                        date: new Date('2024-12-14').toISOString(),
                        uploadedBy: 'Strategy Team',
                        notes: 'Final version with stakeholder feedback'
                    }],
                    tags: ['strategy', '2025', 'roadmap', 'objectives'],
                    downloadCount: 23,
                    isConfidential: false
                },
                {
                    id: 'doc_4',
                    name: 'Technical Architecture Overview.pdf',
                    category: 'technical',
                    size: 4235682,
                    type: 'application/pdf',
                    uploadDate: new Date('2024-12-05').toISOString(),
                    lastModified: new Date('2024-12-05').toISOString(),
                    description: 'System architecture and technical specifications',
                    accessLevel: 'public',
                    version: 1,
                    versions: [{
                        version: 1,
                        date: new Date('2024-12-05').toISOString(),
                        uploadedBy: 'CTO',
                        notes: 'Initial technical overview'
                    }],
                    tags: ['architecture', 'technical', 'systems'],
                    downloadCount: 31,
                    isConfidential: false
                }
            ];

            this.documents = sampleDocs;
            this.saveDocuments();
            console.log('Sample data loaded successfully. Documents:', this.documents.length);
        } else {
            console.log('Documents already exist:', this.documents);
        }
    }

    renderDocuments() {
        const grid = document.getElementById('documentsGrid');
        const emptyState = document.getElementById('emptyState');
        
        let filteredDocs = this.documents;

        // Apply category filter
        if (this.currentFilter !== 'all') {
            filteredDocs = filteredDocs.filter(doc => doc.category === this.currentFilter);
        }

        // Apply search filter
        if (this.searchTerm) {
            filteredDocs = filteredDocs.filter(doc => 
                doc.name.toLowerCase().includes(this.searchTerm) ||
                doc.description.toLowerCase().includes(this.searchTerm) ||
                doc.tags.some(tag => tag.toLowerCase().includes(this.searchTerm))
            );
        }

        if (filteredDocs.length === 0) {
            grid.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        grid.classList.remove('hidden');
        emptyState.classList.add('hidden');

        grid.innerHTML = filteredDocs.map(doc => this.createDocumentCard(doc)).join('');
        
        // Re-initialize Lucide icons for new elements
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    createDocumentCard(doc) {
        const fileIcon = this.getFileIcon(doc.type);
        const categoryColor = this.getCategoryColor(doc.category);
        const accessBadge = this.getAccessBadge(doc.accessLevel);
        const formattedSize = this.formatFileSize(doc.size);
        const formattedDate = new Date(doc.uploadDate).toLocaleDateString();
        const hasVersions = doc.versions && doc.versions.length > 1;

        return `
            <div class="document-card bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 fade-in">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 ${categoryColor.bg} rounded-lg flex items-center justify-center">
                            <i data-lucide="${fileIcon}" class="w-6 h-6 ${categoryColor.text}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate" title="${doc.name}">
                                ${doc.name}
                            </h3>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-xs text-slate-500 dark:text-slate-400">${formattedSize}</span>
                                <span class="text-xs text-slate-400">•</span>
                                <span class="text-xs text-slate-500 dark:text-slate-400">${formattedDate}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        ${accessBadge}
                        ${hasVersions ? `<span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full">v${doc.version}</span>` : ''}
                    </div>
                </div>

                <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    ${doc.description}
                </p>

                <!-- Tags -->
                ${doc.tags && doc.tags.length > 0 ? `
                    <div class="flex flex-wrap gap-1 mb-4">
                        ${doc.tags.slice(0, 3).map(tag => `
                            <span class="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded">
                                #${tag}
                            </span>
                        `).join('')}
                        ${doc.tags.length > 3 ? `<span class="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded">+${doc.tags.length - 3}</span>` : ''}
                    </div>
                ` : ''}

                <!-- Stats -->
                <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <span class="flex items-center gap-1">
                        <i data-lucide="download" class="w-3 h-3"></i>
                        ${doc.downloadCount || 0} downloads
                    </span>
                    ${hasVersions ? `
                        <button onclick="window.dataRoom.showVersionHistory('${doc.id}')" class="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                            <i data-lucide="clock" class="w-3 h-3"></i>
                            ${doc.versions.length} versions
                        </button>
                    ` : ''}
                </div>

                <!-- Actions -->
                <div class="flex gap-2">
                    <button 
                        onclick="window.dataRoom.previewDocument('${doc.id}')" 
                        class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        <i data-lucide="eye" class="w-4 h-4"></i>
                        Preview
                    </button>
                    <button 
                        onclick="window.dataRoom.downloadDocument('${doc.id}')" 
                        class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <i data-lucide="download" class="w-4 h-4"></i>
                        Download
                    </button>
                </div>
            </div>
        `;
    }

    getFileIcon(type) {
        const iconMap = {
            'application/pdf': 'file-text',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-text',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file-spreadsheet',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
            'application/msword': 'file-text',
            'application/vnd.ms-excel': 'file-spreadsheet',
            'application/vnd.ms-powerpoint': 'presentation'
        };
        return iconMap[type] || 'file';
    }

    getCategoryColor(category) {
        const colorMap = {
            financial: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
            legal: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
            strategic: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400' },
            technical: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
            marketing: { bg: 'bg-pink-100 dark:bg-pink-900/20', text: 'text-pink-600 dark:text-pink-400' },
            operations: { bg: 'bg-indigo-100 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' }
        };
        return colorMap[category] || { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400' };
    }

    getAccessBadge(accessLevel) {
        const badges = {
            public: '<span class="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-full">Public</span>',
            restricted: '<span class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-xs rounded-full">Restricted</span>',
            confidential: '<span class="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-full">Confidential</span>'
        };
        return badges[accessLevel] || badges.public;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    updateStatistics() {
        const totalDocs = this.documents.length;
        const recentUploads = this.documents.filter(doc => {
            const uploadDate = new Date(doc.uploadDate);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return uploadDate > weekAgo;
        }).length;
        
        const totalSize = this.documents.reduce((sum, doc) => sum + doc.size, 0);

        document.getElementById('totalDocuments').textContent = totalDocs;
        document.getElementById('recentUploads').textContent = recentUploads;
        document.getElementById('totalSize').textContent = this.formatFileSize(totalSize);
    }

    // Modal Functions
    openUploadModal() {
        document.getElementById('uploadModal').classList.remove('hidden');
        this.resetUploadForm();
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    closeUploadModal() {
        document.getElementById('uploadModal').classList.add('hidden');
        this.selectedFiles = [];
        this.resetUploadForm();
    }

    resetUploadForm() {
        document.getElementById('fileInput').value = '';
        document.getElementById('fileList').classList.add('hidden');
        document.getElementById('fileList').innerHTML = '';
        document.getElementById('uploadProgress').classList.add('hidden');
        document.getElementById('documentCategory').value = 'financial';
        document.getElementById('accessLevel').value = 'public';
        document.getElementById('documentDescription').value = '';
        document.getElementById('uploadButton').disabled = false;
    }

    handleFileSelection(files) {
        this.selectedFiles = Array.from(files);
        this.displaySelectedFiles();
    }

    displaySelectedFiles() {
        const fileList = document.getElementById('fileList');
        const uploadButton = document.getElementById('uploadButton');

        if (this.selectedFiles.length === 0) {
            fileList.classList.add('hidden');
            uploadButton.disabled = true;
            return;
        }

        fileList.classList.remove('hidden');
        uploadButton.disabled = false;

        fileList.innerHTML = this.selectedFiles.map(file => `
            <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                        <i data-lucide="${this.getFileIcon(file.type)}" class="w-5 h-5 text-primary-600 dark:text-primary-400"></i>
                    </div>
                    <div>
                        <p class="font-medium text-sm text-slate-900 dark:text-slate-100">${file.name}</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400">${this.formatFileSize(file.size)}</p>
                    </div>
                </div>
                <button onclick="window.dataRoom.removeFile('${file.name}')" class="text-red-500 hover:text-red-700">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        `).join('');

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    removeFile(fileName) {
        this.selectedFiles = this.selectedFiles.filter(file => file.name !== fileName);
        this.displaySelectedFiles();
    }

    async uploadDocuments() {
        if (this.selectedFiles.length === 0) return;

        const uploadButton = document.getElementById('uploadButton');
        const progressContainer = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('progressBar');
        const statusText = document.getElementById('uploadStatus');

        uploadButton.disabled = true;
        progressContainer.classList.remove('hidden');

        const category = document.getElementById('documentCategory').value;
        const accessLevel = document.getElementById('accessLevel').value;
        const description = document.getElementById('documentDescription').value;

        for (let i = 0; i < this.selectedFiles.length; i++) {
            const file = this.selectedFiles[i];
            const progress = ((i + 1) / this.selectedFiles.length) * 100;

            statusText.textContent = `Uploading ${file.name}... (${i + 1}/${this.selectedFiles.length})`;
            progressBar.style.width = `${progress}%`;

            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create document entry
            const doc = {
                id: 'doc_' + Date.now() + '_' + i,
                name: file.name,
                category: category,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                description: description || `${category} document`,
                accessLevel: accessLevel,
                version: 1,
                versions: [{
                    version: 1,
                    date: new Date().toISOString(),
                    uploadedBy: 'Current User',
                    notes: 'Initial upload'
                }],
                tags: this.generateTags(file.name, category),
                downloadCount: 0,
                isConfidential: accessLevel === 'confidential',
                fileData: await this.fileToBase64(file) // Store file data for preview
            };

            this.documents.unshift(doc);
        }

        statusText.textContent = 'Upload completed successfully!';
        progressBar.style.width = '100%';

        // Save and refresh
        this.saveDocuments();
        this.updateStatistics();
        this.renderDocuments();

        // Close modal after delay
        setTimeout(() => {
            this.closeUploadModal();
            this.showNotification('Documents uploaded successfully!', 'success');
        }, 1500);
    }

    generateTags(fileName, category) {
        const tags = [category];
        const name = fileName.toLowerCase();
        
        if (name.includes('2024')) tags.push('2024');
        if (name.includes('2025')) tags.push('2025');
        if (name.includes('report')) tags.push('report');
        if (name.includes('analysis')) tags.push('analysis');
        if (name.includes('strategic') || name.includes('strategy')) tags.push('strategy');
        if (name.includes('financial') || name.includes('finance')) tags.push('finance');
        if (name.includes('legal')) tags.push('legal');
        if (name.includes('technical') || name.includes('tech')) tags.push('technical');
        
        return [...new Set(tags)];
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Document Actions
    previewDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return;

        const modal = document.getElementById('previewModal');
        const title = document.getElementById('previewTitle');
        const content = document.getElementById('previewContent');
        const downloadBtn = document.getElementById('downloadDocBtn');

        title.textContent = doc.name;
        downloadBtn.onclick = () => this.downloadDocument(docId);

        // Generate preview content
        content.innerHTML = this.generatePreviewContent(doc);

        modal.classList.remove('hidden');
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    generatePreviewContent(doc) {
        const categoryColor = this.getCategoryColor(doc.category);
        const accessBadge = this.getAccessBadge(doc.accessLevel);
        const formattedDate = new Date(doc.uploadDate).toLocaleDateString();
        const formattedSize = this.formatFileSize(doc.size);

        return `
            <div class="space-y-6">
                <!-- Document Info -->
                <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 ${categoryColor.bg} rounded-lg flex items-center justify-center">
                                <i data-lucide="${this.getFileIcon(doc.type)}" class="w-6 h-6 ${categoryColor.text}"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold text-slate-900 dark:text-slate-100">${doc.name}</h3>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-sm text-slate-500 dark:text-slate-400">${formattedSize}</span>
                                    <span class="text-sm text-slate-400">•</span>
                                    <span class="text-sm text-slate-500 dark:text-slate-400">${formattedDate}</span>
                                </div>
                            </div>
                        </div>
                        ${accessBadge}
                    </div>
                    
                    <p class="text-slate-600 dark:text-slate-400 mb-4">${doc.description}</p>
                    
                    ${doc.tags && doc.tags.length > 0 ? `
                        <div class="flex flex-wrap gap-2">
                            ${doc.tags.map(tag => `
                                <span class="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded">
                                    #${tag}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <!-- Preview Area -->
                <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg p-6 min-h-96">
                    ${doc.url && (doc.url.endsWith('.html') || doc.url.endsWith('.htm')) ? `
                        <iframe src="${doc.url}" class="w-full h-96 border-0 rounded-lg" title="${doc.name} Preview"></iframe>
                        <div class="mt-4 text-center">
                            <button onclick="window.dataRoom.printDocument('${doc.id}')" class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
                                <i data-lucide="printer" class="w-4 h-4 inline mr-2"></i>
                                Print / Save as PDF
                            </button>
                        </div>
                    ` : `
                        <div class="text-center py-12">
                            <div class="w-16 h-16 ${categoryColor.bg} rounded-xl flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="${this.getFileIcon(doc.type)}" class="w-8 h-8 ${categoryColor.text}"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Document Preview</h3>
                            <p class="text-slate-600 dark:text-slate-400 mb-4">
                                Preview functionality is available for this document type.
                            </p>
                            <div class="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                <p><strong>Type:</strong> ${doc.type}</p>
                                <p><strong>Category:</strong> ${doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}</p>
                                <p><strong>Access Level:</strong> ${doc.accessLevel.charAt(0).toUpperCase() + doc.accessLevel.slice(1)}</p>
                                <p><strong>Downloads:</strong> ${doc.downloadCount || 0}</p>
                            </div>
                        </div>
                    `}
                </div>

                <!-- Version History -->
                ${doc.versions && doc.versions.length > 1 ? `
                    <div class="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                        <h4 class="font-semibold text-slate-900 dark:text-slate-100 mb-3">Version History</h4>
                        <div class="space-y-3">
                            ${doc.versions.map(version => `
                                <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-600 rounded-lg">
                                    <div>
                                        <div class="font-medium text-sm">Version ${version.version}</div>
                                        <div class="text-xs text-slate-500 dark:text-slate-400">
                                            ${new Date(version.date).toLocaleDateString()} by ${version.uploadedBy}
                                        </div>
                                        <div class="text-xs text-slate-600 dark:text-slate-300 mt-1">${version.notes}</div>
                                    </div>
                                    <span class="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs rounded">
                                        ${version.version === doc.version ? 'Current' : 'Archived'}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    closePreviewModal() {
        document.getElementById('previewModal').classList.add('hidden');
    }

    downloadDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return;

        // Increment download count
        doc.downloadCount = (doc.downloadCount || 0) + 1;
        this.saveDocuments();
        this.renderDocuments();

        // Simulate file download
        this.showNotification(`Downloading ${doc.name}...`, 'info');
        
        // If it's an HTML file, open it in a new window for printing
        if (doc.url && (doc.url.endsWith('.html') || doc.url.endsWith('.htm'))) {
            window.open(doc.url, '_blank');
        } else {
            // In a real implementation, this would trigger actual file download
            console.log(`Downloading document: ${doc.name}`);
        }
    }

    printDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc || !doc.url) return;

        // Open the HTML file in a new window for printing
        const printWindow = window.open(doc.url, '_blank');
        
        if (printWindow) {
            printWindow.onload = function() {
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            };
        }
        
        this.showNotification('Opening document for printing. Use your browser\'s print dialog to save as PDF.', 'info');
    }

    showVersionHistory(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc || !doc.versions || doc.versions.length <= 1) return;

        // This would open a version history modal
        this.showNotification(`Version history for ${doc.name}`, 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global functions for modal management
window.closeUploadModal = function() {
    if (window.dataRoom) {
        window.dataRoom.closeUploadModal();
    }
};

window.closePreviewModal = function() {
    if (window.dataRoom) {
        window.dataRoom.closePreviewModal();
    }
};
