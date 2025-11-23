import React from 'react';
import { LayoutDashboard, Ticket, Shield, LogOut, X } from 'lucide-react';

export const SidebarItem = ({ icon, text, onClick }) => (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
        {icon}
        <span className="ml-4">{text}</span>
    </a>
);

export const Sidebar = ({ user, navigate, onLogout, isSidebarOpen, setIsSidebarOpen }) => {
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
