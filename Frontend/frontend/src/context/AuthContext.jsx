import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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

export const useAuth = () => useContext(AuthContext);
