const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log('Configured API URL:', API_BASE_URL);

class ApiService {
    constructor() {
        this.token = null;
    }

    setToken(token) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`[API] Requesting: ${url}`);
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // --- Auth Endpoints ---
    login(email, password) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    signup(fullName, username, email, password) {
        return this.request('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ full_name: fullName, username, email, password }),
        });
    }

    // --- Ticket Endpoints ---
    getTickets() {
        return this.request('/api/tickets');
    }
    
    getTicketById(ticketId) {
        return this.request(`/api/tickets/${ticketId}`);
    }

    createTicket(title, description) {
        return this.request('/api/tickets', {
            method: 'POST',
            body: JSON.stringify({ title, description }),
        });
    }
    
    updateTicketStatus(ticketId, status) {
        return this.request(`/api/tickets/${ticketId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    }

    // --- Admin Endpoints ---
    getUsers() {
        return this.request('/api/admin/users');
    }
    
    getDashboardStats() {
        return this.request('/api/tickets/stats/dashboard');
    }

    updateUser(userId, role, skills) {
        return this.request(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ user_id: userId, role, skills }),
        });
    }
    rerunAiAnalysis() {
        return this.request('/api/admin/rerun-ai', {
            method: 'POST',
        });
    }
}

const api = new ApiService();
export default api;
