import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { Link } from 'react-router-dom';
// --- FIX: Removed the unused 'Briefcase' icon ---
import { Search } from 'lucide-react';

const fetchRequirements = async () => {
    const { data } = await api.get('/admin/requirements');
    return data.data;
};

const ManageRequirementsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: requirements, isLoading, isError, error } = useQuery({
        queryKey: ['allRequirements'],
        queryFn: fetchRequirements,
    });

    const filteredRequirements = requirements?.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.school.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="text-center p-8">Loading requirements...</div>;
    if (isError) return <div className="text-center p-8 text-red-500">{error.message}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Manage Requirements</h2>
                    <p className="text-gray-500">View and manage all job requirements across all schools.</p>
                </div>
                <div className="relative w-full max-w-xs">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title or school..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Requirement Title</th>
                                <th className="p-4 font-semibold text-gray-600">School</th>
                                <th className="p-4 font-semibold text-gray-600">Date Posted</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequirements?.map(req => (
                                <tr key={req._id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800">{req.title}</td>
                                    <td className="p-4 text-gray-600">{req.school.name}</td>
                                    <td className="p-4 text-gray-600">{new Date(req.postedAt).toLocaleDateString()}</td>
                                    <td className="p-4"><StatusBadge status={req.status} /></td>
                                    <td className="p-4">
                                        <Link
                                            to={`/admin/requirements/${req._id}`}
                                            className="py-1.5 px-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Manage
                                        </Link>
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

const StatusBadge = ({ status }) => {
    const statusStyles = {
        open: 'bg-green-100 text-green-800',
        closed: 'bg-yellow-100 text-yellow-800',
        filled: 'bg-blue-100 text-blue-800',
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

export default ManageRequirementsPage;