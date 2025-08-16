// src/pages/school/SchoolCandidatesPage.js

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { Search, Briefcase, User, Mail, Tag } from 'lucide-react';

const fetchSchoolCandidates = async () => {
    const { data } = await api.get('/schools/candidates');
    return data.data;
};

const SchoolCandidatesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: candidates, isLoading, isError, error } = useQuery({
        queryKey: ['schoolCandidates'],
        queryFn: fetchSchoolCandidates,
    });

    const filteredCandidates = candidates?.filter(candidate =>
        candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.pipelineInfo.some(info => info.requirementTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) return <div className="text-center p-8">Loading candidates...</div>;
    if (isError) return <div className="text-center p-8 text-red-500">{error.message}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Candidate Pipeline</h2>
                    <p className="text-gray-500">All candidates associated with your requirements.</p>
                </div>
                <div className="relative w-full max-w-xs">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search by name, email, or role..."
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
                                <th className="p-4 font-semibold text-gray-600">Candidate</th>
                                <th className="p-4 font-semibold text-gray-600">Applied For</th>
                                <th className="p-4 font-semibold text-gray-600">Pipeline Status</th>
                                <th className="p-4 font-semibold text-gray-600">Overall Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCandidates?.map(candidate => (
                                <tr key={candidate._id} className="border-b">
                                    <td className="p-4 font-medium">
                                        <div className="flex items-center space-x-2">
                                            <User size={16} className="text-gray-500"/>
                                            <span className="text-gray-800">{candidate.fullName}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                             <Mail size={16} className="text-gray-400"/>
                                            <span className="text-xs text-gray-500">{candidate.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-700">
                                        {candidate.pipelineInfo.map(info => (
                                            <div key={info.requirementTitle} className="flex items-center space-x-2">
                                                <Briefcase size={14} className="text-gray-400"/>
                                                <span>{info.requirementTitle}</span>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="p-4 text-sm text-gray-700">
                                        {candidate.pipelineInfo.map(info => (
                                             <div key={info.status} className="flex items-center space-x-2">
                                                <Tag size={14} className="text-gray-400"/>
                                                <span>{info.status}</span>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="p-4">
                                        <span className={`capitalize text-xs font-semibold px-2.5 py-1 rounded-full ${
                                            candidate.status === 'hired' ? 'bg-green-100 text-green-700' : 
                                            candidate.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredCandidates?.length === 0 && (
                    <div className="text-center p-8 text-gray-500">
                        <User size={48} className="mx-auto text-gray-300" />
                        <p className="mt-4">No candidates found in your pipeline.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchoolCandidatesPage;