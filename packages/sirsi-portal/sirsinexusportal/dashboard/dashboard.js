/**
 * Dashboard Controller
 * Manages all dashboard functionality including navigation, data loading, and user interactions
 */

class DashboardController {
    constructor() {
        this.currentSection = 'overview';
        this.userProfile = null;
        this.projects = [];
        this.activity = [];
        this.init();
    }

    async init() {
        // Wait for auth service to initialize
        await this.waitForAuth();
        
        // Check authentication
        if (!authService.isAuthenticated()) {
            window.location.href = '/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return;
        }

        // Load user data
        await this.loadUserData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup navigation
        this.setupNavigation();
        
        // Load initial data
        await this.loadDashboardData();
        
        // Setup real-time listeners
        this.setupRealtimeListeners();
    }

    async waitForAuth() {
        // Wait for auth service to be ready
        let attempts = 0;
        while (!window.authService && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.authService) {
            throw new Error('Auth service not available');
        }

        // Wait for auth initialization
        while (!authService.initialized && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    async loadUserData() {
        this.userProfile = authService.getUserProfile();
        const user = authService.getCurrentUser();
        
        if (this.userProfile) {
            // Update UI with user info
            this.updateUserInfo();
        } else if (user) {
            // Profile doesn't exist, create it
            await authService.createUserProfile(user);
            this.userProfile = authService.getUserProfile();
            this.updateUserInfo();
        }
    }

    updateUserInfo() {
        if (!this.userProfile) return;
        
        // Update sidebar user info
        const userName = document.getElementById('userName');
        const avatarInitial = document.getElementById('avatarInitial');
        const userPlan = document.getElementById('userPlan');
        
        const displayName = this.userProfile.displayName || this.userProfile.email || 'User';
        userName.textContent = displayName;
        avatarInitial.textContent = displayName.charAt(0).toUpperCase();
        
        // Update plan display
        const plan = this.userProfile.subscription?.plan || 'free';
        const planNames = {
            'free': 'Free Plan',
            'starter': 'Starter Plan',
            'professional': 'Professional Plan',
            'enterprise': 'Enterprise Plan'
        };
        userPlan.textContent = planNames[plan] || 'Free Plan';
        
        // Update profile form
        this.updateProfileForm();
    }

    updateProfileForm() {
        if (!this.userProfile) return;
        
        document.getElementById('profileName').value = this.userProfile.displayName || '';
        document.getElementById('profileEmail').value = this.userProfile.email || '';
        document.getElementById('profilePhone').value = this.userProfile.phoneNumber || '';
        document.getElementById('profileCompany').value = this.userProfile.company || '';
        document.getElementById('profileBio').value = this.userProfile.bio || '';
    }

    setupEventListeners() {
        // Mobile menu toggle
        document.getElementById('mobileMenuToggle')?.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('-translate-x-full');
        });

        // Sign out button
        document.getElementById('signOutBtn').addEventListener('click', async () => {
            if (confirm('Are you sure you want to sign out?')) {
                await authService.signOut();
            }
        });

        // Profile form submission
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveProfile();
        });
    }

    setupNavigation() {
        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const section = e.state?.section || 'overview';
            this.showSection(section);
        });

        // Load initial section from URL hash
        const hash = window.location.hash.slice(1) || 'overview';
        this.navigateToSection(hash);
    }

    navigateToSection(section) {
        // Update URL
        history.pushState({ section }, '', `#${section}`);
        
        // Show section
        this.showSection(section);
    }

    showSection(section) {
        this.currentSection = section;
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.add('hidden');
        });
        
        // Show selected section
        const selectedSection = document.getElementById(section);
        if (selectedSection) {
            selectedSection.classList.remove('hidden');
            selectedSection.classList.add('content-fade');
        }
        
        // Update navigation active state
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.section === section) {
                item.classList.add('bg-purple-50', 'text-purple-600');
                item.classList.remove('text-gray-700');
            } else {
                item.classList.remove('bg-purple-50', 'text-purple-600');
                item.classList.add('text-gray-700');
            }
        });
        
        // Update page title
        const titles = {
            'overview': 'Dashboard',
            'profile': 'Profile',
            'projects': 'Projects',
            'subscription': 'Subscription',
            'activity': 'Activity',
            'settings': 'Settings'
        };
        document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
        
        // Load section-specific data
        this.loadSectionData(section);
    }

    async loadSectionData(section) {
        switch(section) {
            case 'overview':
                await this.loadOverviewData();
                break;
            case 'projects':
                await this.loadProjects();
                break;
            case 'activity':
                await this.loadFullActivity();
                break;
            case 'subscription':
                await this.loadSubscriptionData();
                break;
        }
    }

    async loadDashboardData() {
        // Load overview stats
        await this.loadOverviewData();
    }

    async loadOverviewData() {
        try {
            const db = firebase.firestore();
            const userId = authService.getCurrentUser()?.uid;
            
            if (!userId) return;
            
            // Load projects count
            const projectsSnapshot = await db.collection('projects')
                .where('owner', '==', userId)
                .get();
            
            document.getElementById('projectCount').textContent = projectsSnapshot.size;
            
            // Load API calls (mock data for now)
            document.getElementById('apiCalls').textContent = Math.floor(Math.random() * 1000);
            
            // Load storage used (mock data for now)
            document.getElementById('storageUsed').textContent = Math.floor(Math.random() * 500) + ' MB';
            
            // Load billing (based on subscription)
            const plan = this.userProfile?.subscription?.plan || 'free';
            const billing = {
                'free': '$0',
                'starter': '$29',
                'professional': '$99',
                'enterprise': 'Contact us'
            };
            document.getElementById('monthlyBill').textContent = billing[plan] || '$0';
            
            // Load recent activity
            await this.loadRecentActivity();
            
        } catch (error) {
            console.error('Error loading overview data:', error);
        }
    }

    async loadRecentActivity() {
        try {
            const db = firebase.firestore();
            const userId = authService.getCurrentUser()?.uid;
            
            if (!userId) return;
            
            // Load recent activity logs
            const activitySnapshot = await db.collection('activity_logs')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(5)
                .get();
            
            const activityList = document.getElementById('activityList');
            
            if (activitySnapshot.empty) {
                activityList.innerHTML = '<div class="text-gray-500 text-center py-8">No recent activity</div>';
                return;
            }
            
            activityList.innerHTML = '';
            
            activitySnapshot.forEach(doc => {
                const activity = doc.data();
                const item = this.createActivityItem(activity);
                activityList.appendChild(item);
            });
            
        } catch (error) {
            console.error('Error loading recent activity:', error);
            // Show some mock activity for demonstration
            this.showMockActivity();
        }
    }

    showMockActivity() {
        const activityList = document.getElementById('activityList');
        const mockActivities = [
            { action: 'Logged in', timestamp: new Date(), icon: 'login' },
            { action: 'Updated profile', timestamp: new Date(Date.now() - 3600000), icon: 'profile' },
            { action: 'Created new project', timestamp: new Date(Date.now() - 7200000), icon: 'project' }
        ];
        
        activityList.innerHTML = '';
        
        mockActivities.forEach(activity => {
            const item = this.createActivityItem(activity);
            activityList.appendChild(item);
        });
    }

    createActivityItem(activity) {
        const item = document.createElement('div');
        item.className = 'flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg';
        
        const iconColors = {
            'login': 'text-green-600 bg-green-100',
            'profile': 'text-blue-600 bg-blue-100',
            'project': 'text-purple-600 bg-purple-100',
            'default': 'text-gray-600 bg-gray-100'
        };
        
        const iconClass = iconColors[activity.icon] || iconColors.default;
        
        item.innerHTML = `
            <div class="p-2 rounded-lg ${iconClass}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium">${activity.action}</p>
                <p class="text-xs text-gray-500">${this.formatTime(activity.timestamp)}</p>
            </div>
        `;
        
        return item;
    }

    formatTime(timestamp) {
        if (!timestamp) return 'Just now';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    }

    async loadProjects() {
        try {
            const db = firebase.firestore();
            const userId = authService.getCurrentUser()?.uid;
            
            if (!userId) return;
            
            const projectsSnapshot = await db.collection('projects')
                .where('owner', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const projectsList = document.getElementById('projectsList');
            
            if (projectsSnapshot.empty) {
                projectsList.innerHTML = `
                    <div class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        <p>No projects yet</p>
                        <p class="text-sm mt-2">Create your first project to get started</p>
                    </div>
                `;
                return;
            }
            
            projectsList.innerHTML = '';
            
            projectsSnapshot.forEach(doc => {
                const project = { id: doc.id, ...doc.data() };
                const card = this.createProjectCard(project);
                projectsList.appendChild(card);
            });
            
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer';
        
        card.innerHTML = `
            <div class="mb-4">
                <h4 class="text-lg font-semibold">${project.name}</h4>
                <p class="text-sm text-gray-600 mt-1">${project.description || 'No description'}</p>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-500">
                <span>${this.formatTime(project.createdAt)}</span>
                <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
            </div>
        `;
        
        card.addEventListener('click', () => {
            // Navigate to project details (to be implemented)
            console.log('Navigate to project:', project.id);
        });
        
        return card;
    }

    async loadFullActivity() {
        try {
            const db = firebase.firestore();
            const userId = authService.getCurrentUser()?.uid;
            
            if (!userId) return;
            
            const activitySnapshot = await db.collection('activity_logs')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(20)
                .get();
            
            const fullActivityList = document.getElementById('fullActivityList');
            
            if (activitySnapshot.empty) {
                fullActivityList.innerHTML = '<div class="text-gray-500 text-center py-8">No activity recorded</div>';
                return;
            }
            
            fullActivityList.innerHTML = '';
            
            activitySnapshot.forEach(doc => {
                const activity = doc.data();
                const item = this.createActivityItem(activity);
                fullActivityList.appendChild(item);
            });
            
        } catch (error) {
            console.error('Error loading full activity:', error);
            // Show mock data
            const fullActivityList = document.getElementById('fullActivityList');
            fullActivityList.innerHTML = '<div class="text-gray-500 text-center py-8">Activity tracking will be available soon</div>';
        }
    }

    async loadSubscriptionData() {
        // Update subscription display based on user profile
        const plan = this.userProfile?.subscription?.plan || 'free';
        
        // This would typically load from your billing provider
        // For now, we'll use the data from the user profile
    }

    async saveProfile() {
        const updates = {
            displayName: document.getElementById('profileName').value,
            phoneNumber: document.getElementById('profilePhone').value,
            company: document.getElementById('profileCompany').value,
            bio: document.getElementById('profileBio').value
        };
        
        // Show loading state
        const submitBtn = document.querySelector('#profileForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;
        
        try {
            const result = await authService.updateProfile(updates);
            
            if (result.success) {
                this.userProfile = result.profile;
                this.updateUserInfo();
                this.showNotification('Profile updated successfully', 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showNotification('Failed to update profile', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    setupRealtimeListeners() {
        const db = firebase.firestore();
        const userId = authService.getCurrentUser()?.uid;
        
        if (!userId) return;
        
        // Listen for profile changes
        this.profileUnsubscribe = db.collection('users').doc(userId)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    this.userProfile = { id: doc.id, ...doc.data() };
                    this.updateUserInfo();
                }
            });
        
        // Listen for new projects
        this.projectsUnsubscribe = db.collection('projects')
            .where('owner', '==', userId)
            .onSnapshot((snapshot) => {
                // Update project count
                document.getElementById('projectCount').textContent = snapshot.size;
            });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'error' ? 'bg-red-500' : 
            type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        } text-white transform transition-transform duration-300 translate-y-full`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-y-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-y-full');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    cleanup() {
        // Clean up Firestore listeners
        if (this.profileUnsubscribe) {
            this.profileUnsubscribe();
        }
        if (this.projectsUnsubscribe) {
            this.projectsUnsubscribe();
        }
    }
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dashboardController = new DashboardController();
    });
} else {
    window.dashboardController = new DashboardController();
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.dashboardController) {
        window.dashboardController.cleanup();
    }
});
