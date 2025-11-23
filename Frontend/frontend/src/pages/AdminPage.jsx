import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Save, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import { Card } from '../components/Card';
import { ConfirmationModal } from '../components/Modal';
import { RoleChip } from '../components/Chips';

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
                                            <td className="px-6 py-4 whitespace-nowrap"><RoleChip role={user.role} /></td>
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

export default AdminPage;
