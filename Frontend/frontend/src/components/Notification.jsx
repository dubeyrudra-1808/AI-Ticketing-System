import React from 'react';
import { Info } from 'lucide-react';

export const Notification = ({ message, type }) => {
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

export const NotificationContainer = ({ notifications }) => (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        {notifications.map(n => (
            <Notification key={n.id} message={n.message} type={n.type} />
        ))}
    </div>
);
