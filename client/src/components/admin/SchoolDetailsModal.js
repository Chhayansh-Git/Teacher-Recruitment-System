// src/components/admin/SchoolDetailsModal.js

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { X, Mail, Phone, MapPin, Building, Briefcase, UserCheck } from 'lucide-react';

const fetchSchoolDetails = async (schoolId) => {
    if (!schoolId) return null;
    const { data } = await api.get(`/admin/schools/${schoolId}`);
    return data.data;
};

// A helper component to render candidate lists cleanly
const CandidateList = ({ title, candidates, onCandidateClick }) => {
    if (!candidates || candidates.length === 0) {
        return null; // Don't render the section if there are no candidates
    }
    return (
        <div className="mt-2">
            <p className="text-xs font-semibold text-gray-600">{title}:</p>
            <ul className="mt-1 pl-2 space-y-1">
                {candidates.map(candidate => (
                    <li key={candidate._id} className="text-xs">
                        <button onClick={() => onCandidateClick(candidate._id)} className="text-blue-600 hover:underline flex items-center space-x-2">
                            <UserCheck size={14}/>
                            <span>{candidate.fullName}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const SchoolDetailsModal = ({ isOpen, onClose, schoolId, onCandidateClick }) => {
    const { data: school, isLoading, isError } = useQuery({
        queryKey: ['school', schoolId],
        queryFn: () => fetchSchoolDetails(schoolId),
        enabled: !!schoolId,
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-6 border-b z-10">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-gray-800">School Details</h3>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
                    </div>
                </div>
                <div className="p-6">
                    {isLoading && <p>Loading details...</p>}
                    {isError && <p className="text-red-500">Could not load school details.</p>}
                    {school && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="bg-blue-100 p-4 rounded-full"><Building size={24} className="text-blue-600"/></div>
                                <div>
                                    <h4 className="text-xl font-bold">{school.name}</h4>
                                    <p className="text-sm text-gray-500">{school.location}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem icon={<Mail size={16}/>} label="Email" value={school.email} />
                                <InfoItem icon={<Phone size={16}/>} label="Contact" value={school.contactNo} />
                                <InfoItem icon={<MapPin size={16}/>} label="Address" value={`${school.address}, ${school.pincode}`} className="md:col-span-2" />
                            </div>
                            <div>
                                <h5 className="text-lg font-semibold text-gray-700 mt-6 border-b pb-2 mb-3 flex items-center space-x-2"><Briefcase size={18} /><span>Posted Requirements</span></h5>
                                {school.requirements && school.requirements.length > 0 ? (
                                    <div className="space-y-4">
                                        {school.requirements.map(req => (
                                            <div key={req._id} className="bg-gray-50 p-4 rounded-lg">
                                                <p className="font-bold text-md text-gray-800">{req.title}</p>
                                                <div className="text-xs text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                                    <p><strong>Status:</strong> <span className="capitalize">{req.status}</span></p>
                                                    <p><strong>Experience:</strong> {req.minExperience}+ years</p>
                                                    <p><strong>Qualification:</strong> {req.minQualification}</p>
                                                    <p><strong>Gender:</strong> {req.gender}</p>
                                                </div>
                                                <div className="mt-3 space-y-2">
                                                    <CandidateList title="Pushed Candidates" candidates={req.pushedCandidates} onCandidateClick={onCandidateClick} />
                                                    <CandidateList title="Shortlisted Candidates" candidates={req.shortlistedCandidates} onCandidateClick={onCandidateClick} />
                                                    <CandidateList title="Interviewed Candidates" candidates={req.interviewedCandidates} onCandidateClick={onCandidateClick} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (<p className="text-gray-500 text-sm">This school has not posted any requirements yet.</p>)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ icon, label, value, className }) => (
    <div className={className}>
        <p className="text-xs text-gray-500 flex items-center space-x-2">{icon} <span>{label}</span></p>
        <p className="font-medium text-gray-800">{value}</p>
    </div>
);

export default SchoolDetailsModal;