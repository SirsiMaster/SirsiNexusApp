/**
 * SirsiNexus QR Code Generation Utility
 * Comprehensive QR code functionality for investor invites, platform access, and tracking
 */

class QRCodeGenerator {
    constructor() {
        this.baseUrl = window.location.origin + '/';
        this.defaultOptions = {
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M,
            quietZone: 20,
            quietZoneColor: '#ffffff'
        };
        this.trackingData = JSON.parse(localStorage.getItem('qrTrackingData')) || [];
    }

    /**
     * Generate QR code for investor invites
     * @param {Object} inviteData - Investor invitation data
     * @param {Object} options - QR code generation options
     * @returns {Promise<Object>} Generated QR code data
     */
    async generateInvestorInvite(inviteData, options = {}) {
        const {
            investorId,
            email,
            name,
            accessLevel = 'investor',
            expiryDays = 30,
            customMessage = '',
            campaignId = null
        } = inviteData;

        // Generate unique invite token
        const inviteToken = this.generateInviteToken();
        const expiryDate = new Date(Date.now() + (expiryDays * 24 * 60 * 60 * 1000));

        // Create tracking parameters
        const trackingParams = {
            source: 'qr_invite',
            campaign: campaignId || 'default_invite',
            medium: 'qr_code',
            investor_id: investorId,
            generated: new Date().toISOString(),
            expires: expiryDate.toISOString()
        };

        // Construct invite URL with tracking
        const inviteUrl = this.buildInviteUrl(inviteToken, trackingParams);

        // Store invite data
        const inviteRecord = {
            token: inviteToken,
            investorId,
            email,
            name,
            accessLevel,
            expires: expiryDate.toISOString(),
            created: new Date().toISOString(),
            status: 'pending',
            tracking: trackingParams,
            customMessage
        };

        this.storeInviteRecord(inviteRecord);

        // Generate QR code
        const qrOptions = { ...this.defaultOptions, ...options };
        const qrData = await this.generateQRCode(inviteUrl, qrOptions);

        return {
            ...qrData,
            inviteToken,
            inviteUrl,
            inviteRecord,
            trackingId: this.generateTrackingId(trackingParams)
        };
    }

    /**
     * Generate QR code for platform access points
     * @param {Object} accessData - Access point configuration
     * @param {Object} options - QR code generation options
     * @returns {Promise<Object>} Generated QR code data
     */
    async generatePlatformAccess(accessData, options = {}) {
        const {
            accessType = 'login',
            redirectPath = 'investor-login.html',
            temporaryAccess = false,
            validityHours = 24,
            locationId = null,
            customParams = {}
        } = accessData;

        const trackingParams = {
            source: 'qr_access',
            access_type: accessType,
            location: locationId,
            generated: new Date().toISOString(),
            ...(temporaryAccess && {
                expires: new Date(Date.now() + (validityHours * 60 * 60 * 1000)).toISOString()
            }),
            ...customParams
        };

        const accessUrl = this.buildAccessUrl(redirectPath, trackingParams);
        
        // Store access tracking
        this.storeTrackingData({
            type: 'platform_access',
            url: accessUrl,
            params: trackingParams,
            created: new Date().toISOString()
        });

        const qrOptions = { ...this.defaultOptions, ...options };
        const qrData = await this.generateQRCode(accessUrl, qrOptions);

        return {
            ...qrData,
            accessUrl,
            trackingParams,
            trackingId: this.generateTrackingId(trackingParams)
        };
    }

