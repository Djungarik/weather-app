// Navigation and Routing
const Navigation = {
    // Navigate to page
    navigate(page) {
        window.location.href = page;
    },
    
    // Check authentication and redirect if needed
    requireAuth() {
        if (!Auth.isAuthenticated()) {
            this.navigate('index.html');
            return false;
        }
        return true;
    },
    
    // Check admin access
    requireAdmin() {
        if (!Auth.isAuthenticated() || !Auth.isAdmin()) {
            this.navigate('dashboard.html');
            return false;
        }
        return true;
    },
    
    // Initialize navigation for authenticated pages
    initNav() {
        const user = Auth.getCurrentUser();
        if (user) {
            const userInfo = document.getElementById('user-info');
            if (userInfo) {
                userInfo.textContent = `Logged in as: ${user.username}${user.role === 'admin' ? ' (Admin)' : ''}`;
            }
            
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    Auth.logout();
                });
            }
        }
    }
};

