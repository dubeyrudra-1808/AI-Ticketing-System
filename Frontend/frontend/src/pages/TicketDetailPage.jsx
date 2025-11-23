import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { Card } from '../components/Card';
import { StatusChip, PriorityChip } from '../components/Chips';

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
                            <PriorityChip priority={ticket.priority} />
                            <StatusChip status={ticket.status} />
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

export default TicketDetailPage;
