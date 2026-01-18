/**
 * User Management System
 * Comprehensive user management interface with CRUD operations,
 * search, filtering, pagination, and CSV export functionality
 */

class UserManagement {
    constructor() {
        this.users = [];
        this.filteredUsers = [];
        this.currentPage = 1;
        this.pageSize = 25;
        this.sortField = 'name';
        this.sortDirection = 'asc';
        this.editingUser = null;
        this.selectedUsers = new Set();
        this.currentFilters = {
            search: '',
            role: '',
            status: ''
        };
        
        this.init();
    }

    init() {
        // Initialize with loading state
        this.showLoadingState();
        
        // Simulate async data loading
        setTimeout(() => {
            try {
                this.generateSampleData();
                this.bindEvents();
                this.renderUsers();
                this.updateStats();
                this.hideLoadingState();
            } catch (error) {
                this.showErrorState(error);
            }
        }, 1500);
    }

    generateSampleData() {
        // Generate sample user data
        const roles = ['super_admin', 'admin', 'manager', 'investor', 'committee', 'contributor', 'viewer'];
        const statuses = ['active', 'inactive'];
        const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Jennifer', 'James', 'Maria', 'Christopher', 'Linda', 'Daniel'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
        const companies = ['TechCorp', 'InvestCo', 'StartupXYZ', 'GlobalVentures', 'Innovation Labs', 'Capital Partners', 'Future Holdings', 'Nexus Group', 'Alpha Investments', 'Beta Systems'];

        for (let i = 1; i <= 157; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const role = roles[Math.floor(Math.random() * roles.length)];
            const status = Math.random() > 0.15 ? 'active' : 'inactive'; // 85% active
            const company = companies[Math.floor(Math.random() * companies.length)];
            
            // Create more admins for realistic data
            const finalRole = i <= 3 ? 'super_admin' : i <= 8 ? 'admin' : role;
            
            const createdDate = new Date();
            createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365));
            
            const lastLoginDate = new Date();
            lastLoginDate.setDate(lastLoginDate.getDate() - Math.floor(Math.random() * 30));

