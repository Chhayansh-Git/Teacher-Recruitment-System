import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api';
// --- FIX: Removed the unused 'Mail' icon ---
import { Edit, Trash2, Plus, RefreshCw } from 'lucide-react';

const fetchTemplates = async () => {
    const { data } = await api.get('/email-templates');
    return data.data; 
};

const deleteTemplate = (key) => {
    return api.delete(`/email-templates/${key}`);
};

const seedDefaults = () => {
    return api.post('/email-templates/seed-defaults');
};

const ManageEmailTemplatesPage = () => {
    const queryClient = useQueryClient();

    const { data: templates, isLoading, isError, error } = useQuery({
        queryKey: ['emailTemplates'],
        queryFn: fetchTemplates,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTemplate,
        onSuccess: () => {
            alert('Template deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
        },
        onError: (err) => {
            alert(`Error: ${err.response?.data?.error || 'Could not delete template.'}`);
        }
    });

    const seedMutation = useMutation({
        mutationFn: seedDefaults,
        onSuccess: () => {
            alert('Default templates restored successfully!');
            queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
        },
        onError: (err) => {
            alert(`Error: ${err.response?.data?.error || 'Could not restore defaults.'}`);
        }
    });

    const handleDelete = (key) => {
        if (window.confirm('Are you sure you want to delete this template? This cannot be undone.')) {
            deleteMutation.mutate(key);
        }
    };
    
    const handleSeed = () => {
        if (window.confirm('Are you sure you want to restore all default templates? This may overwrite existing templates.')) {
            seedMutation.mutate();
        }
    };

    if (isLoading) return <div className="text-center p-8">Loading templates...</div>;
    if (isError) return <div className="text-center p-8 text-red-500">{error.message}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Email Templates</h2>
                    <p className="text-gray-500">Manage automated emails sent by the system.</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={handleSeed} className="flex items-center space-x-2 py-2 px-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition">
                        <RefreshCw size={16} /><span>Restore Defaults</span>
                    </button>
                    <Link to="/admin/email-templates/new" className="flex items-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                        <Plus size={18} /><span>Create Template</span>
                    </Link>
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Template Key</th>
                                <th className="p-4 font-semibold text-gray-600">Subject</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates?.map(template => (
                                <tr key={template.key} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-mono text-sm text-gray-800 bg-gray-50 rounded">{template.key}</td>
                                    <td className="p-4 text-gray-600">{template.subject}</td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <Link to={`/admin/email-templates/edit/${template.key}`} className="p-2 rounded-full hover:bg-blue-100 text-blue-600" title="Edit"><Edit size={16} /></Link>
                                            {!template.reserved && (
                                                <button onClick={() => handleDelete(template.key)} className="p-2 rounded-full hover:bg-red-100 text-red-600" title="Delete" disabled={deleteMutation.isPending}><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageEmailTemplatesPage;