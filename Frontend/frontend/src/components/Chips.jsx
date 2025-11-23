import React from 'react';

export const StatusChip = ({ status }) => {
    const styles = {
        open: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${styles[status] || styles.closed}`}>{status?.replace('_', ' ')}</span>;
};

export const PriorityChip = ({ priority }) => {
    const styles = {
        low: 'bg-gray-100 text-gray-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[priority] || styles.low}`}>{priority}</span>;
};

export const RoleChip = ({ role }) => {
    const styles = {
        user: 'bg-blue-100 text-blue-800',
        moderator: 'bg-purple-100 text-purple-800',
        admin: 'bg-green-100 text-green-800',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[role] || styles.user}`}>{role}</span>;
};
