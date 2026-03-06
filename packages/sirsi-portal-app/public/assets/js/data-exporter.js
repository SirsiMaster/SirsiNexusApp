/**
 * Data Exporter Utility
 * Handles exporting dashboard data to CSV and Excel formats
 * @version 1.0.0
 */

class DataExporter {
    constructor() {
        this.api = window.dashboardAPI || new DashboardAPI();
    }

    /**
     * Export data based on the selected format
     * @param {string} format - 'csv' or 'excel'
     * @param {string} dataType - Type of data to export (all, kpis, activity, users, etc.)
     */
    async exportData(format = 'csv', dataType = 'all') {
        try {
            // Show loading state
            this.showExportLoading(true);

            // Gather data based on type
            const data = await this.gatherData(dataType);

            // Export based on format
            if (format === 'csv') {
                await this.exportToCSV(data, dataType);
            } else if (format === 'excel') {
                await this.exportToExcel(data, dataType);
            }

            // Show success message
            if (window.showToast) {
                showToast(`Data exported successfully as ${format.toUpperCase()}`, 'success');
            }

        } catch (error) {
            console.error('Export error:', error);
            if (window.showToast) {
                showToast('Failed to export data. Please try again.', 'error');
            }
        } finally {
            this.showExportLoading(false);
        }
    }

    /**
     * Gather data based on type
     */
    async gatherData(dataType) {
        const exportData = {
            exportDate: new Date().toISOString(),
            dataType: dataType
        };

        switch (dataType) {
            case 'all':
                // Gather all dashboard data
                const [kpis, activity, users, notifications, systemStatus] = await Promise.all([
                    this.api.getKPIs(),
                    this.api.getRecentActivity(),
                    this.api.getUsers(),
                    this.api.getNotifications(),
                    this.api.getSystemStatus()
                ]);

                exportData.kpis = kpis.data || [];
                exportData.activity = activity.data || [];
                exportData.users = users.data || [];
                exportData.notifications = notifications.data || [];
                exportData.systemStatus = systemStatus.data || {};
                break;

            case 'kpis':
                const kpiData = await this.api.getKPIs();
                exportData.kpis = kpiData.data || [];
                break;

            case 'activity':
                const activityData = await this.api.getRecentActivity();
                exportData.activity = activityData.data || [];
                break;

            case 'users':
                const userData = await this.api.getUsers();
                exportData.users = userData.data || [];
                break;

            case 'revenue':
                const revenueData = await this.api.getChartData('revenue');
                exportData.revenue = this.formatChartData(revenueData.data);
                break;

            case 'userGrowth':
                const userGrowthData = await this.api.getChartData('users');
                exportData.userGrowth = this.formatChartData(userGrowthData.data);
                break;

            default:
                throw new Error(`Unknown data type: ${dataType}`);
        }

        return exportData;
    }

    /**
     * Format chart data for export
     */
    formatChartData(chartData) {
        if (!chartData || !chartData.labels || !chartData.datasets) {
            return [];
        }

        const formatted = [];
        const labels = chartData.labels;
        const datasets = chartData.datasets;

        labels.forEach((label, index) => {
            const row = { period: label };
            datasets.forEach(dataset => {
                row[dataset.label] = dataset.data[index];
            });
            formatted.push(row);
        });

        return formatted;
    }

    /**
     * Export data to CSV format
     */
    async exportToCSV(data, dataType) {
        let csvContent = '';
        const filename = `sirsinexus_${dataType}_${this.getTimestamp()}.csv`;

        if (dataType === 'all') {
            // Create multiple CSV sections for all data
            csvContent = this.createComprehensiveCSV(data);
        } else {
            // Create single CSV for specific data type
            csvContent = this.createSingleCSV(data, dataType);
        }

        // Download the CSV file
        this.downloadFile(csvContent, filename, 'text/csv');
    }

    /**
     * Create comprehensive CSV with all data
     */
    createComprehensiveCSV(data) {
        let csv = '';

        // Add metadata
        csv += 'SirsiNexus Admin Dashboard Export\n';
        csv += `Export Date:,${new Date(data.exportDate).toLocaleString()}\n\n`;

        // KPIs Section
        if (data.kpis && data.kpis.length > 0) {
            csv += 'KEY PERFORMANCE INDICATORS\n';
            csv += 'Metric,Value,Status\n';
            data.kpis.forEach(kpi => {
                csv += `"${kpi.name}","${kpi.value}","${kpi.color || 'N/A'}"\n`;
            });
            csv += '\n';
        }

        // Activity Section
        if (data.activity && data.activity.length > 0) {
            csv += 'RECENT ACTIVITY\n';
            csv += 'Timestamp,User,Action,Status\n';
            data.activity.forEach(activity => {
                csv += `"${new Date(activity.timestamp).toLocaleString()}","${activity.user}","${activity.action}","${activity.status}"\n`;
            });
            csv += '\n';
        }

        // Users Section
        if (data.users && data.users.length > 0) {
            csv += 'USERS\n';
            csv += 'ID,Name,Email,Role,Active\n';
            data.users.forEach(user => {
                csv += `"${user.id}","${user.name}","${user.email}","${user.role}","${user.isActive ? 'Yes' : 'No'}"\n`;
            });
            csv += '\n';
        }

        // System Status Section
        if (data.systemStatus) {
            csv += 'SYSTEM STATUS\n';
            csv += 'Component,Status,Value\n';
            if (data.systemStatus.server) {
                csv += `"Server Status","${data.systemStatus.server.status}","Uptime: ${data.systemStatus.server.uptime}%"\n`;
            }
            if (data.systemStatus.api) {
                csv += `"API Response Time","${data.systemStatus.api.status}","${data.systemStatus.api.responseTime}ms"\n`;
            }
            if (data.systemStatus.storage) {
                csv += `"Storage","${data.systemStatus.storage.percentage}% used","${data.systemStatus.storage.used}GB of ${data.systemStatus.storage.total}GB"\n`;
            }
        }

        return csv;
    }

