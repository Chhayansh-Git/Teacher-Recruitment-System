// src/pages/school/ViewRequirementsPage.js

import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api';
import { Eye, Edit, Trash2, Plus, Search, Clock, CheckCircle, Briefcase } from 'lucide-react';

const fetchRequirements = async () => {
    const { data } = await api.get('/schools/requirements');
    return data.data;
};

const deleteRequirement = (id) => {
    return api.delete(`/schools/requirements/${id}`);
};

const ViewRequirementsPage = () => {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get('status');
    const [searchTerm, setSearchTerm] = React.useState('');

    const { data: requirements, isLoading, isError, error } = useQuery({
        queryKey: ['requirements'],
        queryFn: fetchRequirements,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteRequirement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['requirements'] });
            alert('Requirement archived successfully!');
        },
        onError: (err) => {
            alert('Failed to archive the requirement.');
            console.error(err);
        }
    });

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to archive this requirement?')) {
            deleteMutation.mutate(id);
        }
    };

    const filteredRequirements = useMemo(() => {
        if (!requirements) return [];
        let filtered = requirements;
        if (statusFilter) {
            filtered = filtered.filter(req => req.status.toLowerCase() === statusFilter.toLowerCase());
        }
        if (searchTerm) {
            filtered = filtered.filter(req => req.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return filtered;
    }, [requirements, statusFilter, searchTerm]);

    if (isLoading) return <div className="text-center p-8">Loading requirements...</div>;
    if (isError) return <div className="text-center p-8 text-red-500">{error.message}</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Manage Requirements</h2>
                    <p className="text-gray-500">View, edit, or track all your posted job requirements.</p>
                </div>
                <Link to="/school/requirements/new" className="flex items-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                    <Plus size={18} />
                    <span>Post New Requirement</span>
                </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="relative w-full max-w-xs mb-4">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Title</th>
                                <th className="p-4 font-semibold text-gray-600">Date Posted</th>
                                <th className="p-4 font-semibold text-gray-600">Positions</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequirements.map(req => (
                                <tr key={req._id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800">{req.title}</td>
                                    <td className="p-4 text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-gray-600 text-center">{req.noOfCandidates}</td>
                                    <td className="p-4"><StatusBadge status={req.status} /></td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <Link to={`/school/requirements/${req._id}`} className="p-2 rounded-full transition text-gray-600 hover:bg-gray-100" title="View Details"><Eye size={16} /></Link>
                                            <Link to={`/school/requirements/edit/${req._id}`} className="p-2 rounded-full transition text-blue-600 hover:bg-blue-100" title="Edit"><Edit size={16} /></Link>
                                            <button onClick={() => handleDelete(req._id)} className="p-2 rounded-full transition text-red-600 hover:bg-red-100" title="Archive" disabled={deleteMutation.isPending}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredRequirements.length === 0 && (
                        <div className="text-center p-8 text-gray-500">
                            <Briefcase size={48} className="mx-auto text-gray-300" />
                            <p className="mt-4">No requirements found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const statusStyles = {
        open: 'bg-green-100 text-green-800',
        closed: 'bg-yellow-100 text-yellow-800',
        filled: 'bg-blue-100 text-blue-800',
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize flex items-center space-x-1.5 ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status === 'open' ? <CheckCircle size={14}/> : <Clock size={14}/>}
            <span>{status}</span>
        </span>
    );
};

export default ViewRequirementsPage;