            this.users.push({
                id: i,
                firstName: firstName,
                lastName: lastName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(' ', '')}.com`,
                role: finalRole,
                status: status,
                phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
                company: company,
                created: createdDate,
                lastLogin: status === 'active' ? lastLoginDate : null
            });
        }

        this.filteredUsers = [...this.users];
    }

    bindEvents() {
        // Modal events
        document.getElementById('add-user-btn').addEventListener('click', () => this.openUserModal());
        document.getElementById('close-modal').addEventListener('click', () => this.closeUserModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.closeUserModal());
        document.getElementById('user-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Modal overlay click to close
        document.getElementById('modal-overlay').addEventListener('click', () => this.closeUserModal());
        
        // Delete modal events
        document.getElementById('cancel-delete-btn').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('confirm-delete-btn').addEventListener('click', () => this.confirmDelete());
        
        // Search and filter events
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('role-filter').addEventListener('change', (e) => this.handleRoleFilter(e.target.value));
        document.getElementById('status-filter').addEventListener('change', (e) => this.handleStatusFilter(e.target.value));
        document.getElementById('apply-filters-btn').addEventListener('click', () => this.applyFilters());
        document.getElementById('clear-filters-btn').addEventListener('click', () => this.clearFilters());
        
        // Table events
        document.getElementById('select-all').addEventListener('change', (e) => this.handleSelectAll(e.target.checked));
        document.getElementById('page-size-select').addEventListener('change', (e) => this.handlePageSizeChange(e.target.value));
        
        // Export events
        document.getElementById('export-csv-btn').addEventListener('click', () => this.exportToCSV());
        
        // Pagination events (will be bound dynamically)
        document.getElementById('pagination').addEventListener('click', (e) => this.handlePagination(e));
        
        // Sort events (will be bound dynamically)
        document.getElementById('users-table').addEventListener('click', (e) => this.handleSort(e));
    }

    openUserModal(user = null) {
        this.editingUser = user;
        const modal = document.getElementById('user-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('user-form');
        const passwordGroup = document.getElementById('password-group');
        const passwordInput = document.getElementById('user-password');
        
        if (user) {
            title.textContent = 'Edit User';
            this.populateForm(user);
            passwordGroup.style.display = 'none';
            passwordInput.removeAttribute('required');
        } else {
            title.textContent = 'Add New User';
            form.reset();
            passwordGroup.style.display = 'block';
            passwordInput.setAttribute('required', 'required');
        }
        
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('show'), 10);
    }

    closeUserModal() {
        const modal = document.getElementById('user-modal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
            this.editingUser = null;
        }, 300);
    }

    populateForm(user) {
        document.getElementById('user-first-name').value = user.firstName;
        document.getElementById('user-last-name').value = user.lastName;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-role').value = user.role;
        document.getElementById('user-status').value = user.status;
        document.getElementById('user-phone').value = user.phone || '';
        document.getElementById('user-company').value = user.company || '';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        // Set button loading state
        if (window.SirsiState && submitBtn) {
            window.SirsiState.setButtonLoading(submitBtn, true);
        }
        
        try {
            // Simulate API call delay for demonstration
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const formData = new FormData(e.target);
            const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                role: formData.get('role'),
                status: formData.get('status'),
                phone: formData.get('phone') || null,
                company: formData.get('company') || null
            };
            
            if (this.editingUser) {
                this.updateUser(this.editingUser.id, userData);
            } else {
                this.createUser(userData);
            }
            
            this.closeUserModal();
        } catch (error) {
            this.showNotification('Failed to save user data. Please try again.', 'error');
            console.error('Error saving user:', error);
        } finally {
            // Remove button loading state
            if (window.SirsiState && submitBtn) {
                window.SirsiState.setButtonLoading(submitBtn, false);
            }
        }
    }

    createUser(userData) {
        const newUser = {
            id: Math.max(...this.users.map(u => u.id)) + 1,
            ...userData,
            created: new Date(),
            lastLogin: null
        };
        
        this.users.unshift(newUser);
        this.applyFilters();
        this.updateStats();
        this.showNotification('User created successfully', 'success');
    }

    updateUser(id, userData) {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], ...userData };
            this.applyFilters();
            this.updateStats();
            this.showNotification('User updated successfully', 'success');
        }
    }

    openDeleteModal(user) {
        this.userToDelete = user;
        const modal = document.getElementById('delete-modal');
        const userInfo = document.getElementById('delete-user-info');
        
        userInfo.textContent = `${user.firstName} ${user.lastName} (${user.email})`;
        
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('show'), 10);
    }

    closeDeleteModal() {
        const modal = document.getElementById('delete-modal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
            this.userToDelete = null;
        }, 300);
    }

    confirmDelete() {
        if (this.userToDelete) {
            this.deleteUser(this.userToDelete.id);
        }
        this.closeDeleteModal();
    }

    deleteUser(id) {
        this.users = this.users.filter(u => u.id !== id);
        this.selectedUsers.delete(id);
        this.applyFilters();
        this.updateStats();
        this.showNotification('User deleted successfully', 'success');
    }

    handleSearch(value) {
        this.currentFilters.search = value.toLowerCase();
        this.applyFilters();
    }

    handleRoleFilter(value) {
        this.currentFilters.role = value;
    }

    handleStatusFilter(value) {
        this.currentFilters.status = value;
    }

    applyFilters() {
        this.filteredUsers = this.users.filter(user => {
            const matchesSearch = !this.currentFilters.search || 
                user.firstName.toLowerCase().includes(this.currentFilters.search) ||
                user.lastName.toLowerCase().includes(this.currentFilters.search) ||
                user.email.toLowerCase().includes(this.currentFilters.search) ||
                user.company?.toLowerCase().includes(this.currentFilters.search);
            
            const matchesRole = !this.currentFilters.role || user.role === this.currentFilters.role;
            const matchesStatus = !this.currentFilters.status || user.status === this.currentFilters.status;
            
            return matchesSearch && matchesRole && matchesStatus;
        });
        
        this.currentPage = 1;
        this.sortUsers();
        this.renderUsers();
        this.renderPagination();
    }

    clearFilters() {
        this.currentFilters = { search: '', role: '', status: '' };
        document.getElementById('search-input').value = '';
        document.getElementById('role-filter').value = '';
        document.getElementById('status-filter').value = '';
        this.applyFilters();
    }

    handleSort(e) {
        const th = e.target.closest('th.sortable');
        if (!th) return;
        
        const field = th.dataset.sort;
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        
        this.sortUsers();
        this.renderUsers();
        this.updateSortIndicators();
    }

    sortUsers() {
        this.filteredUsers.sort((a, b) => {
            let aVal, bVal;
            
            switch (this.sortField) {
                case 'name':
                    aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
                    bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
                    break;
                case 'email':
                    aVal = a.email.toLowerCase();
                    bVal = b.email.toLowerCase();
                    break;
                case 'role':
                case 'status':
                    aVal = a[this.sortField].toLowerCase();
                    bVal = b[this.sortField].toLowerCase();
                    break;
                case 'created':
                case 'lastLogin':
                    aVal = a[this.sortField] || new Date(0);
                    bVal = b[this.sortField] || new Date(0);
                    break;
                default:
                    aVal = a[this.sortField] || '';
                    bVal = b[this.sortField] || '';
            }
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    updateSortIndicators() {
        // Remove all existing sort classes
        document.querySelectorAll('.users-table th.sortable').forEach(th => {
            th.classList.remove('sorted');
        });
        
        // Add sort class to current field
        const currentTh = document.querySelector(`[data-sort="${this.sortField}"]`);
        if (currentTh) {
            currentTh.classList.add('sorted');
        }
    }

    handleSelectAll(checked) {
        this.selectedUsers.clear();
        if (checked) {
            this.getCurrentPageUsers().forEach(user => this.selectedUsers.add(user.id));
        }
        this.updateCheckboxes();
    }

    handleUserSelect(userId, checked) {
        if (checked) {
            this.selectedUsers.add(userId);
        } else {
            this.selectedUsers.delete(userId);
        }
        this.updateSelectAllCheckbox();
    }

    updateCheckboxes() {
        const checkboxes = document.querySelectorAll('.user-checkbox');
        checkboxes.forEach(checkbox => {
            const userId = parseInt(checkbox.dataset.userId);
            checkbox.checked = this.selectedUsers.has(userId);
        });
    }

    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('select-all');
        const currentPageUsers = this.getCurrentPageUsers();
        const allSelected = currentPageUsers.length > 0 && 
            currentPageUsers.every(user => this.selectedUsers.has(user.id));
        
        selectAllCheckbox.checked = allSelected;
    }

    getCurrentPageUsers() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.filteredUsers.slice(start, end);
    }

    handlePageSizeChange(newSize) {
        this.pageSize = parseInt(newSize);
        this.currentPage = 1;
        this.renderUsers();
        this.renderPagination();
    }

    handlePagination(e) {
        const button = e.target.closest('.pagination-btn');
        if (!button || button.disabled) return;
        
        const action = button.dataset.action;
        const totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
        
        switch (action) {
            case 'first':
                this.currentPage = 1;
                break;
            case 'prev':
                this.currentPage = Math.max(1, this.currentPage - 1);
                break;
            case 'next':
                this.currentPage = Math.min(totalPages, this.currentPage + 1);
                break;
            case 'last':
                this.currentPage = totalPages;
                break;
            case 'page':
                this.currentPage = parseInt(button.dataset.page);
                break;
        }
        
        this.renderUsers();
        this.renderPagination();
    }

    renderUsers() {
        const tbody = document.getElementById('users-table-body');
        const currentUsers = this.getCurrentPageUsers();
        
        if (currentUsers.length === 0) {
            // Use the professional empty state if available
            if (window.SirsiState) {
                const tableContainer = document.querySelector('#users-table').parentNode;
                window.SirsiState.showEmptyState(tableContainer, {
                    type: 'users',
                    title: 'No users found',
                    description: 'There are no users matching your current filters. Try adjusting your search criteria or add your first user.',
                    actionText: 'Add User',
                    actionCallback: 'function() { userManager.openUserModal(); }'
                });
                return;
            } else {
                // Fallback for when state management is not available
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="empty-state">
                            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                            </svg>
                            <p>No users found</p>
                        </td>
                    </tr>
                `;
                return;
            }
        }
        
        tbody.innerHTML = currentUsers.map(user => `
            <tr>
                <td>
                    <input type="checkbox" class="checkbox user-checkbox" 
                           data-user-id="${user.id}" 
                           ${this.selectedUsers.has(user.id) ? 'checked' : ''}>
                </td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">
                            ${user.firstName.charAt(0)}${user.lastName.charAt(0)}
                        </div>
                        <div class="user-details">
                            <div class="user-name">${user.firstName} ${user.lastName}</div>
                            <div class="user-title">${user.company || 'No company'}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge ${user.role}">${user.role}</span>
                </td>
                <td>
                    <span class="status-badge ${user.status}">${user.status}</span>
                </td>
                <td>${this.formatDate(user.created)}</td>
                <td>${user.lastLogin ? this.formatDate(user.lastLogin) : 'Never'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="userManager.openUserModal(${JSON.stringify(user).replace(/"/g, '&quot;')})" title="Edit User">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="action-btn delete" onclick="userManager.openDeleteModal(${JSON.stringify(user).replace(/"/g, '&quot;')})" title="Delete User">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Bind checkbox events
        document.querySelectorAll('.user-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const userId = parseInt(e.target.dataset.userId);
                this.handleUserSelect(userId, e.target.checked);
            });
        });
        
        this.updateSelectAllCheckbox();
        this.updatePaginationInfo();
    }

    renderPagination() {
        const totalUsers = this.filteredUsers.length;
        const totalPages = Math.ceil(totalUsers / this.pageSize);
        const pagination = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // First and Previous buttons
        paginationHTML += `
            <button class="pagination-btn" data-action="first" ${this.currentPage === 1 ? 'disabled' : ''}>
                ««
            </button>
            <button class="pagination-btn" data-action="prev" ${this.currentPage === 1 ? 'disabled' : ''}>
                «
            </button>
        `;
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `<button class="pagination-btn" data-action="page" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                        data-action="page" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="pagination-btn" data-action="page" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        // Next and Last buttons
        paginationHTML += `
            <button class="pagination-btn" data-action="next" ${this.currentPage === totalPages ? 'disabled' : ''}>
                »
            </button>
            <button class="pagination-btn" data-action="last" ${this.currentPage === totalPages ? 'disabled' : ''}>
                »»
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }

    updatePaginationInfo() {
        const info = document.getElementById('pagination-info');
        const totalUsers = this.filteredUsers.length;
        const start = totalUsers === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, totalUsers);
        
        info.textContent = `Showing ${start} to ${end} of ${totalUsers} entries`;
    }

    updateStats() {
        const totalUsers = this.users.length;
        const activeUsers = this.users.filter(u => u.status === 'active').length;
        const inactiveUsers = this.users.filter(u => u.status === 'inactive').length;
        const adminUsers = this.users.filter(u => u.role === 'admin').length;
        
        document.getElementById('total-users').textContent = totalUsers.toLocaleString();
        document.getElementById('active-users').textContent = activeUsers.toLocaleString();
        document.getElementById('inactive-users').textContent = inactiveUsers.toLocaleString();
        document.getElementById('admin-users').textContent = adminUsers.toLocaleString();
    }

    exportToCSV() {
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Role', 'Status', 'Phone', 'Company', 'Created', 'Last Login'];
        const csvData = [headers];
        
        this.filteredUsers.forEach(user => {
            csvData.push([
                user.id,
                user.firstName,
                user.lastName,
                user.email,
                user.role,
                user.status,
                user.phone || '',
                user.company || '',
                this.formatDate(user.created),
                user.lastLogin ? this.formatDate(user.lastLogin) : 'Never'
            ]);
        });
        
        const csvContent = csvData.map(row => 
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Users exported to CSV successfully', 'success');
    }

    formatDate(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showNotification(message, type = 'info') {
        // Use the professional SirsiNexus toast system if available
        if (window.SirsiToast) {
            window.SirsiToast.show({
                message: message,
                type: type,
                duration: 3000
            });
        } else {
            // Fallback to custom notification system
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 2rem;
                right: 2rem;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                color: white;
                font-weight: 600;
                z-index: 9999;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                background: ${type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#3b82f6'};
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            `;
            
            document.body.appendChild(notification);
            
            // Show notification
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 10);
            
            // Hide and remove notification
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }
    }

    showLoadingState() {
        const tableBody = document.querySelector('#users-table-body');
        if (tableBody && window.SirsiState) {
            // Clear existing content
            tableBody.innerHTML = '';
            
            // Create skeleton table
            const tableContainer = document.querySelector('#users-table').parentNode;
            window.SirsiState.createTableSkeleton(tableContainer, 10, 8);
        }
    }

    hideLoadingState() {
        // Loading state is automatically cleared when renderUsers() is called
        // No additional action needed
    }

    showErrorState(error) {
        const tableContainer = document.querySelector('#users-table').parentNode;
        if (tableContainer && window.SirsiState) {
            window.SirsiState.createErrorBoundary(tableContainer, error, {
                title: 'Failed to load users',
                message: 'There was an error loading the user data. Please try refreshing the page.',
                retryCallback: () => {
                    this.init();
                }
            });
        } else {
            // Fallback error display
            console.error('Failed to load users:', error);
            this.showNotification('Failed to load user data. Please refresh the page.', 'error');
        }
    }

    async deleteUserWithLoading(userId) {
        const deleteBtn = document.querySelector('#confirm-delete-btn');
        
        if (window.SirsiState && deleteBtn) {
            window.SirsiState.setButtonLoading(deleteBtn, true);
        }
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                const user = this.users[userIndex];
                this.users.splice(userIndex, 1);
                this.selectedUsers.delete(userId);
                this.applyFilters();
                this.updateStats();
                this.closeDeleteModal();
                this.showNotification(`User ${user.firstName} ${user.lastName} deleted successfully`, 'success');
            }
        } catch (error) {
            this.showNotification('Failed to delete user. Please try again.', 'error');
            console.error('Error deleting user:', error);
        } finally {
            if (window.SirsiState && deleteBtn) {
                window.SirsiState.setButtonLoading(deleteBtn, false);
            }
        }
    }

    async exportToCSVWithLoading() {
        const exportBtn = document.querySelector('#export-csv-btn');
        
        if (window.SirsiState && exportBtn) {
            window.SirsiState.setButtonLoading(exportBtn, true);
        }
        
        try {
            // Simulate processing delay for large datasets
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.exportToCSV();
        } catch (error) {
            this.showNotification('Failed to export data. Please try again.', 'error');
            console.error('Error exporting CSV:', error);
        } finally {
            if (window.SirsiState && exportBtn) {
                window.SirsiState.setButtonLoading(exportBtn, false);
            }
        }
    }
}

// Initialize the user management system
let userManager;
document.addEventListener('DOMContentLoaded', () => {
    userManager = new UserManagement();
});
