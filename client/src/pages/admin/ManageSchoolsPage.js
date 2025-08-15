import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { Building, CheckCircle, Clock } from 'lucide-react';

// A function to fetch all schools from the API
const fetchSchools = async () => {
    const { data } = await api.get('/admin/schools');
    return data.data;
};

// A function that calls the API to verify a school
const verifySchool = (schoolId) => {
    return api.put(`/admin/verify-school/${schoolId}`);
};

const ManageSchoolsPage = () => {
    const queryClient = useQueryClient();

    // --- FIX: Updated useQuery to the v5 object syntax ---
    const { data: schools, isLoading, isError, error } = useQuery({
        queryKey: ['schools'],
        queryFn: fetchSchools,
    });
    // ---------------------------------------------------

    // --- FIX: Updated useMutation to the v5 object syntax ---
    const mutation = useMutation({
        mutationFn: verifySchool,
        onSuccess: () => {
            // Also update invalidateQueries to the new syntax
            queryClient.invalidateQueries({ queryKey: ['schools'] });
            alert('School verified successfully!');
        },
        onError: () => {
            alert('Failed to verify school.');
        }
    });
    // ----------------------------------------------------

    const handleVerifyClick = (schoolId) => {
        if (window.confirm('Are you sure you want to verify this school?')) {
            mutation.mutate(schoolId);
        }
    };

    if (isLoading) return <div className="text-center p-8">Loading schools...</div>;
    if (isError) return <div className="text-center p-8 text-red-500">{error.message}</div>;

    return (
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
                                <th className="p-4 font-semibold text-gray-600">Email</th>
                                <th className="p-4 font-semibold text-gray-600">Location</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools?.map(school => (
                                <tr key={school._id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800 flex items-center space-x-2">
                                        <Building size={16} className="text-gray-400" />
                                        <span>{school.name}</span>
                                    </td>
                                    <td className="p-4 text-gray-600">{school.email}</td>
                                    <td className="p-4 text-gray-600">{school.location}</td>
                                    <td className="p-4">
                                        {school.verified ? (
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
                                    <td className="p-4">
                                        {!school.verified && (
                                            <button 
                                                onClick={() => handleVerifyClick(school._id)}
                                                // --- FIX: Updated from isLoading to isPending ---
                                                disabled={mutation.isPending}
                                                className="py-1.5 px-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
                                            >
                                                Verify
                                            </button>
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

export default ManageSchoolsPage;