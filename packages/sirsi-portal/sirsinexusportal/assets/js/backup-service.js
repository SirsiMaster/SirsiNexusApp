/**
 * Backup and Recovery Service
 * Automated backup system for Firestore data with recovery procedures
 */

class BackupService {
    constructor() {
        this.db = null;
        this.storage = null;
        this.functions = null;
        
        this.config = {
            enabled: true,
            autoBackup: true,
            backupInterval: 24 * 60 * 60 * 1000, // 24 hours
            maxBackups: 30,
            compressionEnabled: true,
            encryptionEnabled: true,
            collections: [
                'users',
                'content',
                'payments',
                'subscriptions',
                'emailLogs',
                'analytics',
                'settings',
                'audit'
            ]
        };
        
        this.backupStatus = {
            lastBackup: null,
            nextBackup: null,
            inProgress: false,
            history: []
        };
        
        this.init();
    }
    
    init() {
        if (typeof firebase !== 'undefined') {
            if (firebase.firestore) {
                this.db = firebase.firestore();
            }
            if (firebase.storage) {
                this.storage = firebase.storage();
            }
            if (firebase.functions) {
                this.functions = firebase.functions();
            }
            
            console.log('[Backup Service] Initialized');
            
            // Load backup status
            this.loadBackupStatus();
            
            // Schedule automatic backups
            if (this.config.autoBackup) {
                this.scheduleAutoBackup();
            }
        } else {
            console.warn('[Backup Service] Firebase not available');
        }
    }
    
