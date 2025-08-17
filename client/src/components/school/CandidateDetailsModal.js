// src/components/school/CandidateDetailsModal.js

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { User, GraduationCap, Building, X, MapPin, Calendar, Award } from 'lucide-react';

const fetchSchoolCandidateProfile = async (candidateId) => {
    if (!candidateId) return null;
    const { data } = await api.get(`/schools/candidates/${candidateId}`);
    return data.data;
};

const CandidateDetailsModal = ({ isOpen, onClose, candidateId }) => {
    const { data: candidate, isLoading, isError } = useQuery({
        queryKey: ['schoolCandidateProfile', candidateId],
        queryFn: () => fetchSchoolCandidateProfile(candidateId),
        enabled: !!candidateId,
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                    {candidate ? (
                        <div className="flex items-center gap-4">
                            <img className="h-12 w-12 rounded-full object-cover" src={`https://ui-avatars.com/api/?name=${candidate.fullName.replace(/\s+/g, '+')}&background=random`} alt="Avatar" />
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{candidate.fullName}</h3>
                                <p className="text-sm text-gray-500">{candidate.position}</p>
                            </div>
                        </div>
                    ) : <div/>}
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {isLoading && <p>Loading profile...</p>}
                    {isError && <p className="text-red-500">Could not load candidate profile.</p>}
                    {candidate && (
                        <>
                            <ProfileSection title="Personal Details" icon={<User />}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoItem icon={<Calendar />} label="Date of Birth" value={candidate.dob ? new Date(candidate.dob).toLocaleDateString() : '-'} />
                                    <InfoItem icon={<User />} label="Gender" value={candidate.gender} />
                                    <InfoItem icon={<MapPin />} label="Location" value={`${candidate.city || ''}, ${candidate.state || ''}`} />
                                    <InfoItem icon={<Award />} label="Achievements" value={candidate.achievements} />
                                </div>
                            </ProfileSection>

                            <ProfileSection title="Education History" icon={<GraduationCap />}>
                                {candidate.education?.length > 0 ? candidate.education.map((edu, index) => (
                                    <div key={index} className="p-3 border-l-2 pl-4">
                                        <p className="font-bold text-gray-800">{edu.degree}</p>
                                        <p className="text-sm text-gray-600">{edu.university} - {edu.passingYear}</p>
                                        <p className="text-xs text-gray-500">{edu.specialization}</p>
                                    </div>
                                )) : <p className="text-sm text-gray-500">No education history provided.</p>}
                            </ProfileSection>
                            
                            <ProfileSection title="Work Experience" icon={<Building />}>
                                 {candidate.experience?.length > 0 ? candidate.experience.map((exp, index) => (
                                    <div key={index} className="p-3 border-l-2 pl-4">
                                        <p className="font-bold text-gray-800">{exp.role}</p>
                                        <p className="text-sm text-gray-600">{exp.schoolName} ({new Date(exp.from).getFullYear()} - {exp.to ? new Date(exp.to).getFullYear() : 'Present'})</p>
                                        <p className="text-xs text-gray-500">{exp.employmentType}</p>
                                    </div>
                                )) : <p className="text-sm text-gray-500">No work experience provided.</p>}
                            </ProfileSection>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProfileSection = ({ title, icon, children }) => (
    <section>
        <div className="flex items-center space-x-3 mb-3">
            <div className="text-blue-600">{icon}</div>
            <h4 className="text-lg font-semibold text-gray-700">{title}</h4>
        </div>
        <div className="pl-8 space-y-2">{children}</div>
    </section>
);

const InfoItem = ({ icon, label, value }) => (
    <div>
        <p className="text-xs text-gray-500 flex items-center space-x-2">{icon}<span>{label}</span></p>
        <p className="font-medium text-gray-800">{value || '-'}</p>
    </div>
);

export default CandidateDetailsModal;