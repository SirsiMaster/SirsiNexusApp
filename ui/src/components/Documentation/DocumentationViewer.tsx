import React, { useState, useEffect } from 'react';
import { FileText, Book, Search, ExternalLink, Download } from 'lucide-react';

interface DocumentationFile {
  path: string;
  title: string;
  category: string;
  content?: string;
  lastModified: string;
}

interface DocumentationViewerProps {
  aiMode?: boolean; // Enable AI assistant mode for comprehensive access
}

export default function DocumentationViewer({ aiMode = false }: DocumentationViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentationFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Documentation index for AI assistant consumption
  const documentationIndex: DocumentationFile[] = [
    // Core Documentation
    { path: '/docs/core/ARCHITECTURE.md', title: 'System Architecture', category: 'core', lastModified: '2025-01-06' },
    { path: '/docs/core/PLATFORM_ARCHITECTURE.md', title: 'Platform Architecture', category: 'core', lastModified: '2025-01-06' },
    { path: '/docs/core/PROJECT_TRACKER.md', title: 'Project Tracker', category: 'core', lastModified: '2025-01-06' },
    { path: '/docs/core/CHANGELOG.md', title: 'Change Log', category: 'core', lastModified: '2025-01-06' },
    { path: '/docs/core/PRODUCTION_READY.md', title: 'Production Ready', category: 'core', lastModified: '2025-01-06' },
    { path: '/docs/core/COMPREHENSIVE_DEVELOPMENT_BLUEPRINT.md', title: 'Development Blueprint', category: 'core', lastModified: '2025-01-06' },
    { path: '/docs/core/RESUMPTION_PROMPT.md', title: 'Resumption Context', category: 'core', lastModified: '2025-01-06' },
    
    // Phase Documentation
    { path: '/docs/core/PHASE_2_PLUS_COMPLETE.md', title: 'Phase 2+ Completion', category: 'phases', lastModified: '2025-01-06' },
    { path: '/docs/core/PHASE_3_COMPLETION_SUMMARY.md', title: 'Phase 3 Completion', category: 'phases', lastModified: '2025-01-06' },
    { path: '/docs/core/PHASE_3_AI_ORCHESTRATION.md', title: 'Phase 3 AI Orchestration', category: 'phases', lastModified: '2025-01-06' },
    { path: '/docs/core/PHASE_4_AI_ENHANCEMENT.md', title: 'Phase 4 AI Enhancement', category: 'phases', lastModified: '2025-01-06' },
    { path: '/docs/core/PHASE_4_OBSERVABILITY.md', title: 'Phase 4 Observability', category: 'phases', lastModified: '2025-01-06' },
    
    // User Guides
    { path: '/docs/user-guides/DEPLOYMENT_GUIDE.md', title: 'Deployment Guide', category: 'user-guides', lastModified: '2025-01-06' },
    { path: '/docs/user-guides/DEVELOPMENT_GUIDE.md', title: 'Development Guide', category: 'user-guides', lastModified: '2025-01-06' },
    { path: '/docs/user-guides/DATABASE_SETUP.md', title: 'Database Setup', category: 'user-guides', lastModified: '2025-01-06' },
    { path: '/docs/user-guides/EXECUTABLE_GUIDE.md', title: 'Executable Guide', category: 'user-guides', lastModified: '2025-01-06' },
    { path: '/docs/user-guides/INFRASTRUCTURE_BUILDER.md', title: 'Infrastructure Builder', category: 'user-guides', lastModified: '2025-01-06' },
    { path: '/docs/user-guides/KUBERNETES_DEPLOYMENT_SUMMARY.md', title: 'Kubernetes Deployment', category: 'user-guides', lastModified: '2025-01-06' },
    
    // Technical Reference
    { path: '/docs/technical-reference/INFRASTRUCTURE_BUILDER_IMPLEMENTATION.md', title: 'Infrastructure Builder Implementation', category: 'technical', lastModified: '2025-01-06' },
    { path: '/docs/technical-reference/INTEGRATION_VERIFICATION.md', title: 'Integration Verification', category: 'technical', lastModified: '2025-01-06' },
    { path: '/docs/technical-reference/CLAUDE_INTEGRATION.md', title: 'Claude Integration', category: 'technical', lastModified: '2025-01-06' },
    { path: '/docs/technical-reference/TEST_VALIDATION_REPORT.md', title: 'Test Validation Report', category: 'technical', lastModified: '2025-01-06' },
    { path: '/docs/technical-reference/BACKEND_INTEGRATION_COMPLETE.md', title: 'Backend Integration', category: 'technical', lastModified: '2025-01-06' },
    { path: '/docs/technical-reference/CDB_COMPLIANCE_ASSESSMENT.md', title: 'Compliance Assessment', category: 'technical', lastModified: '2025-01-06' },
    
    // FAQ & Troubleshooting
    { path: '/docs/faq/CRITICAL_ERRORS_RESOLVED.md', title: 'Critical Errors Resolved', category: 'faq', lastModified: '2025-01-06' },
    { path: '/docs/faq/DOCUMENTATION_CLEANUP_SUMMARY.md', title: 'Documentation Cleanup', category: 'faq', lastModified: '2025-01-06' },
    
    // AI Assistant Index
    { path: '/docs/AI_ASSISTANT_DOCUMENTATION_INDEX.md', title: 'AI Assistant Documentation Index', category: 'ai-assistant', lastModified: '2025-01-06' },
  ];

  const categories = [
    { id: 'all', name: 'All Documentation', count: documentationIndex.length },
    { id: 'core', name: 'Core', count: documentationIndex.filter(d => d.category === 'core').length },
    { id: 'phases', name: 'Phase Development', count: documentationIndex.filter(d => d.category === 'phases').length },
    { id: 'user-guides', name: 'User Guides', count: documentationIndex.filter(d => d.category === 'user-guides').length },
    { id: 'technical', name: 'Technical Reference', count: documentationIndex.filter(d => d.category === 'technical').length },
    { id: 'faq', name: 'FAQ & Troubleshooting', count: documentationIndex.filter(d => d.category === 'faq').length },
    { id: 'ai-assistant', name: 'AI Assistant', count: documentationIndex.filter(d => d.category === 'ai-assistant').length },
  ];

  const filteredDocs = documentationIndex.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const loadDocumentContent = async (doc: DocumentationFile) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from the server
      // For now, we'll simulate loading
      const content = `# ${doc.title}\n\nThis is the content for ${doc.title}.\n\nDocumentation path: ${doc.path}`;
      setSelectedDoc({ ...doc, content });
    } catch (error) {
      console.error('Failed to load document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                SirsiNexus Documentation
                {aiMode && <span className="text-blue-600 ml-2">(AI Assistant Mode)</span>}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Comprehensive platform documentation and technical reference
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="h-4 w-4" />
                Export All
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <ExternalLink className="h-4 w-4" />
                GitHub Docs
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Categories</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Document List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Documents</h3>
              <ul className="space-y-2 max-h-96 overflow-y-auto">
                {filteredDocs.map((doc, index) => (
                  <li key={index}>
                    <button
                      onClick={() => loadDocumentContent(doc)}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                        selectedDoc?.path === doc.path
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">{doc.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{doc.path}</div>
                        <div className="text-xs text-gray-400">{doc.lastModified}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              {selectedDoc ? (
                <div>
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedDoc.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Category: {selectedDoc.category}</span>
                      <span>•</span>
                      <span>Last modified: {selectedDoc.lastModified}</span>
                      <span>•</span>
                      <span>{selectedDoc.path}</span>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">Loading document...</span>
                    </div>
                  ) : (
                    <div className="prose prose-lg max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed">
                        {selectedDoc.content}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Welcome to SirsiNexus Documentation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Select a document from the sidebar to view its contents.
                  </p>
                  {aiMode && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-blue-800 dark:text-blue-300 text-sm">
                        <strong>AI Assistant Mode:</strong> This interface provides comprehensive access 
                        to all SirsiNexus documentation for contextual AI responses.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
