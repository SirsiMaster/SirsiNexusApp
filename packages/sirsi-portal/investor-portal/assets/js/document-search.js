/**
 * Document Search Engine
 * Handles advanced search functionality for documents
 * Including content search, metadata search, and search within documents
 */
class DocumentSearchEngine {
    constructor(documents = []) {
        this.documents = documents;
        this.searchIndex = this.buildSearchIndex();
        this.stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
            'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
            'before', 'after', 'above', 'below', 'between', 'among', 'throughout',
            'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'us',
            'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
            'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its',
            'itself', 'they', 'them', 'their', 'theirs', 'themselves'
        ]);
    }

    /**
     * Update documents and rebuild search index
     */
    updateDocuments(documents) {
        this.documents = documents;
        this.searchIndex = this.buildSearchIndex();
    }

    /**
     * Build a search index for faster searching
     */
    buildSearchIndex() {
        const index = new Map();

        this.documents.forEach(doc => {
            const searchableText = this.extractSearchableText(doc);
            const words = this.tokenize(searchableText);

            words.forEach(word => {
                if (!index.has(word)) {
                    index.set(word, new Set());
                }
                index.get(word).add(doc.id);
            });
        });

        return index;
    }

    /**
     * Extract searchable text from document metadata
     */
    extractSearchableText(document) {
        const parts = [
            document.name,
            document.description || '',
            document.category || '',
            ...(document.tags || []),
            document.type || '',
            // Add content if available (would be extracted from actual file in real implementation)
            document.extractedContent || ''
        ];

        return parts.join(' ').toLowerCase();
    }

    /**
     * Tokenize text into searchable words
     */
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !this.stopWords.has(word))
            .map(word => this.stemWord(word));
    }

    /**
     * Simple stemming algorithm
     */
    stemWord(word) {
        // Simple suffix removal
        const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'ness', 'ment'];
        
        for (const suffix of suffixes) {
            if (word.endsWith(suffix) && word.length > suffix.length + 2) {
                return word.slice(0, -suffix.length);
            }
        }
        
        return word;
    }

    /**
     * Perform basic text search
     */
    basicSearch(query, options = {}) {
        if (!query || query.trim().length === 0) {
            return this.documents;
        }

        const searchTerms = this.tokenize(query);
        const results = new Map();

        // Find documents containing search terms
        searchTerms.forEach(term => {
            if (this.searchIndex.has(term)) {
                this.searchIndex.get(term).forEach(docId => {
                    if (!results.has(docId)) {
                        results.set(docId, { score: 0, matches: [] });
                    }
                    results.get(docId).score += 1;
                    results.get(docId).matches.push(term);
                });
            }
        });

        // Get matching documents with scores
        let matchingDocs = Array.from(results.entries())
            .map(([docId, data]) => {
                const doc = this.documents.find(d => d.id === docId);
                return {
                    ...doc,
                    searchScore: data.score,
                    matchedTerms: data.matches,
                    relevanceScore: this.calculateRelevanceScore(doc, query, data.score)
                };
            })
            .filter(doc => doc !== undefined);

        // Apply filters
        if (options.category) {
            matchingDocs = matchingDocs.filter(doc => doc.category === options.category);
        }

        if (options.accessLevel) {
            matchingDocs = matchingDocs.filter(doc => doc.accessLevel === options.accessLevel);
        }

        if (options.dateRange) {
            matchingDocs = matchingDocs.filter(doc => {
                const docDate = new Date(doc.uploadDate);
                return docDate >= options.dateRange.start && docDate <= options.dateRange.end;
            });
        }

        // Sort by relevance score
        matchingDocs.sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Apply pagination
        const limit = options.limit || 50;
        const offset = options.offset || 0;

        return {
            documents: matchingDocs.slice(offset, offset + limit),
            totalCount: matchingDocs.length,
            searchTerms: searchTerms,
            hasMore: matchingDocs.length > offset + limit
        };
    }

    /**
     * Calculate relevance score for search results
     */
    calculateRelevanceScore(document, originalQuery, termMatches) {
        let score = termMatches * 10; // Base score from term matches

        // Boost score for matches in title
        if (document.name.toLowerCase().includes(originalQuery.toLowerCase())) {
            score += 50;
        }

        // Boost score for matches in description
        if (document.description && document.description.toLowerCase().includes(originalQuery.toLowerCase())) {
            score += 20;
        }

        // Boost score for exact tag matches
        if (document.tags) {
            document.tags.forEach(tag => {
                if (tag.toLowerCase().includes(originalQuery.toLowerCase())) {
                    score += 30;
                }
            });
        }

        // Boost score for recent documents
        const daysSinceUpload = (Date.now() - new Date(document.uploadDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceUpload < 30) {
            score += 10;
        }

        // Boost score for frequently accessed documents
        if (document.downloadCount > 10) {
            score += 5;
        }

        return score;
    }

    /**
     * Advanced search with multiple criteria
     */
    advancedSearch(criteria) {
        let results = this.documents;

        // Text search
        if (criteria.query) {
            const textResults = this.basicSearch(criteria.query, criteria);
            results = textResults.documents;
        }

        // Category filter
        if (criteria.categories && criteria.categories.length > 0) {
            results = results.filter(doc => criteria.categories.includes(doc.category));
        }

        // Access level filter
        if (criteria.accessLevels && criteria.accessLevels.length > 0) {
            results = results.filter(doc => criteria.accessLevels.includes(doc.accessLevel));
        }

        // File type filter
        if (criteria.fileTypes && criteria.fileTypes.length > 0) {
            results = results.filter(doc => criteria.fileTypes.includes(doc.type));
        }

        // Date range filter
        if (criteria.dateRange) {
            results = results.filter(doc => {
                const docDate = new Date(doc.uploadDate);
                const startDate = new Date(criteria.dateRange.start);
                const endDate = new Date(criteria.dateRange.end);
                return docDate >= startDate && docDate <= endDate;
            });
        }

        // Size range filter
        if (criteria.sizeRange) {
            results = results.filter(doc => {
                return doc.size >= criteria.sizeRange.min && doc.size <= criteria.sizeRange.max;
            });
        }

        // Tag filter
        if (criteria.tags && criteria.tags.length > 0) {
            results = results.filter(doc => {
                if (!doc.tags) return false;
                return criteria.tags.some(tag => 
                    doc.tags.some(docTag => 
                        docTag.toLowerCase().includes(tag.toLowerCase())
                    )
                );
            });
        }

        // Sort results
        if (criteria.sortBy) {
            results = this.sortResults(results, criteria.sortBy, criteria.sortOrder || 'desc');
        }

        return {
            documents: results,
            totalCount: results.length,
            appliedFilters: criteria
        };
    }

    /**
     * Sort search results
     */
    sortResults(documents, sortBy, sortOrder = 'desc') {
        const sortFunctions = {
            relevance: (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0),
            name: (a, b) => a.name.localeCompare(b.name),
            date: (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate),
            size: (a, b) => b.size - a.size,
            downloads: (a, b) => (b.downloadCount || 0) - (a.downloadCount || 0),
            category: (a, b) => a.category.localeCompare(b.category)
        };

        if (sortFunctions[sortBy]) {
            documents.sort(sortFunctions[sortBy]);
            
            if (sortOrder === 'asc') {
                documents.reverse();
            }
        }

        return documents;
    }

    /**
     * Search within a specific document's content
     */
    searchWithinDocument(documentId, query) {
        const document = this.documents.find(d => d.id === documentId);
        if (!document) {
            return { found: false, message: 'Document not found' };
        }

        // In a real implementation, this would search the actual document content
        // For now, we'll simulate content search
        const searchableContent = document.extractedContent || document.description || '';
        const queryLower = query.toLowerCase();
        
        if (searchableContent.toLowerCase().includes(queryLower)) {
            // Find all occurrences and their context
            const matches = this.findMatches(searchableContent, query);
            
            return {
                found: true,
                document: document,
                query: query,
                matches: matches,
                totalMatches: matches.length
            };
        }

        return {
            found: false,
            document: document,
            query: query,
            matches: [],
            totalMatches: 0
        };
    }

    /**
     * Find all matches of a query in text with context
     */
    findMatches(text, query, contextLength = 100) {
        const matches = [];
        const queryLower = query.toLowerCase();
        const textLower = text.toLowerCase();
        
        let searchIndex = 0;
        while (true) {
            const index = textLower.indexOf(queryLower, searchIndex);
            if (index === -1) break;
            
            const start = Math.max(0, index - contextLength);
            const end = Math.min(text.length, index + query.length + contextLength);
            const context = text.substring(start, end);
            
            matches.push({
                index: index,
                context: context,
                beforeMatch: text.substring(start, index),
                match: text.substring(index, index + query.length),
                afterMatch: text.substring(index + query.length, end)
            });
            
            searchIndex = index + 1;
        }
        
        return matches;
    }

    /**
     * Get search suggestions based on partial query
     */
    getSuggestions(partialQuery, maxSuggestions = 5) {
        if (!partialQuery || partialQuery.length < 2) {
            return [];
        }

        const suggestions = new Set();
        const queryLower = partialQuery.toLowerCase();

        // Search in document names
        this.documents.forEach(doc => {
            const words = doc.name.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.startsWith(queryLower) && word.length > queryLower.length) {
                    suggestions.add(word);
                }
            });
        });

        // Search in tags
        this.documents.forEach(doc => {
            if (doc.tags) {
                doc.tags.forEach(tag => {
                    if (tag.toLowerCase().startsWith(queryLower)) {
                        suggestions.add(tag);
                    }
                });
            }
        });

        // Search in categories
        this.documents.forEach(doc => {
            if (doc.category && doc.category.toLowerCase().startsWith(queryLower)) {
                suggestions.add(doc.category);
            }
        });

        return Array.from(suggestions).slice(0, maxSuggestions);
    }

    /**
     * Get popular search terms
     */
    getPopularSearchTerms() {
        const termCounts = new Map();

        // Count word frequency across all documents
        this.documents.forEach(doc => {
            const words = this.tokenize(this.extractSearchableText(doc));
            words.forEach(word => {
                termCounts.set(word, (termCounts.get(word) || 0) + 1);
            });
        });

        // Sort by frequency and return top terms
        return Array.from(termCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([term, count]) => ({ term, count }));
    }

    /**
     * Highlight search terms in text
     */
    highlightSearchTerms(text, searchTerms, highlightClass = 'search-highlight') {
        let highlightedText = text;
        
        searchTerms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlightedText = highlightedText.replace(
                regex, 
                `<span class="${highlightClass}">$1</span>`
            );
        });
        
        return highlightedText;
    }

    /**
     * Export search results to various formats
     */
    exportSearchResults(results, format = 'json') {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(results, null, 2);
            
            case 'csv':
                return this.convertToCSV(results.documents);
            
            case 'text':
                return this.convertToText(results.documents);
            
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Convert results to CSV format
     */
    convertToCSV(documents) {
        const headers = ['Name', 'Category', 'Size', 'Upload Date', 'Access Level', 'Downloads'];
        const rows = documents.map(doc => [
            doc.name,
            doc.category,
            doc.size,
            doc.uploadDate,
            doc.accessLevel,
            doc.downloadCount || 0
        ]);

        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    /**
     * Convert results to plain text format
     */
    convertToText(documents) {
        return documents.map(doc => {
            return [
                `Name: ${doc.name}`,
                `Category: ${doc.category}`,
                `Size: ${this.formatFileSize(doc.size)}`,
                `Upload Date: ${new Date(doc.uploadDate).toLocaleDateString()}`,
                `Access Level: ${doc.accessLevel}`,
                `Downloads: ${doc.downloadCount || 0}`,
                `Description: ${doc.description || 'No description'}`,
                '---'
            ].join('\n');
        }).join('\n\n');
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentSearchEngine;
} else {
    window.DocumentSearchEngine = DocumentSearchEngine;
}
