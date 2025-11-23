import React, { useState, useEffect } from 'react';
import { Ticket, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { StatCard } from '../components/Card';

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
                        <StatCard title="Total Tickets" value={stats?.total || 0} icon={<Ticket size={24} className="text-blue-600" />} color="bg-blue-100" />
                        <StatCard title="Open Tickets" value={stats?.open || 0} icon={<AlertCircle size={24} className="text-yellow-600" />} color="bg-yellow-100" />
                        <StatCard title="Resolved Tickets" value={stats?.resolved || 0} icon={<Shield size={24} className="text-green-600" />} color="bg-green-100" />
                        <StatCard title="Urgent Priority" value={stats?.urgent || 0} icon={<AlertCircle size={24} className="text-red-600" />} color="bg-red-100" />
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

export default DashboardPage;
