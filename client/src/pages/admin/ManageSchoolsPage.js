// src/pages/admin/ManageSchoolsPage.js

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { Building, CheckCircle, Clock, AlertTriangle, PlayCircle } from 'lucide-react';
import SchoolDetailsModal from '../../components/admin/SchoolDetailsModal';
import AdminCandidateDetailsModal from '../../components/admin/AdminCandidateDetailsModal';

const fetchSchools = async () => {
    const { data } = await api.get('/admin/schools');
    return data.data;
};

const verifySchool = (schoolId) => api.put(`/admin/verify-school/${schoolId}`);
const updateSchoolStatus = ({ schoolId, isSuspended }) => {
    return api.put(`/admin/schools/${schoolId}/status`, { isSuspended });
};

const ManageSchoolsPage = () => {
    const queryClient = useQueryClient();
    const [selectedSchoolId, setSelectedSchoolId] = useState(null);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);

    const { data: schools, isLoading, isError, error } = useQuery({
        queryKey: ['schools'],
        queryFn: fetchSchools,
    });

    const verifyMutation = useMutation({
        mutationFn: verifySchool,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schools'] });
            alert('School verified successfully!');
        },
        onError: () => alert('Failed to verify school.'),
    });

    const statusMutation = useMutation({
        mutationFn: updateSchoolStatus,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['schools'] });
            if (selectedSchoolId === data.data._id) {
                queryClient.invalidateQueries({ queryKey: ['school', selectedSchoolId] });
            }
            alert(data.data.message || 'School status updated!');
        },
        onError: () => alert('Failed to update school status.'),
    });

    const handleVerifyClick = (e, schoolId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to verify this school?')) {
            verifyMutation.mutate(schoolId);
        }
    };
    
    const handleStatusClick = (e, schoolId, isSuspended) => {
        e.stopPropagation();
        const action = isSuspended ? 'suspend' : 'unsuspend';
        if (window.confirm(`Are you sure you want to ${action} this school?`)) {
            statusMutation.mutate({ schoolId, isSuspended });
        }
    };

    const handleCandidateClick = (candidateId) => {
        setSelectedCandidateId(candidateId);
    };

    if (isLoading) return <div className="text-center p-8">Loading schools...</div>;
    if (isError) return <div className="text-center p-8 text-red-500">{error.message}</div>;

    return (
        <>
            <SchoolDetailsModal 
                isOpen={!!selectedSchoolId}
                onClose={() => setSelectedSchoolId(null)}
                schoolId={selectedSchoolId}
                onCandidateClick={handleCandidateClick}
            />
            <AdminCandidateDetailsModal
                isOpen={!!selectedCandidateId}
                onClose={() => setSelectedCandidateId(null)}
                candidateId={selectedCandidateId}
                onUpdate={() => queryClient.invalidateQueries(['candidates'])}
            />
            <div>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Manage Schools</h2>
                    <p className="text-gray-500">View, manage, and verify school registrations.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600">School Name</th>
                                    <th className="p-4 font-semibold text-gray-600">Verification</th>
                                    <th className="p-4 font-semibold text-gray-600">Account Status</th>
                                    <th className="p-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schools?.map(school => (
                                    <tr 
                                        key={school._id} 
                                        className="border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => setSelectedSchoolId(school._id)}
                                    >
                                        <td className="p-4 font-medium text-gray-800">
                                            <div className="flex items-center space-x-2">
                                                <Building size={16} className="text-gray-400" />
                                                <span>{school.name}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">{school.email}</p>
                                        </td>
                                        <td className="p-4">
                                            {school.verified ? (
                                                <span className="flex items-center space-x-1.5 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full"><CheckCircle size={14} /><span>Verified</span></span>
                                            ) : (
                                                <span className="flex items-center space-x-1.5 text-xs font-semibold text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full"><Clock size={14} /><span>Pending</span></span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {school.isSuspended ? (
                                                <span className="flex items-center space-x-1.5 text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-full"><AlertTriangle size={14} /><span>Suspended</span></span>
                                            ) : (
                                                <span className="flex items-center space-x-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full"><PlayCircle size={14} /><span>Active</span></span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-2">
                                                {!school.verified && (
                                                    <button onClick={(e) => handleVerifyClick(e, school._id)} disabled={verifyMutation.isPending} className="py-1 px-3 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300">Verify</button>
                                                )}
                                                {school.isSuspended ? (
                                                     <button onClick={(e) => handleStatusClick(e, school._id, false)} disabled={statusMutation.isPending} className="py-1 px-3 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-300">Unsuspend</button>
                                                ) : (
                                                    <button onClick={(e) => handleStatusClick(e, school._id, true)} disabled={statusMutation.isPending} className="py-1 px-3 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-300">Suspend</button>
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
        </>
    );
};

export default ManageSchoolsPage;