    /**
     * Generate bulk QR codes for multiple invites
     * @param {Array} inviteList - Array of invite data objects
     * @param {Object} options - Bulk generation options
     * @returns {Promise<Array>} Array of generated QR codes
     */
    async generateBulkInvites(inviteList, options = {}) {
        const {
            batchSize = 10,
            delay = 100,
            progressCallback = null,
            campaignId = null
        } = options;

        const results = [];
        const total = inviteList.length;

        for (let i = 0; i < inviteList.length; i += batchSize) {
            const batch = inviteList.slice(i, i + batchSize);
            const batchPromises = batch.map(async (inviteData, batchIndex) => {
                const globalIndex = i + batchIndex;
                
                try {
                    const qrResult = await this.generateInvestorInvite({
                        ...inviteData,
                        campaignId: campaignId || `bulk_${Date.now()}`
                    });

                    if (progressCallback) {
                        progressCallback({
                            current: globalIndex + 1,
                            total,
                            percentage: Math.round(((globalIndex + 1) / total) * 100),
                            success: true,
                            data: qrResult
                        });
                    }

                    return { success: true, index: globalIndex, data: qrResult };
                } catch (error) {
                    if (progressCallback) {
                        progressCallback({
                            current: globalIndex + 1,
                            total,
                            percentage: Math.round(((globalIndex + 1) / total) * 100),
                            success: false,
                            error: error.message
                        });
                    }

                    return { success: false, index: globalIndex, error: error.message };
                }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Add delay between batches to prevent overwhelming
            if (i + batchSize < inviteList.length && delay > 0) {
                await this.sleep(delay);
            }
        }

        return results;
    }

    /**
     * Generate QR code with custom branding
     * @param {string} data - Data to encode
     * @param {Object} brandingOptions - Branding configuration
     * @returns {Promise<Object>} Branded QR code data
     */
    async generateBrandedQR(data, brandingOptions = {}) {
        const {
            logo = null,
            logoSize = 0.2,
            brandColors = {},
            customBackground = null,
            watermark = null,
            frameStyle = 'none'
        } = brandingOptions;

        const options = {
            ...this.defaultOptions,
            colorDark: brandColors.primary || this.defaultOptions.colorDark,
            colorLight: brandColors.background || this.defaultOptions.colorLight,
            quietZoneColor: brandColors.background || this.defaultOptions.colorLight
        };

        const baseQR = await this.generateQRCode(data, options);
        
        // Apply branding enhancements
        if (logo || customBackground || watermark || frameStyle !== 'none') {
            return this.applyBranding(baseQR, brandingOptions);
        }

        return baseQR;
    }

    /**
     * Export QR codes in various formats
     * @param {Object} qrData - QR code data
     * @param {Array} formats - Export formats ['png', 'svg', 'pdf']
     * @returns {Promise<Object>} Export results
     */
    async exportQRCode(qrData, formats = ['png']) {
        const exports = {};

        for (const format of formats) {
            switch (format.toLowerCase()) {
                case 'png':
                    exports.png = await this.exportToPNG(qrData);
                    break;
                case 'svg':
                    exports.svg = await this.exportToSVG(qrData);
                    break;
                case 'pdf':
                    exports.pdf = await this.exportToPDF(qrData);
                    break;
                default:
                    console.warn(`Unsupported export format: ${format}`);
            }
        }

        return exports;
    }

    /**
     * Core QR code generation using QRCode.js library
     * @private
     */
    async generateQRCode(data, options) {
        return new Promise((resolve, reject) => {
            try {
                // Create canvas element
                const canvas = document.createElement('canvas');
                const qr = new QRCode(canvas, {
                    text: data,
                    width: options.width,
                    height: options.height,
                    colorDark: options.colorDark,
                    colorLight: options.colorLight,
                    correctLevel: options.correctLevel,
                    quietZone: options.quietZone,
                    quietZoneColor: options.quietZoneColor
                });

                // Convert to data URL
                setTimeout(() => {
                    const dataUrl = canvas.toDataURL('image/png');
                    resolve({
                        dataUrl,
                        canvas,
                        data,
                        options,
                        generated: new Date().toISOString()
                    });
                }, 100);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Apply custom branding to QR code
     * @private
     */
    async applyBranding(baseQR, brandingOptions) {
        const { canvas } = baseQR;
        const ctx = canvas.getContext('2d');
        
        // Add logo if provided
        if (brandingOptions.logo) {
            await this.addLogoToQR(ctx, canvas, brandingOptions.logo, brandingOptions.logoSize);
        }

        // Add frame if specified
        if (brandingOptions.frameStyle && brandingOptions.frameStyle !== 'none') {
            this.addFrameToQR(ctx, canvas, brandingOptions.frameStyle, brandingOptions.brandColors);
        }

        // Update data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        return {
            ...baseQR,
            dataUrl,
            branded: true,
            branding: brandingOptions
        };
    }

    /**
     * Add logo to QR code center
     * @private
     */
    async addLogoToQR(ctx, canvas, logoSrc, logoSize) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const size = canvas.width * logoSize;
                const x = (canvas.width - size) / 2;
                const y = (canvas.height - size) / 2;
                
                // Create white background for logo
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x - 5, y - 5, size + 10, size + 10);
                
                // Draw logo
                ctx.drawImage(img, x, y, size, size);
                resolve();
            };
            img.src = logoSrc;
        });
    }

    /**
     * Add decorative frame to QR code
     * @private
     */
    addFrameToQR(ctx, canvas, frameStyle, brandColors) {
        const { width, height } = canvas;
        
        switch (frameStyle) {
            case 'rounded':
                this.drawRoundedFrame(ctx, width, height, brandColors);
                break;
            case 'corporate':
                this.drawCorporateFrame(ctx, width, height, brandColors);
                break;
            case 'minimal':
                this.drawMinimalFrame(ctx, width, height, brandColors);
                break;
        }
    }

    /**
     * Export to PNG format
     * @private
     */
    async exportToPNG(qrData) {
        const { canvas } = qrData;
        return {
            format: 'png',
            dataUrl: canvas.toDataURL('image/png'),
            blob: await this.canvasToBlob(canvas, 'image/png'),
            filename: `qr-code-${Date.now()}.png`
        };
    }

