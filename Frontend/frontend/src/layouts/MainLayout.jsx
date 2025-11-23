import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import DashboardPage from '../pages/DashboardPage';
import TicketsPage from '../pages/TicketsPage';
import TicketDetailPage from '../pages/TicketDetailPage';
import AdminPage from '../pages/AdminPage';

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

export default MainLayout;
