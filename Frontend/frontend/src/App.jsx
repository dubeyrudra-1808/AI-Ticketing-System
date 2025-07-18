import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Shield, LayoutDashboard, Ticket, LogOut, User, Lock, Mail, ChevronRight, Menu, X, PlusCircle, BarChart2, Users, Edit, Save, AlertCircle, Info } from 'lucide-react';

// --- Configuration ---
// In a real app, this would come from an environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- API Service ---
// A helper class to manage API requests, including adding the auth token.
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

// --- Notification Context ---
const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <NotificationContainer notifications={notifications} />
        </NotificationContext.Provider>
    );
};

const useNotification = () => useContext(NotificationContext);

const NotificationContainer = ({ notifications }) => (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {notifications.map(n => (
            <Notification key={n.id} message={n.message} type={n.type} />
        ))}
    </div>
);

const Notification = ({ message, type }) => {
    const baseStyle = "flex items-center gap-3 p-4 rounded-lg shadow-lg animate-fade-in-up";
    const typeStyles = {
        info: "bg-blue-500 text-white",
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
    };

    return (
        <div className={`${baseStyle} ${typeStyles[type]}`}>
            <Info size={20} />
            <span>{message}</span>
        </div>
    );
};


// --- Auth Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.setToken(token);
            api.request('/api/auth/me')
                .then(userData => setUser(userData))
                .catch(() => {
                    localStorage.removeItem('authToken');
                    api.setToken(null);
                    setUser(null);
                })
                .finally(() => setIsAuthLoading(false));
        } else {
            setIsAuthLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const data = await api.login(email, password);
        localStorage.setItem('authToken', data.access_token);
        setToken(data.access_token);
        api.setToken(data.access_token);
        const userData = await api.request('/api/auth/me');
        setUser(userData);
    };
    
    const signup = async (fullName, username, email, password) => {
        const data = await api.signup(fullName, username, email, password);
        localStorage.setItem('authToken', data.access_token);
        setToken(data.access_token);
        api.setToken(data.access_token);
        const userData = await api.request('/api/auth/me');
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        api.setToken(null);
        localStorage.removeItem('authToken');
    };

    const value = { user, token, login, signup, logout, isAuthLoading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

// --- Main App Component ---
export default function App() {
    return (
        <NotificationProvider>
            <AuthProvider>
                <Router />
            </AuthProvider>
        </NotificationProvider>
    );
}

// --- Router Component ---
const Router = () => {
    const { user, isAuthLoading } = useAuth();
    const [page, setPage] = useState('dashboard');
    const [params, setParams] = useState({});

    const navigate = (targetPage, targetParams = {}) => {
        setPage(targetPage);
        setParams(targetParams);
    };

    if (isAuthLoading) {
        return <div className="flex items-center justify-center h-screen bg-gray-100">Loading...</div>;
    }

    if (!user) {
        if (page === 'signup') {
            return <SignupPage navigate={navigate} />;
        }
        return <LoginPage navigate={navigate} />;
    }

    return <MainLayout navigate={navigate} page={page} params={params} />;
};

// --- Main Layout Component ---
const MainLayout = ({ navigate, page, params }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();

    const handleNavigation = (targetPage) => {
        navigate(targetPage);
        setIsSidebarOpen(false);
    };

    const renderPage = () => {
        switch (page) {
            case 'dashboard':
                return <DashboardPage navigate={navigate} />;
            case 'tickets':
                return <TicketsPage navigate={navigate} params={params} />;
            case 'ticketDetail':
                return <TicketDetailPage ticketId={params.id} navigate={navigate} />;
            case 'admin':
                return <AdminPage navigate={navigate} />;
            default:
                return <DashboardPage navigate={navigate} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar 
                user={user} 
                navigate={handleNavigation} 
                onLogout={logout} 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen} 
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-4 bg-white border-b lg:hidden">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">AI Ticketing</h1>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

// --- Reusable Components ---
const Sidebar = ({ user, navigate, onLogout, isSidebarOpen, setIsSidebarOpen }) => {
    const isAdmin = user && user.role === 'admin';

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
            <aside className={`absolute top-0 left-0 w-64 bg-gray-800 text-white h-full z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex-shrink-0 flex flex-col`}>
                <div className="p-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">AI Tickets</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <nav className="mt-6 flex-grow">
                    <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" onClick={() => navigate('dashboard')} />
                    <SidebarItem icon={<Ticket size={20} />} text="My Tickets" onClick={() => navigate('tickets')} />
                    {isAdmin && <SidebarItem icon={<Shield size={20} />} text="Admin" onClick={() => navigate('admin')} />}
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white mr-3">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{user.full_name || user.username}</p>
                            <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center justify-center py-2 px-4 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors">
                        <LogOut size={16} className="mr-2" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

const SidebarItem = ({ icon, text, onClick }) => (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
        {icon}
        <span className="ml-4">{text}</span>
    </a>
);

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow ${className}`}>
        {children}
    </div>
);

const StatCard = ({ title, value, icon, color }) => (
    <Card className="p-4">
        <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    </Card>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div>{children}</div>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirm</button>
                </div>
            </div>
        </Modal>
    );
};

const getStatusChip = (status) => {
    const styles = {
        open: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${styles[status] || styles.closed}`}>{status?.replace('_', ' ')}</span>;
};

const getPriorityChip = (priority) => {
    const styles = {
        low: 'bg-gray-100 text-gray-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[priority] || styles.low}`}>{priority}</span>;
};

const getRoleChip = (role) => {
    const styles = {
        user: 'bg-blue-100 text-blue-800',
        moderator: 'bg-purple-100 text-purple-800',
        admin: 'bg-green-100 text-green-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[role] || styles.user}`}>{role}</span>;
};

// --- Page Components ---

const LoginPage = ({ navigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md m-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Sign in</h1>
                    <p className="mt-2 text-sm text-gray-600">to your AI Ticketing System account</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:bg-indigo-400">
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('signup'); }} className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

const SignupPage = ({ navigate }) => {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await signup(fullName, username, email, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md m-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
                    <p className="mt-2 text-sm text-gray-600">Get started with the AI Ticketing System</p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                        <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </div>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition" />
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:bg-indigo-400">
                            {isLoading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </div>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('login'); }} className="font-medium text-indigo-600 hover:text-indigo-500">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
};

const DashboardPage = ({ navigate }) => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user.role === 'admin') {
            api.getDashboardStats()
                .then(data => setStats(data))
                .catch(console.error)
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [user.role]);

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user.full_name || user.username}!</h2>
            {user.role === 'admin' && (
                isLoading ? <div>Loading stats...</div> :
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard title="Total Tickets" value={stats?.total || 0} icon={<Ticket size={24} className="text-blue-600"/>} color="bg-blue-100" />
                    <StatCard title="Open Tickets" value={stats?.open || 0} icon={<AlertCircle size={24} className="text-yellow-600"/>} color="bg-yellow-100" />
                    <StatCard title="Resolved Tickets" value={stats?.resolved || 0} icon={<Shield size={24} className="text-green-600"/>} color="bg-green-100" />
                    <StatCard title="Urgent Priority" value={stats?.urgent || 0} icon={<AlertCircle size={24} className="text-red-600"/>} color="bg-red-100" />
                </div>
            )}
            <div className="text-center">
                <p className="text-gray-600 mb-4">What would you like to do today?</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => navigate('tickets')} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition">View My Tickets</button>
                    {/* --- MODIFICATION: Only show 'Create Ticket' to users with the 'user' role --- */}
                    {user.role === 'user' && (
                        <button onClick={() => navigate('tickets', { showCreateModal: true })} className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition">Create New Ticket</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const TicketsPage = ({ navigate, params }) => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setCreateModalOpen] = useState(params?.showCreateModal || false);
    const { user } = useAuth(); // Get user from context

    const fetchTickets = useCallback(() => {
        setIsLoading(true);
        api.getTickets()
            .then(data => setTickets(data))
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">My Tickets</h2>
                {/* --- MODIFICATION: Only show 'Create Ticket' to users with the 'user' role --- */}
                {user.role === 'user' && (
                    <button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition">
                        <PlusCircle size={20} />
                        Create Ticket
                    </button>
                )}
            </div>
            <Card>
                {isLoading ? <div className="p-6 text-center">Loading tickets...</div> :
                 error ? <div className="p-6 text-center text-red-500">{error}</div> :
                 <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                             <tr>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                             </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {tickets.map(ticket => (
                                 <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate('ticketDetail', { id: ticket.id })}>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.title}</td>
                                     <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(ticket.status)}</td>
                                     <td className="px-6 py-4 whitespace-nowrap">{getPriorityChip(ticket.priority)}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                         <span className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end">
                                             View <ChevronRight size={16} className="ml-1" />
                                         </span>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
                }
            </Card>
            <CreateTicketModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onTicketCreated={() => { fetchTickets(); setCreateModalOpen(false); }} />
        </div>
    );
};

const CreateTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.createTicket(title, description);
            addNotification('Ticket created successfully!', 'success');
            onTicketCreated();
            setTitle('');
            setDescription('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Ticket">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" rows="4" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isLoading ? 'Creating...' : 'Create Ticket'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const TicketDetailPage = ({ ticketId, navigate }) => {
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const { addNotification } = useNotification();

    const fetchTicket = useCallback(() => {
        setIsLoading(true);
        api.getTicketById(ticketId)
            .then(data => setTicket(data))
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [ticketId]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);
    
    const handleStatusChange = async (newStatus) => {
        try {
            await api.updateTicketStatus(ticketId, newStatus);
            addNotification('Ticket status updated successfully!', 'success');
            fetchTicket(); // Refresh ticket data
        } catch (err) {
            addNotification(`Failed to update status: ${err.message}`, 'error');
        }
    };

    if (isLoading) return <div>Loading ticket...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!ticket) return <div>Ticket not found.</div>;

    const canUpdateStatus = user.role === 'admin' || (user.role === 'moderator' && user.id === ticket.assigned_to);

    return (
        <div>
            <button onClick={() => navigate('tickets')} className="text-indigo-600 mb-4">&larr; Back to Tickets</button>
            <Card>
                <div className="p-6 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{ticket.title}</h2>
                            <p className="text-sm text-gray-500">Created on {new Date(ticket.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {getPriorityChip(ticket.priority)}
                            {getStatusChip(ticket.status)}
                        </div>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                            <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
                        </div>
                        {ticket.ai_notes && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-blue-800 mb-2">AI Analysis Notes</h4>
                                <p className="text-blue-700 text-sm whitespace-pre-wrap">{ticket.ai_notes}</p>
                            </div>
                        )}
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Details</h4>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li><strong>Type:</strong> <span className="capitalize">{ticket.ticket_type || 'N/A'}</span></li>
                                <li><strong>Created by:</strong> <span className="truncate">{ticket.created_by}</span></li>
                                <li><strong>Assigned to:</strong> <span className="truncate">{ticket.assigned_to || 'Unassigned'}</span></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Required Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {ticket.required_skills.map(skill => (
                                    <span key={skill} className="bg-gray-200 text-gray-800 px-2 py-1 text-xs rounded-full">{skill}</span>
                                ))}
                            </div>
                        </div>
                        {canUpdateStatus && (
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Update Status</h4>
                                <select 
                                    onChange={(e) => handleStatusChange(e.target.value)} 
                                    value={ticket.status}
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const { addNotification } = useNotification();

    const fetchUsers = useCallback(() => {
        setIsLoading(true);
        api.getUsers()
            .then(data => setUsers(data))
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleUpdateUser = async (userId, role, skills) => {
        try {
            await api.updateUser(userId, role, skills.split(',').map(s => s.trim()).filter(Boolean));
            addNotification('User updated successfully!', 'success');
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            addNotification(`Failed to update user: ${err.message}`, 'error');
        }
    };

    const handleRerunAI = async () => {
        try {
            await api.rerunAiAnalysis();
            addNotification("AI re-analysis triggered for all tickets.", 'success');
        } catch (err) {
            addNotification(`Failed to trigger AI analysis: ${err.message}`, 'error');
        } finally {
            setConfirmModalOpen(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h2>
            <Card>
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                    <div className="mt-4">
                        <button
                            onClick={() => setConfirmModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-semibold"
                        >
                            🔁 Re-run AI Analysis
                        </button>
                    </div>
                </div>
                {isLoading ? (
                    <div className="p-6 text-center">Loading users...</div>
                ) : error ? (
                    <div className="p-6 text-center text-red-500">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) =>
                                    editingUser?.id === user.id ? (
                                        <EditUserRow
                                            key={user.id}
                                            user={editingUser}
                                            setEditingUser={setEditingUser}
                                            onSave={handleUpdateUser}
                                        />
                                    ) : (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.full_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{getRoleChip(user.role)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.skills.join(', ')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => setEditingUser(user)}
                                                    className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleRerunAI}
                title="Confirm AI Analysis"
            >
                Are you sure you want to re-run the AI analysis for all tickets? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

const EditUserRow = ({ user, setEditingUser, onSave }) => {
    const [role, setRole] = useState(user.role);
    const [skills, setSkills] = useState(user.skills.join(', '));
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(user.id, role, skills);
        setIsSaving(false);
    };

    return (
        <tr className="bg-indigo-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.full_name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
            <td className="px-6 py-4">
                <select value={role} onChange={e => setRole(e.target.value)} className="border-gray-300 rounded-md text-sm">
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                </select>
            </td>
            <td className="px-6 py-4">
                <input type="text" value={skills} onChange={e => setSkills(e.target.value)} className="border-gray-300 rounded-md w-full text-sm" placeholder="python, react, etc." />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                <button onClick={handleSave} disabled={isSaving} className="text-green-600 hover:text-green-900 flex items-center gap-1 disabled:opacity-50">
                    <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditingUser(null)} className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                    <X size={14} /> Cancel
                </button>
            </td>
        </tr>
    );
};
