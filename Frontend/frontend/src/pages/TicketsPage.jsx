import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { StatusChip, PriorityChip } from '../components/Chips';

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
                                            <td className="px-6 py-4 whitespace-nowrap"><StatusChip status={ticket.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><PriorityChip priority={ticket.priority} /></td>
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

export default TicketsPage;
