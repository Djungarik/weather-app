// Authentication and Session Management
const Auth = {
    API_BASE_URL: 'http://localhost:8000',
    
    // Check if user is logged in
    isAuthenticated() {
        const user = localStorage.getItem('currentUser');
        return user !== null;
    },
    
    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },
    
    // Login
    async login(username, password) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }
            
            const data = await response.json();
            
            // Store user session
            localStorage.setItem('currentUser', JSON.stringify({
                username: data.username,
                role: data.role || 'user',
                token: data.token
            }));
            
            return { success: true, data };
        } catch (error) {
            // Demo mode: allow login with any credentials
            if (error.message.includes('Failed to fetch')) {
                const demoUser = {
                    username: username,
                    role: username === 'admin' ? 'admin' : 'user',
                    token: 'demo-token-' + Date.now()
                };
                localStorage.setItem('currentUser', JSON.stringify(demoUser));
                return { success: true, data: demoUser };
            }
            return { success: false, error: error.message };
        }
    },
    
    // Register
    async register(username, email, password) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Registration failed');
            }
            
            const data = await response.json();
            
            // Auto-login after registration
            localStorage.setItem('currentUser', JSON.stringify({
                username: data.username,
                role: data.role || 'user',
                token: data.token
            }));
            
            return { success: true, data };
        } catch (error) {
            // Demo mode: allow registration
            if (error.message.includes('Failed to fetch')) {
                const demoUser = {
                    username: username,
                    role: 'user',
                    token: 'demo-token-' + Date.now()
                };
                localStorage.setItem('currentUser', JSON.stringify(demoUser));
                return { success: true, data: demoUser };
            }
            return { success: false, error: error.message };
        }
    },
    
    // Logout
    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('savedLocation');
        window.location.href = 'index.html';
    },
    
    // Check if user is admin
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },
    
    // Get auth token
    getToken() {
        const user = this.getCurrentUser();
        return user ? user.token : null;
    }
};