    /**
     * Create single CSV for specific data type
     */
    createSingleCSV(data, dataType) {
        let csv = '';
        
        // Add header
        csv += `SirsiNexus ${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Export\n`;
        csv += `Export Date:,${new Date(data.exportDate).toLocaleString()}\n\n`;

        switch (dataType) {
            case 'kpis':
                csv += 'Metric,Value,Status\n';
                data.kpis.forEach(kpi => {
                    csv += `"${kpi.name}","${kpi.value}","${kpi.color || 'N/A'}"\n`;
                });
                break;

            case 'activity':
                csv += 'Timestamp,User,Action,Status\n';
                data.activity.forEach(activity => {
                    csv += `"${new Date(activity.timestamp).toLocaleString()}","${activity.user}","${activity.action}","${activity.status}"\n`;
                });
                break;

            case 'users':
                csv += 'ID,Name,Email,Role,Active\n';
                data.users.forEach(user => {
                    csv += `"${user.id}","${user.name}","${user.email}","${user.role}","${user.isActive ? 'Yes' : 'No'}"\n`;
                });
                break;

            case 'revenue':
            case 'userGrowth':
                const chartData = data[dataType];
                if (chartData && chartData.length > 0) {
                    // Get headers from first row
                    const headers = Object.keys(chartData[0]);
                    csv += headers.join(',') + '\n';
                    
                    // Add data rows
                    chartData.forEach(row => {
                        csv += headers.map(header => `"${row[header]}"`).join(',') + '\n';
                    });
                }
                break;
        }

        return csv;
    }

    /**
     * Export data to Excel format
     */
    async exportToExcel(data, dataType) {
        // Check if SheetJS is available
        if (typeof XLSX === 'undefined') {
            // Load SheetJS dynamically if not available
            await this.loadSheetJS();
        }

        const filename = `sirsinexus_${dataType}_${this.getTimestamp()}.xlsx`;
        const workbook = XLSX.utils.book_new();

        if (dataType === 'all') {
            // Create multiple sheets for all data
            this.createComprehensiveExcel(workbook, data);
        } else {
            // Create single sheet for specific data type
            this.createSingleExcelSheet(workbook, data, dataType);
        }

        // Write and download the Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        this.downloadBlob(blob, filename);
    }