    /**
     * Perform full backup
     */
    async performFullBackup(manual = false) {
        if (this.backupStatus.inProgress) {
            console.warn('[Backup Service] Backup already in progress');
            return { success: false, error: 'Backup already in progress' };
        }
        
        this.backupStatus.inProgress = true;
        const backupId = this.generateBackupId();
        const timestamp = Date.now();
        
        console.log(`[Backup Service] Starting ${manual ? 'manual' : 'automatic'} backup ${backupId}`);
        
        try {
            const backup = {
                id: backupId,
                timestamp: timestamp,
                type: manual ? 'manual' : 'automatic',
                collections: {},
                metadata: {
                    version: '1.0.0',
                    environment: this.detectEnvironment(),
                    compressed: this.config.compressionEnabled,
                    encrypted: this.config.encryptionEnabled
                }
            };
            
            // Backup each collection
            for (const collection of this.config.collections) {
                try {
                    const data = await this.backupCollection(collection);
                    backup.collections[collection] = data;
                    console.log(`[Backup Service] Backed up ${collection}: ${data.count} documents`);
                } catch (error) {
                    console.error(`[Backup Service] Failed to backup ${collection}:`, error);
                    backup.collections[collection] = { error: error.message, count: 0 };
                }
            }
            
            // Calculate backup size
            const backupSize = JSON.stringify(backup).length;
            backup.metadata.size = backupSize;
            
            // Compress if enabled
            let backupData = backup;
            if (this.config.compressionEnabled) {
                backupData = await this.compressData(backup);
            }
            
            // Encrypt if enabled
            if (this.config.encryptionEnabled) {
                backupData = await this.encryptData(backupData);
            }
            
            // Store backup
            const stored = await this.storeBackup(backupId, backupData);
            
            // Update status
            this.backupStatus.lastBackup = timestamp;
            this.backupStatus.inProgress = false;
            this.backupStatus.history.unshift({
                id: backupId,
                timestamp: timestamp,
                type: backup.type,
                size: backupSize,
                status: 'success',
                location: stored.location
            });
            
            // Trim history
            if (this.backupStatus.history.length > this.config.maxBackups) {
                const oldBackups = this.backupStatus.history.splice(this.config.maxBackups);
                await this.deleteOldBackups(oldBackups);
            }
            
            // Save status
            this.saveBackupStatus();
            
            // Log to Firestore
            await this.logBackup(backup);
            
            console.log(`[Backup Service] Backup ${backupId} completed successfully`);
            
            return {
                success: true,
                backupId: backupId,
                size: backupSize,
                location: stored.location
            };
            
        } catch (error) {
            console.error('[Backup Service] Backup failed:', error);
            
            this.backupStatus.inProgress = false;
            this.backupStatus.history.unshift({
                id: backupId,
                timestamp: timestamp,
                type: manual ? 'manual' : 'automatic',
                status: 'failed',
                error: error.message
            });
            
            this.saveBackupStatus();
            
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Backup a single collection
     */
    async backupCollection(collectionName) {
        if (!this.db) throw new Error('Firestore not available');
        
        const documents = [];
        const snapshot = await this.db.collection(collectionName).get();
        
        snapshot.forEach(doc => {
            documents.push({
                id: doc.id,
                data: doc.data(),
                metadata: {
                    createTime: doc.createTime?.toMillis(),
                    updateTime: doc.updateTime?.toMillis()
                }
            });
        });
        
        return {
            name: collectionName,
            count: documents.length,
            documents: documents,
            backedUpAt: Date.now()
        };
    }
    
    /**
     * Restore from backup
     */
    async restoreFromBackup(backupId, options = {}) {
        const {
            collections = null, // Specific collections to restore
            overwrite = false,  // Overwrite existing data
            dryRun = false      // Test restore without applying
        } = options;
        
        console.log(`[Backup Service] Starting restore from backup ${backupId}`);
        
        try {
            // Retrieve backup
            const backupData = await this.retrieveBackup(backupId);
            
            // Decrypt if needed
            let backup = backupData;
            if (backup.metadata?.encrypted) {
                backup = await this.decryptData(backupData);
            }
            
            // Decompress if needed
            if (backup.metadata?.compressed) {
                backup = await this.decompressData(backup);
            }
            
            const restoreReport = {
                backupId: backupId,
                timestamp: Date.now(),
                collections: {},
                dryRun: dryRun
            };
            
            // Determine which collections to restore
            const collectionsToRestore = collections || Object.keys(backup.collections);
            
            for (const collectionName of collectionsToRestore) {
                const collectionData = backup.collections[collectionName];
                
                if (!collectionData || collectionData.error) {
                    restoreReport.collections[collectionName] = {
                        status: 'skipped',
                        reason: collectionData?.error || 'No data'
                    };
                    continue;
                }
                
                if (dryRun) {
                    restoreReport.collections[collectionName] = {
                        status: 'dry-run',
                        documentsToRestore: collectionData.count
                    };
                } else {
                    const result = await this.restoreCollection(
                        collectionName,
                        collectionData,
                        overwrite
                    );
                    restoreReport.collections[collectionName] = result;
                }
            }
            
            // Log restore operation
            if (!dryRun) {
                await this.logRestore(restoreReport);
            }
            
            console.log('[Backup Service] Restore completed', restoreReport);
            
            return {
                success: true,
                report: restoreReport
            };
            
        } catch (error) {
            console.error('[Backup Service] Restore failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Restore a single collection
     */
    async restoreCollection(collectionName, collectionData, overwrite) {
        if (!this.db) throw new Error('Firestore not available');
        
        const result = {
            restored: 0,
            skipped: 0,
            failed: 0,
            errors: []
        };
        
        const batch = this.db.batch();
        let batchCount = 0;
        const batchLimit = 500;
        
        for (const doc of collectionData.documents) {
            try {
                const docRef = this.db.collection(collectionName).doc(doc.id);
                
                // Check if document exists
                if (!overwrite) {
                    const existing = await docRef.get();
                    if (existing.exists) {
                        result.skipped++;
                        continue;
                    }
                }
                
                // Add to batch
                batch.set(docRef, doc.data, { merge: !overwrite });
                batchCount++;
                result.restored++;
                
                // Commit batch if limit reached
                if (batchCount >= batchLimit) {
                    await batch.commit();
                    batchCount = 0;
                }
                
            } catch (error) {
                result.failed++;
                result.errors.push({
                    docId: doc.id,
                    error: error.message
                });
            }
        }
        
        // Commit remaining batch
        if (batchCount > 0) {
            await batch.commit();
        }
        
        return result;
    }
    
    /**
     * Store backup to Firebase Storage
     */
    async storeBackup(backupId, data) {
        if (!this.storage) {
            // Fallback to localStorage for demo
            localStorage.setItem(`backup_${backupId}`, JSON.stringify(data));
            return { location: 'localStorage' };
        }
        
        const fileName = `backups/${backupId}.json`;
        const storageRef = this.storage.ref(fileName);
        
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const snapshot = await storageRef.put(blob);
        const downloadUrl = await snapshot.ref.getDownloadURL();
        
        return {
            location: 'firebase-storage',
            path: fileName,
            url: downloadUrl
        };
    }
    
    /**
     * Retrieve backup from storage
     */
    async retrieveBackup(backupId) {
        if (!this.storage) {
            // Fallback to localStorage
            const data = localStorage.getItem(`backup_${backupId}`);
            if (data) {
                return JSON.parse(data);
            }
            throw new Error('Backup not found');
        }
        
        const fileName = `backups/${backupId}.json`;
        const storageRef = this.storage.ref(fileName);
        
        const url = await storageRef.getDownloadURL();
        const response = await fetch(url);
        return await response.json();
    }
    
    /**
     * Delete old backups
     */
    async deleteOldBackups(backups) {
        for (const backup of backups) {
            try {
                if (this.storage) {
                    const fileName = `backups/${backup.id}.json`;
                    await this.storage.ref(fileName).delete();
                } else {
                    localStorage.removeItem(`backup_${backup.id}`);
                }
                console.log(`[Backup Service] Deleted old backup ${backup.id}`);
            } catch (error) {
                console.error(`[Backup Service] Failed to delete backup ${backup.id}:`, error);
            }
        }
    }
    
    /**
     * Schedule automatic backup
     */
    scheduleAutoBackup() {
        // Calculate next backup time
        const lastBackup = this.backupStatus.lastBackup || 0;
        const nextBackup = lastBackup + this.config.backupInterval;
        const now = Date.now();
        
        let delay = nextBackup - now;
        if (delay < 0) {
            delay = 60000; // Run in 1 minute if overdue
        }
        
        this.backupStatus.nextBackup = now + delay;
        
        console.log(`[Backup Service] Next backup scheduled in ${Math.round(delay / 60000)} minutes`);
        
        setTimeout(() => {
            this.performFullBackup(false);
            this.scheduleAutoBackup(); // Reschedule
        }, delay);
    }
    
    /**
     * Export backup to file
     */
    async exportBackup(backupId) {
        try {
            const backup = await this.retrieveBackup(backupId);
            
            const blob = new Blob([JSON.stringify(backup, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${backupId}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            return { success: true };
        } catch (error) {
            console.error('[Backup Service] Export failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Import backup from file
     */
    async importBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    // Validate backup structure
                    if (!backup.id || !backup.collections) {
                        throw new Error('Invalid backup format');
                    }
                    
                    // Store imported backup
                    await this.storeBackup(backup.id, backup);
                    
                    // Add to history
                    this.backupStatus.history.unshift({
                        id: backup.id,
                        timestamp: backup.timestamp,
                        type: 'imported',
                        status: 'success'
                    });
                    
                    this.saveBackupStatus();
                    
                    resolve({
                        success: true,
                        backupId: backup.id
                    });
                } catch (error) {
                    reject({
                        success: false,
                        error: error.message
                    });
                }
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * Compress data
     */
    async compressData(data) {
        // Simple compression using LZ-string (would need library in production)
        // For now, just return data with compression flag
        return {
            compressed: true,
            data: JSON.stringify(data)
        };
    }
    
    /**
     * Decompress data
     */
    async decompressData(compressedData) {
        if (compressedData.compressed) {
            return JSON.parse(compressedData.data);
        }
        return compressedData;
    }
    
    /**
     * Encrypt data
     */
    async encryptData(data) {
        // Simple encryption placeholder (use proper encryption in production)
        return {
            encrypted: true,
            data: btoa(JSON.stringify(data))
        };
    }
    
    /**
     * Decrypt data
     */
    async decryptData(encryptedData) {
        if (encryptedData.encrypted) {
            return JSON.parse(atob(encryptedData.data));
        }
        return encryptedData;
    }
    
    /**
     * Generate backup ID
     */
    generateBackupId() {
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const time = Date.now().toString(36);
        return `backup_${date}_${time}`;
    }
    
    /**
     * Detect environment
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost') return 'development';
        if (hostname.includes('staging')) return 'staging';
        return 'production';
    }
    
    /**
     * Load backup status
     */
    loadBackupStatus() {
        try {
            const stored = localStorage.getItem('backupStatus');
            if (stored) {
                this.backupStatus = JSON.parse(stored);
                console.log('[Backup Service] Loaded backup status');
            }
        } catch (error) {
            console.error('[Backup Service] Failed to load status:', error);
        }
    }
    
    /**
     * Save backup status
     */
    saveBackupStatus() {
        try {
            localStorage.setItem('backupStatus', JSON.stringify(this.backupStatus));
        } catch (error) {
            console.error('[Backup Service] Failed to save status:', error);
        }
    }
    
    /**
     * Log backup operation
     */
    async logBackup(backup) {
        if (!this.db) return;
        
        try {
            await this.db.collection('backupLogs').add({
                backupId: backup.id,
                timestamp: backup.timestamp,
                type: backup.type,
                collections: Object.keys(backup.collections),
                metadata: backup.metadata,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('[Backup Service] Failed to log backup:', error);
        }
    }
    
    /**
     * Log restore operation
     */
    async logRestore(restoreReport) {
        if (!this.db) return;
        
        try {
            await this.db.collection('restoreLogs').add({
                ...restoreReport,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('[Backup Service] Failed to log restore:', error);
        }
    }
    
    /**
     * Get backup history
     */
    getHistory() {
        return this.backupStatus.history;
    }
    
    /**
     * Get backup statistics
     */
    getStatistics() {
        const history = this.backupStatus.history;
        const successful = history.filter(b => b.status === 'success').length;
        const failed = history.filter(b => b.status === 'failed').length;
        
        return {
            total: history.length,
            successful: successful,
            failed: failed,
            lastBackup: this.backupStatus.lastBackup,
            nextBackup: this.backupStatus.nextBackup,
            autoBackupEnabled: this.config.autoBackup,
            successRate: history.length > 0 ? (successful / history.length * 100).toFixed(2) : 0
        };
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.backupService = new BackupService();
    });
} else {
    window.backupService = new BackupService();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackupService;
}
