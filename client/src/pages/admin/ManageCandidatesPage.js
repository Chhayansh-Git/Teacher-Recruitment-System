import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
// --- FIX: Removed the unused 'Users' icon from this import ---
import { Search, CheckCircle, Clock } from 'lucide-react';

// Fetcher function for TanStack Query
const fetchCandidates = async () => {
    // We assume the endpoint for an admin to get all candidates is /admin/candidates
    // based on the getAllCandidates controller function.
    const { data } = await api.get('/admin/candidates'); 
    return data.data;
};

const ManageCandidatesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: candidates, isLoading, isError, error } = useQuery({
        queryKey: ['candidates'],
        queryFn: fetchCandidates,
    });

    const filteredCandidates = candidates?.filter(candidate =>
        candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="text-center p-8">Loading candidates...</div>;
    if (isError) return <div className="text-center p-8 text-red-500">{error.message}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Manage Candidates</h2>
                    <p className="text-gray-500">View and search all registered candidates.</p>
                </div>
                 <div className="relative w-full max-w-xs">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search by name or email..."
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
                                <th className="p-4 font-semibold text-gray-600">Name</th>
                                <th className="p-4 font-semibold text-gray-600">Contact</th>
                                <th className="p-4 font-semibold text-gray-600">Position</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCandidates?.map(candidate => (
                                <tr key={candidate._id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800">{candidate.fullName}</td>
                                    <td className="p-4 text-gray-600">{candidate.email}<br/><span className="text-xs text-gray-400">{candidate.contact}</span></td>
                                    <td className="p-4 text-gray-600">{candidate.position} <span className="text-xs text-gray-400">({candidate.type})</span></td>
                                    <td className="p-4">
                                        {candidate.verified ? (
                                            <span className="flex items-center space-x-1.5 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                                                <CheckCircle size={14} />
                                                <span>Verified</span>
                                            </span>
                                        ) : (
                                            <span className="flex items-center space-x-1.5 text-xs font-semibold text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full">
                                                <Clock size={14} />
                                                <span>Pending</span>
                                            </span>
                                        )}
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

export default ManageCandidatesPage;