    /**
     * Create comprehensive Excel with multiple sheets
     */
    createComprehensiveExcel(workbook, data) {
        // Summary Sheet
        const summaryData = [
            ['SirsiNexus Admin Dashboard Export'],
            ['Export Date:', new Date(data.exportDate).toLocaleString()],
            [],
            ['Summary'],
            ['Total KPIs:', data.kpis ? data.kpis.length : 0],
            ['Total Activities:', data.activity ? data.activity.length : 0],
            ['Total Users:', data.users ? data.users.length : 0],
            ['Total Notifications:', data.notifications ? data.notifications.length : 0]
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

        // KPIs Sheet
        if (data.kpis && data.kpis.length > 0) {
            const kpiData = [
                ['Metric', 'Value', 'Status'],
                ...data.kpis.map(kpi => [kpi.name, kpi.value, kpi.color || 'N/A'])
            ];
            const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
            XLSX.utils.book_append_sheet(workbook, kpiSheet, 'KPIs');
        }

        // Activity Sheet
        if (data.activity && data.activity.length > 0) {
            const activityData = [
                ['Timestamp', 'User', 'Action', 'Status'],
                ...data.activity.map(activity => [
                    new Date(activity.timestamp).toLocaleString(),
                    activity.user,
                    activity.action,
                    activity.status
                ])
            ];
            const activitySheet = XLSX.utils.aoa_to_sheet(activityData);
            XLSX.utils.book_append_sheet(workbook, activitySheet, 'Recent Activity');
        }

        // Users Sheet
        if (data.users && data.users.length > 0) {
            const userData = [
                ['ID', 'Name', 'Email', 'Role', 'Active'],
                ...data.users.map(user => [
                    user.id,
                    user.name,
                    user.email,
                    user.role,
                    user.isActive ? 'Yes' : 'No'
                ])
            ];
            const userSheet = XLSX.utils.aoa_to_sheet(userData);
            XLSX.utils.book_append_sheet(workbook, userSheet, 'Users');
        }

        // System Status Sheet
        if (data.systemStatus) {
            const statusData = [
                ['System Status Report'],
                [],
                ['Component', 'Status', 'Details']
            ];

            if (data.systemStatus.server) {
                statusData.push(['Server', data.systemStatus.server.status, `Uptime: ${data.systemStatus.server.uptime}%`]);
            }
            if (data.systemStatus.api) {
                statusData.push(['API', data.systemStatus.api.status, `Response Time: ${data.systemStatus.api.responseTime}ms`]);
            }
            if (data.systemStatus.storage) {
                statusData.push(['Storage', `${data.systemStatus.storage.percentage}% used`, `${data.systemStatus.storage.used}GB of ${data.systemStatus.storage.total}GB`]);
            }

            const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
            XLSX.utils.book_append_sheet(workbook, statusSheet, 'System Status');
        }
    }

    /**
     * Create single Excel sheet for specific data type
     */
    createSingleExcelSheet(workbook, data, dataType) {
        let sheetData = [];
        let sheetName = dataType.charAt(0).toUpperCase() + dataType.slice(1);

        switch (dataType) {
            case 'kpis':
                sheetData = [
                    ['Metric', 'Value', 'Status'],
                    ...data.kpis.map(kpi => [kpi.name, kpi.value, kpi.color || 'N/A'])
                ];
                break;

            case 'activity':
                sheetData = [
                    ['Timestamp', 'User', 'Action', 'Status'],
                    ...data.activity.map(activity => [
                        new Date(activity.timestamp).toLocaleString(),
                        activity.user,
                        activity.action,
                        activity.status
                    ])
                ];
                sheetName = 'Recent Activity';
                break;

            case 'users':
                sheetData = [
                    ['ID', 'Name', 'Email', 'Role', 'Active'],
                    ...data.users.map(user => [
                        user.id,
                        user.name,
                        user.email,
                        user.role,
                        user.isActive ? 'Yes' : 'No'
                    ])
                ];
                break;

            case 'revenue':
            case 'userGrowth':
                const chartData = data[dataType];
                if (chartData && chartData.length > 0) {
                    const headers = Object.keys(chartData[0]);
                    sheetData = [
                        headers,
                        ...chartData.map(row => headers.map(header => row[header]))
                    ];
                }
                sheetName = dataType === 'revenue' ? 'Revenue Data' : 'User Growth';
                break;
        }

        const sheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    }

    /**
     * Load SheetJS library dynamically
     */
    async loadSheetJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Download file utility
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        this.downloadBlob(blob, filename);
    }

    /**
     * Download blob utility
     */
    downloadBlob(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Get timestamp for filename
     */
    getTimestamp() {
        const now = new Date();
        return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    }

    /**
     * Show/hide export loading state
     */
    showExportLoading(show) {
        // You can implement a loading indicator here
        const exportButtons = document.querySelectorAll('#export-csv, #export-excel');
        exportButtons.forEach(button => {
            button.disabled = show;
            if (show) {
                button.textContent = button.id === 'export-csv' ? 'Exporting...' : 'Exporting...';
            } else {
                button.textContent = button.id === 'export-csv' ? 'Export CSV' : 'Export Excel';
            }
        });
    }

    /**
     * Show export options modal
     */
    showExportOptions(format) {
        // Create a simple modal for export options
        const modalHtml = `
            <div id="exportOptionsModal" class="modal show">
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h2 class="modal-title">Export Options</h2>
                        <button class="modal-close" onclick="dataExporter.closeExportOptions()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-4">Select the data you want to export:</p>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="radio" name="exportType" value="all" checked class="mr-2">
                                <span>All Dashboard Data</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="exportType" value="kpis" class="mr-2">
                                <span>KPIs Only</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="exportType" value="activity" class="mr-2">
                                <span>Recent Activity</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="exportType" value="users" class="mr-2">
                                <span>Users List</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="exportType" value="revenue" class="mr-2">
                                <span>Revenue Data</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="exportType" value="userGrowth" class="mr-2">
                                <span>User Growth Data</span>
                            </label>
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button type="button" class="btn btn-secondary" onclick="dataExporter.closeExportOptions()">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="dataExporter.executeExport('${format}')">Export</button>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.getElementById('exportOptionsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    /**
     * Close export options modal
     */
    closeExportOptions() {
        const modal = document.getElementById('exportOptionsModal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Execute export based on selected options
     */
    executeExport(format) {
        const selectedType = document.querySelector('input[name="exportType"]:checked')?.value || 'all';
        this.closeExportOptions();
        this.exportData(format, selectedType);
    }
}

// Create global instance
window.dataExporter = new DataExporter();

// Make DataExporter available globally
window.DataExporter = DataExporter;
