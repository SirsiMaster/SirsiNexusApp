/**
 * Secure Authentication Service
 * Implements email verification, 2FA, and encrypted storage
 * @version 2.0.0
 */

class SecureAuthService {
    constructor() {
        this.dbName = 'SirsiNexusSecureDB';
        this.encryptionKey = null;
        this.initializeService();
    }

    async initializeService() {
        // Initialize encryption key
        this.encryptionKey = await this.getOrCreateEncryptionKey();
        
        // Initialize IndexedDB for secure storage
        await this.initializeDatabase();
        
        // Set up security headers
        this.setupSecurityHeaders();
        
        // Initialize CSRF protection
        this.initializeCSRFProtection();
    }

    /**
     * Initialize IndexedDB for secure storage
     */
    async initializeDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Users store with encryption
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id' });
                    userStore.createIndex('email', 'email', { unique: true });
                    userStore.createIndex('username', 'username', { unique: true });
                }
                
                // Sessions store
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionStore = db.createObjectStore('sessions', { keyPath: 'sessionId' });
                    sessionStore.createIndex('userId', 'userId');
                    sessionStore.createIndex('expiresAt', 'expiresAt');
                }
                
                // Email verification tokens
                if (!db.objectStoreNames.contains('emailTokens')) {
                    const tokenStore = db.createObjectStore('emailTokens', { keyPath: 'token' });
                    tokenStore.createIndex('userId', 'userId');
                    tokenStore.createIndex('expiresAt', 'expiresAt');
                }
                
                // 2FA tokens
                if (!db.objectStoreNames.contains('tfaTokens')) {
                    const tfaStore = db.createObjectStore('tfaTokens', { keyPath: 'userId' });
                }
                
                // Audit logs
                if (!db.objectStoreNames.contains('auditLogs')) {
                    const auditStore = db.createObjectStore('auditLogs', { keyPath: 'id', autoIncrement: true });
                    auditStore.createIndex('userId', 'userId');
                    auditStore.createIndex('timestamp', 'timestamp');
                }
            };
        });
    }

    /**
     * Get or create encryption key using Web Crypto API
     */
    async getOrCreateEncryptionKey() {
        const keyName = 'sirsinexus-encryption-key';
        
        // Try to get existing key from secure storage
        const storedKey = await this.getSecureItem(keyName);
        if (storedKey) {
            return await crypto.subtle.importKey(
                'jwk',
                JSON.parse(storedKey),
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
        }
        
        // Generate new key
        const key = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
        
        // Export and store key
        const exportedKey = await crypto.subtle.exportKey('jwk', key);
        await this.setSecureItem(keyName, JSON.stringify(exportedKey));
        
        return key;
    }

    /**
     * Encrypt data using AES-GCM
     */
    async encrypt(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            this.encryptionKey,
            dataBuffer
        );
        
        return {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encryptedBuffer))
        };
    }

    /**
     * Decrypt data using AES-GCM
     */
    async decrypt(encryptedData) {
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
            this.encryptionKey,
            new Uint8Array(encryptedData.data)
        );
        
        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decryptedBuffer));
    }

    /**
     * Hash password using PBKDF2
     */
    async hashPassword(password, salt = null) {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        
        if (!salt) {
            salt = crypto.getRandomValues(new Uint8Array(16));
        }
        
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveBits']
        );
        
        const hashBuffer = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            256
        );
        
        return {
            hash: Array.from(new Uint8Array(hashBuffer)),
            salt: Array.from(salt)
        };
    }

    /**
     * Register new user with email verification
     */
    async register(userData) {
        const transaction = this.db.transaction(['users', 'emailTokens', 'auditLogs'], 'readwrite');
        
        try {
            // Validate input
            this.validateRegistrationData(userData);
            
            // Check if user exists
            const existingUser = await this.getUserByEmail(userData.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }
            
            // Hash password
            const passwordData = await this.hashPassword(userData.password);
            
            // Create user object
            const user = {
                id: this.generateSecureId(),
                email: userData.email.toLowerCase(),
                username: userData.username,
                firstName: userData.firstName,
                lastName: userData.lastName,
                passwordHash: passwordData.hash,
                passwordSalt: passwordData.salt,
                role: userData.role || 'user',
                isEmailVerified: false,
                is2FAEnabled: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: null,
                failedLoginAttempts: 0,
                accountLocked: false,
                accountLockExpiry: null
            };
            
            // Encrypt sensitive data
            const encryptedUser = await this.encryptUserData(user);
            
            // Store user
            await transaction.objectStore('users').add(encryptedUser);
            
            // Generate email verification token
            const verificationToken = this.generateSecureToken();
            const tokenData = {
                token: verificationToken,
                userId: user.id,
                type: 'email_verification',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            };
            
            await transaction.objectStore('emailTokens').add(tokenData);
            
            // Log registration
            await this.auditLog(user.id, 'USER_REGISTERED', { email: user.email });
            
            // Send verification email (in production, this would send actual email)
            await this.sendVerificationEmail(user.email, verificationToken);
            
            return {
                success: true,
                userId: user.id,
                message: 'Registration successful. Please check your email to verify your account.'
            };
            
        } catch (error) {
            transaction.abort();
            throw error;
        }
    }

    /**
     * Login with email/password and optional 2FA
     */
    async login(email, password, tfaCode = null) {
        try {
            // Get user
            const user = await this.getUserByEmail(email);
            if (!user) {
                await this.auditLog(null, 'LOGIN_FAILED', { email, reason: 'User not found' });
                throw new Error('Invalid email or password');
            }
            
            // Check if account is locked
            if (user.accountLocked && new Date(user.accountLockExpiry) > new Date()) {
                await this.auditLog(user.id, 'LOGIN_BLOCKED', { reason: 'Account locked' });
                throw new Error('Account is locked. Please try again later.');
            }
            
            // Verify password
            const passwordValid = await this.verifyPassword(password, user.passwordHash, user.passwordSalt);
            if (!passwordValid) {
                await this.handleFailedLogin(user);
                throw new Error('Invalid email or password');
            }
            
            // Check email verification
            if (!user.isEmailVerified) {
                throw new Error('Please verify your email before logging in');
            }
            
            // Check 2FA if enabled
            if (user.is2FAEnabled) {
                if (!tfaCode) {
                    return {
                        requires2FA: true,
                        userId: user.id
                    };
                }
                
                const tfaValid = await this.verify2FA(user.id, tfaCode);
                if (!tfaValid) {
                    await this.auditLog(user.id, 'LOGIN_FAILED', { reason: 'Invalid 2FA code' });
                    throw new Error('Invalid 2FA code');
                }
            }
            
            // Create session
            const session = await this.createSession(user.id);
            
            // Update last login
            await this.updateUser(user.id, {
                lastLoginAt: new Date().toISOString(),
                failedLoginAttempts: 0,
                accountLocked: false,
                accountLockExpiry: null
            });
            
            // Audit log
            await this.auditLog(user.id, 'LOGIN_SUCCESS', { sessionId: session.sessionId });
            
            return {
                success: true,
                sessionId: session.sessionId,
                user: this.sanitizeUser(user)
            };
            
        } catch (error) {
            throw error;
        }
    }

    /**
     * Enable 2FA for user
     */
    async enable2FA(userId) {
        const secret = this.generateTOTPSecret();
        const qrCodeUrl = await this.generateQRCode(userId, secret);
        
        // Store encrypted secret
        const transaction = this.db.transaction(['tfaTokens'], 'readwrite');
        const encryptedSecret = await this.encrypt({ secret });
        
        await transaction.objectStore('tfaTokens').put({
            userId,
            encryptedSecret,
            createdAt: new Date().toISOString()
        });
        
        return {
            secret,
            qrCodeUrl,
            backupCodes: this.generateBackupCodes()
        };
    }

    /**
     * Verify 2FA code
     */
    async verify2FA(userId, code) {
        const transaction = this.db.transaction(['tfaTokens'], 'readonly');
        const tfaData = await transaction.objectStore('tfaTokens').get(userId);
        
        if (!tfaData) {
            return false;
        }
        
        const { secret } = await this.decrypt(tfaData.encryptedSecret);
        return this.verifyTOTPCode(secret, code);
    }

    /**
     * Generate TOTP secret
     */
    generateTOTPSecret() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let secret = '';
        for (let i = 0; i < 32; i++) {
            secret += chars[Math.floor(Math.random() * chars.length)];
        }
        return secret;
    }

    /**
     * Verify TOTP code
     */
    verifyTOTPCode(secret, code) {
        // In production, use a proper TOTP library
        // This is a simplified example
        const window = 30; // 30 second window
        const currentTime = Math.floor(Date.now() / 1000 / window);
        
        // Check current and previous time windows
        for (let i = -1; i <= 1; i++) {
            const expectedCode = this.generateTOTPCode(secret, currentTime + i);
            if (code === expectedCode) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Generate TOTP code (simplified)
     */
    generateTOTPCode(secret, time) {
        // In production, use proper HMAC-based implementation
        const hash = Array.from(secret + time).reduce((acc, char) => {
            return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0);
        
        return String(Math.abs(hash) % 1000000).padStart(6, '0');
    }

    /**
     * Setup security headers
     */
    setupSecurityHeaders() {
        // Content Security Policy
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'";
        document.head.appendChild(meta);
        
        // Other security headers (would be set server-side in production)
        // X-Frame-Options: DENY
        // X-Content-Type-Options: nosniff
        // Strict-Transport-Security: max-age=31536000; includeSubDomains
        // X-XSS-Protection: 1; mode=block
    }

    /**
     * CSRF Protection
     */
    initializeCSRFProtection() {
        this.csrfToken = this.generateSecureToken();
        
        // Add to all forms
        document.addEventListener('submit', (e) => {
            if (e.target.tagName === 'FORM') {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'csrf_token';
                input.value = this.csrfToken;
                e.target.appendChild(input);
            }
        });
    }

    /**
     * Validate CSRF token
     */
    validateCSRFToken(token) {
        return token === this.csrfToken;
    }

    /**
     * Generate secure random ID
     */
    generateSecureId() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Generate secure random token
     */
    generateSecureToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Encrypt user data before storage
     */
    async encryptUserData(user) {
        const sensitiveFields = ['passwordHash', 'passwordSalt', 'email', 'firstName', 'lastName'];
        const encryptedUser = { ...user };
        
        for (const field of sensitiveFields) {
            if (user[field]) {
                encryptedUser[field] = await this.encrypt(user[field]);
            }
        }
        
        return encryptedUser;
    }

    /**
     * Decrypt user data after retrieval
     */
    async decryptUserData(encryptedUser) {
        const user = { ...encryptedUser };
        const sensitiveFields = ['passwordHash', 'passwordSalt', 'email', 'firstName', 'lastName'];
        
        for (const field of sensitiveFields) {
            if (encryptedUser[field] && encryptedUser[field].iv) {
                user[field] = await this.decrypt(encryptedUser[field]);
            }
        }
        
        return user;
    }

    /**
     * Audit log
     */
    async auditLog(userId, action, details = {}) {
        const transaction = this.db.transaction(['auditLogs'], 'readwrite');
        
        await transaction.objectStore('auditLogs').add({
            userId,
            action,
            details,
            timestamp: new Date().toISOString(),
            ipAddress: await this.getClientIP(),
            userAgent: navigator.userAgent
        });
    }

    /**
     * Get client IP (in production, this would be done server-side)
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }

    /**
     * Secure storage helpers
     */
    async setSecureItem(key, value) {
        // In production, use secure key storage (e.g., HSM, secure enclave)
        sessionStorage.setItem(`secure_${key}`, value);
    }

    async getSecureItem(key) {
        return sessionStorage.getItem(`secure_${key}`);
    }

    /**
     * Send verification email (mock implementation)
     */
    async sendVerificationEmail(email, token) {
        console.log(`Verification email would be sent to ${email} with token: ${token}`);
        console.log(`Verification link: ${window.location.origin}/verify-email?token=${token}`);
        
        // In production, integrate with email service (SendGrid, AWS SES, etc.)
    }

    /**
     * Additional helper methods
     */
    validateRegistrationData(data) {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Invalid email format');
        }
        
        // Password strength
        if (data.password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
            throw new Error('Password must contain uppercase, lowercase, and numbers');
        }
        
        // Other validations...
    }

    sanitizeUser(user) {
        const { passwordHash, passwordSalt, ...sanitized } = user;
        return sanitized;
    }

    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            codes.push(this.generateSecureToken().substring(0, 8));
        }
        return codes;
    }

    async createSession(userId) {
        const session = {
            sessionId: this.generateSecureToken(),
            userId,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            lastActivity: new Date().toISOString()
        };
        
        const transaction = this.db.transaction(['sessions'], 'readwrite');
        await transaction.objectStore('sessions').add(session);
        
        return session;
    }

    async getUserByEmail(email) {
        const transaction = this.db.transaction(['users'], 'readonly');
        const index = transaction.objectStore('users').index('email');
        const encryptedUser = await index.get(email.toLowerCase());
        
        if (!encryptedUser) return null;
        
        return await this.decryptUserData(encryptedUser);
    }

    async verifyPassword(password, storedHash, storedSalt) {
        const { hash } = await this.hashPassword(password, new Uint8Array(storedSalt));
        return JSON.stringify(hash) === JSON.stringify(storedHash);
    }

    async handleFailedLogin(user) {
        const failedAttempts = (user.failedLoginAttempts || 0) + 1;
        const updates = { failedLoginAttempts: failedAttempts };
        
        // Lock account after 5 failed attempts
        if (failedAttempts >= 5) {
            updates.accountLocked = true;
            updates.accountLockExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
        }
        
        await this.updateUser(user.id, updates);
        await this.auditLog(user.id, 'LOGIN_FAILED', { attemptNumber: failedAttempts });
    }

    async updateUser(userId, updates) {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        const encryptedUser = await store.get(userId);
        const user = await this.decryptUserData(encryptedUser);
        
        Object.assign(user, updates, { updatedAt: new Date().toISOString() });
        
        const updatedEncryptedUser = await this.encryptUserData(user);
        await store.put(updatedEncryptedUser);
    }

    async generateQRCode(userId, secret) {
        // In production, use a QR code library
        const otpauth = `otpauth://totp/SirsiNexus:${userId}?secret=${secret}&issuer=SirsiNexus`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
    }
}

// Initialize the service
window.secureAuth = new SecureAuthService();
