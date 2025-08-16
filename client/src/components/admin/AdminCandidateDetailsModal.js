// src/components/admin/AdminCandidateDetailsModal.js

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { X, User, Briefcase, History, ShieldCheck, AlertTriangle, Save } from 'lucide-react';
import { candidateStatuses } from '../../config/formSchemas';

const fetchCandidateDetails = async (candidateId) => {
    // --- FIX: Added a cache-busting query parameter ---
    const url = `/admin/candidates/${candidateId}?_cacheBust=${Date.now()}`;
    const { data } = await api.get(url);
    return data.data;
};

const updateCandidateDetails = async ({ candidateId, payload }) => {
    const { data } = await api.put(`/admin/candidates/${candidateId}`, payload);
    return data.data;
};

const AdminCandidateDetailsModal = ({ isOpen, onClose, candidateId, onUpdate }) => {
    const queryClient = useQueryClient();

    const { data: candidate, isLoading, isError, error } = useQuery({
        queryKey: ['candidateDetails', candidateId],
        queryFn: () => fetchCandidateDetails(candidateId),
        enabled: !!candidateId,
    });

    const [status, setStatus] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        if (candidate) {
            setStatus(candidate.status || 'active');
            setAdminNotes(candidate.adminNotes || '');
        }
    }, [candidate]);

    const mutation = useMutation({
        mutationFn: updateCandidateDetails,
        onSuccess: () => {
            queryClient.invalidateQueries(['candidateDetails', candidateId]);
            onUpdate();
            onClose();
        },
        onError: (err) => {
            console.error("Failed to update candidate:", err);
            alert("Failed to update candidate details. " + (err.response?.data?.error || err.message));
        }
    });

    const handleVerify = () => {
        mutation.mutate({ candidateId, payload: { isVerified: true } });
    };

    const handleSuspendToggle = () => {
        mutation.mutate({ candidateId, payload: { isSuspended: !candidate.isSuspended } });
    };

    const handleSaveChanges = () => {
        mutation.mutate({ candidateId, payload: { status, adminNotes } });
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-gray-800">{candidate?.fullName || 'Loading...'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {isLoading && <div className="text-center py-10">Loading candidate details...</div>}
                    {isError && <div className="text-center py-10 text-red-500">{error.message}</div>}
                    {candidate && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <Section icon={<User />} title="Personal & Contact Information">
                                    <Detail label="Email" value={candidate.email} />
                                    <Detail label="Contact" value={candidate.contact} />
                                    <Detail label="Location" value={`${candidate.city || 'N/A'}, ${candidate.state || 'N/A'}`} />
                                    <Detail label="Position" value={`${candidate.position} (${candidate.type})`} />
                                </Section>

                                <Section icon={<Briefcase />} title="Professional Profile">
                                    <h4 className="font-semibold text-gray-700 mb-3">Education</h4>
                                    <div className="space-y-3">
                                        {candidate.education?.length > 0 ? candidate.education.map((edu, i) => (
                                            <div key={i} className="text-sm p-3 bg-gray-50 rounded-lg border">
                                                <p className="font-semibold text-gray-800">{edu.degree || 'Degree not specified'}</p>
                                                <p className="text-gray-600">{edu.specialization || 'No specialization provided'}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {edu.university || 'University not listed'}
                                                    {edu.passingYear && ` - ${edu.passingYear}`}
                                                </p>
                                            </div>
                                        )) : <p className="text-sm text-gray-500">No education details provided.</p>}
                                    </div>
                                    
                                    <h4 className="font-semibold text-gray-700 mt-6 mb-3">Experience</h4>
                                    <div className="space-y-3">
                                        {candidate.experience?.length > 0 ? candidate.experience.map((exp, i) => (
                                            <div key={i} className="text-sm p-3 bg-gray-50 rounded-lg border">
                                                <p className="font-semibold text-gray-800">{exp.role || 'Role not specified'}</p>
                                                <p className="text-gray-600">{exp.schoolName || 'School not listed'}</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {exp.from ? new Date(exp.from).getFullYear() : 'N/A'} - {exp.to ? new Date(exp.to).getFullYear() : 'Present'}
                                                </p>
                                            </div>
                                        )) : <p className="text-sm text-gray-500">No experience details provided.</p>}
                                    </div>
                                </Section>

                                <Section icon={<History />} title="Application History">
                                    <div className="space-y-3">
                                        {candidate.applicationHistory?.length > 0 ? candidate.applicationHistory.map(app => (
                                            <div key={app._id} className="text-sm p-3 bg-gray-50 rounded-lg">
                                                Pushed for <strong>{app.requirement?.title || 'N/A'}</strong> at <strong>{app.requirement?.school?.name || 'a school'}</strong>
                                                {' '}
                                                <span className={`capitalize text-xs font-semibold px-2 py-0.5 rounded-full ${app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>{app.status}</span>
                                            </div>
                                        )) : <p className="text-sm text-gray-500">No application history found.</p>}
                                    </div>
                                </Section>
                            </div>

                            <div className="md:col-span-1 space-y-6">
                                <Section icon={<ShieldCheck />} title="Admin Actions">
                                    <div className="space-y-4">
                                        {!candidate.verified && (
                                            <button onClick={handleVerify} disabled={mutation.isPending} className="w-full flex items-center justify-center gap-2 text-white bg-green-600 hover:bg-green-700 font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50">
                                                <ShieldCheck size={18} /> Verify Candidate
                                            </button>
                                        )}
                                        <button onClick={handleSuspendToggle} disabled={mutation.isPending} className={`w-full flex items-center justify-center gap-2 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 ${candidate.isSuspended ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-600 hover:bg-red-700'}`}>
                                            <AlertTriangle size={18} /> {candidate.isSuspended ? 'Unsuspend' : 'Suspend'}
                                        </button>
                                    </div>
                                    <hr className="my-6" />
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Candidate Status</label>
                                        <select
                                            id="status"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {candidateStatuses.map(s => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div className="mt-4">
                                        <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                                        <textarea
                                            id="adminNotes"
                                            rows="4"
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add internal notes here..."
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </Section>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold py-2 px-5 rounded-lg transition mr-3">
                        Close
                    </button>
                    <button onClick={handleSaveChanges} disabled={mutation.isPending} className="text-white bg-blue-600 hover:bg-blue-700 font-semibold py-2 px-5 rounded-lg transition flex items-center gap-2 disabled:opacity-50">
                        <Save size={18} /> {mutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Section = ({ icon, title, children }) => (
    <div className="bg-white p-5 rounded-xl border">
        <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">{icon}</div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const Detail = ({ label, value }) => (
    <div className="text-sm">
        <p className="font-semibold text-gray-500">{label}</p>
        <p className="text-gray-800">{value}</p>
    </div>
);


export default AdminCandidateDetailsModal;