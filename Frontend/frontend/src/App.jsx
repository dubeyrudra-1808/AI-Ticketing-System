import React, { useState } from 'react';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import './App.css';

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