    /**
     * Export to SVG format
     * @private
     */
    async exportToSVG(qrData) {
        // Convert canvas to SVG representation
        const svgString = this.canvasToSVG(qrData.canvas);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        
        return {
            format: 'svg',
            svg: svgString,
            blob,
            filename: `qr-code-${Date.now()}.svg`
        };
    }

    /**
     * Export to PDF format
     * @private
     */
    async exportToPDF(qrData) {
        // This would require a PDF library like jsPDF
        console.warn('PDF export requires jsPDF library integration');
        return {
            format: 'pdf',
            error: 'PDF export not implemented - requires jsPDF library'
        };
    }

    /**
     * Utility methods
     */
    generateInviteToken() {
        return 'INV_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateTrackingId(params) {
        return 'TRK_' + btoa(JSON.stringify(params)).replace(/[^a-zA-Z0-9]/g, '').substr(0, 16);
    }

    buildInviteUrl(token, trackingParams) {
        const params = new URLSearchParams({
            invite: token,
            ...trackingParams
        });
        return `${this.baseUrl}investor-login.html?${params.toString()}`;
    }

    buildAccessUrl(path, trackingParams) {
        const params = new URLSearchParams(trackingParams);
        return `${this.baseUrl}${path}?${params.toString()}`;
    }

    storeInviteRecord(record) {
        const invites = JSON.parse(localStorage.getItem('qrInviteRecords')) || [];
        invites.push(record);
        localStorage.setItem('qrInviteRecords', JSON.stringify(invites));
    }

    storeTrackingData(data) {
        this.trackingData.push(data);
        localStorage.setItem('qrTrackingData', JSON.stringify(this.trackingData));
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    canvasToBlob(canvas, type) {
        return new Promise(resolve => {
            canvas.toBlob(resolve, type);
        });
    }

    canvasToSVG(canvas) {
        // Basic SVG conversion - would need enhancement for full features
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        let svg = `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">`;
        svg += `<rect width="100%" height="100%" fill="white"/>`;
        
        // Convert pixel data to SVG rectangles (simplified)
        for (let y = 0; y < canvas.height; y += 4) {
            for (let x = 0; x < canvas.width; x += 4) {
                const index = (y * canvas.width + x) * 4;
                if (imageData.data[index] < 128) { // If pixel is dark
                    svg += `<rect x="${x}" y="${y}" width="4" height="4" fill="black"/>`;
                }
            }
        }
        
        svg += '</svg>';
        return svg;
    }

    // Frame drawing methods
    drawRoundedFrame(ctx, width, height, colors) {
        const radius = 20;
        ctx.strokeStyle = colors.primary || '#059669';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.roundRect(4, 4, width - 8, height - 8, radius);
        ctx.stroke();
    }

    drawCorporateFrame(ctx, width, height, colors) {
        ctx.strokeStyle = colors.primary || '#059669';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, width - 6, height - 6);
        
        // Add corner decorations
        const cornerSize = 20;
        ctx.fillStyle = colors.primary || '#059669';
        ctx.fillRect(0, 0, cornerSize, cornerSize);
        ctx.fillRect(width - cornerSize, 0, cornerSize, cornerSize);
        ctx.fillRect(0, height - cornerSize, cornerSize, cornerSize);
        ctx.fillRect(width - cornerSize, height - cornerSize, cornerSize, cornerSize);
    }

    drawMinimalFrame(ctx, width, height, colors) {
        ctx.strokeStyle = colors.primary || '#059669';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);
    }

    /**
     * Get tracking analytics for QR codes
     */
    getTrackingAnalytics() {
        const invites = JSON.parse(localStorage.getItem('qrInviteRecords')) || [];
        const tracking = JSON.parse(localStorage.getItem('qrTrackingData')) || [];
        
        return {
            totalInvites: invites.length,
            pendingInvites: invites.filter(i => i.status === 'pending').length,
            acceptedInvites: invites.filter(i => i.status === 'accepted').length,
            expiredInvites: invites.filter(i => new Date(i.expires) < new Date()).length,
            trackingEvents: tracking.length,
            recentActivity: tracking.slice(-10)
        };
    }

    /**
     * Validate and process QR scan tracking
     */
    trackQRScan(url, scanData = {}) {
        const trackingEvent = {
            url,
            scanTime: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            ...scanData
        };
        
        this.storeTrackingData({
            type: 'qr_scan',
            ...trackingEvent
        });
        
        return trackingEvent;
    }
}

// Initialize QR Code Generator when DOM is loaded
if (typeof window !== 'undefined') {
    window.QRGenerator = QRCodeGenerator;
    
    // Auto-initialize if QRCode library is available
    if (typeof QRCode !== 'undefined') {
        window.qrGenerator = new QRCodeGenerator();
    } else {
        console.warn('QRCode library not found. Please include QRCode.js library.');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRCodeGenerator;
}
