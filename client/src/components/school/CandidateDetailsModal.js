import React from 'react';
// --- FIX: Removed unused 'Briefcase' icon ---
import { User, Mail, Phone, MapPin, GraduationCap, Building, X } from 'lucide-react';

const CandidateDetailsModal = ({ isOpen, onClose, candidate }) => {
    if (!isOpen || !candidate) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
                    <div className="flex items-center gap-4">
                        <img className="h-12 w-12 rounded-full object-cover" src={`https://ui-avatars.com/api/?name=${candidate.fullName.replace(/\s+/g, '+')}&background=random`} alt="Avatar" />
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{candidate.fullName}</h3>
                            <p className="text-sm text-gray-500">{candidate.position}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <ProfileSection title="Personal Details" icon={<User />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoItem icon={<Mail />} label="Email" value={candidate.email} />
                            <InfoItem icon={<Phone />} label="Contact" value={candidate.contact} />
                            <InfoItem icon={<MapPin />} label="Location" value={`${candidate.address || ''}, ${candidate.city || ''}`} />
                        </div>
                    </ProfileSection>

                    <ProfileSection title="Education History" icon={<GraduationCap />}>
                        {candidate.education?.length > 0 ? candidate.education.map((edu, index) => (
                            <div key={index} className="p-3 border-l-2 pl-4">
                                <p className="font-bold text-gray-800">{edu.degree}</p>
                                <p className="text-sm text-gray-600">{edu.boardOrUniversity} - {edu.passingYear}</p>
                            </div>
                        )) : <p className="text-sm text-gray-500">No education history provided.</p>}
                    </ProfileSection>
                    
                    <ProfileSection title="Work Experience" icon={<Building />}>
                         {candidate.experience?.length > 0 ? candidate.experience.map((exp, index) => (
                            <div key={index} className="p-3 border-l-2 pl-4">
                                <p className="font-bold text-gray-800">{exp.role}</p>
                                <p className="text-sm text-gray-600">{exp.organization} ({new Date(exp.from).getFullYear()} - {new Date(exp.to).getFullYear()})</p>
                            </div>
                        )) : <p className="text-sm text-gray-500">No work experience provided.</p>}
                    </ProfileSection>
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