import React, { useState, useEffect } from 'react';
import api from '../../api';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, Building, DollarSign, Edit, Save, X, Plus, Trash2, Languages, Award, ShieldCheck, HelpCircle } from 'lucide-react';

const CandidateProfilePage = () => {
    const [profileData, setProfileData] = useState(null);
    const [draftData, setDraftData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [profileRes, draftRes] = await Promise.all([
                    api.get('/candidates/profile'),
                    api.get('/candidates/draft')
                ]);
                
                setProfileData(profileRes.data.data);

                if (draftRes.data.data && Object.keys(draftRes.data.data).length > 0) {
                    setDraftData(draftRes.data);
                }

            } catch (err) {
                setError('Failed to fetch profile data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const handleEditClick = () => {
        if (draftData && new Date(draftData.meta.updatedAt) > new Date(profileData.updatedAt)) {
            const restoreDraft = window.confirm(
                `You have a saved draft from ${new Date(draftData.meta.updatedAt).toLocaleString()}.\nWould you like to continue editing it?`
            );
            if (restoreDraft) {
                setProfileData(draftData.data); 
            }
        }
        setIsEditMode(true);
        setError('');
    };

    const handleSave = async (formData, isDraft = false) => {
        try {
            const payload = {
                ...formData,
                preferredLocations: Array.isArray(formData.preferredLocations) ? formData.preferredLocations : formData.preferredLocations.split(',').map(s => s.trim()),
                languages: Array.isArray(formData.languages) ? formData.languages : formData.languages.split(',').map(s => s.trim()),
                extraResponsibilities: Array.isArray(formData.extraResponsibilities) ? formData.extraResponsibilities : formData.extraResponsibilities.split(',').map(s => s.trim()),
            };

            if (isDraft) {
                const response = await api.post('/candidates/draft', { data: payload, step: 'profile-edit' });
                setDraftData(response.data);
                alert('Draft saved successfully!');
            } else {
                const response = await api.put('/candidates/profile', payload);
                setProfileData(response.data.data);
                setDraftData(null);
                alert('Profile updated successfully!');
            }
            setIsEditMode(false);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to update profile.';
            setError(errorMsg);
            alert(errorMsg);
            console.error(err);
        }
    };

    if (loading) return <div className="text-center p-8">Loading profile...</div>;
    if (error && !isEditMode) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!profileData) return <div className="text-center p-8">Could not load profile.</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
                    {!isEditMode && (
                        <button
                            onClick={handleEditClick}
                            className="flex items-center space-x-2 py-2 px-4 rounded-lg font-semibold transition bg-blue-500 text-white hover:bg-blue-600"
                        >
                            <Edit size={18} />
                            <span>Edit Profile</span>
                        </button>
                    )}
                </div>
                {isEditMode ? 
                    <EditProfileForm 
                        initialData={profileData}
                        onSave={handleSave} 
                        onCancel={() => { setIsEditMode(false); setError(''); window.location.reload(); }} // Reload to discard draft changes
                        apiError={error}
                    /> : 
                    <ViewProfile profileData={profileData} />
                }
            </div>
        </div>
    );
};

// ================== VIEW COMPONENT (Unchanged) ==================
const ViewProfile = ({ profileData }) => (
    <div className="space-y-10">
        <ProfileSection title="Personal Details" icon={<User />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoItem icon={<User />} label="Full Name" value={profileData.fullName} />
                <InfoItem icon={<Mail />} label="Email" value={profileData.email} />
                <InfoItem icon={<Phone />} label="Contact" value={profileData.contact} />
                <InfoItem icon={<Calendar />} label="Date of Birth" value={profileData.dob ? new Date(profileData.dob).toLocaleDateString() : '-'} />
                <InfoItem icon={<User />} label="Gender" value={profileData.gender} />
                <InfoItem icon={<User />} label="Marital Status" value={profileData.maritalStatus} />
                <div className="lg:col-span-3"><InfoItem icon={<MapPin />} label="Address" value={profileData.address ? `${profileData.address}, ${profileData.city}, ${profileData.state} - ${profileData.pinCode}` : '-'} /></div>
            </div>
        </ProfileSection>
        <ProfileSection title="Professional Details" icon={<Briefcase />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <InfoItem icon={<Briefcase />} label="Applying For" value={`${profileData.type} / ${profileData.position}`} />
                 <InfoItem icon={<MapPin />} label="Preferred Locations" value={profileData.preferredLocations?.join(', ')} />
                 <InfoItem icon={<DollarSign />} label="Previous Salary (p.a.)" value={profileData.previousSalary ? `₹${profileData.previousSalary.toLocaleString('en-IN')}` : '-'} />
                 <InfoItem icon={<DollarSign />} label="Expected Salary (p.a.)" value={profileData.expectedSalary ? `₹${profileData.expectedSalary.toLocaleString('en-IN')}` : '-'} />
                 <InfoItem icon={<Languages />} label="Languages" value={profileData.languages?.join(', ')} />
                 <InfoItem icon={<Award />} label="Achievements" value={profileData.achievements} />
                 <InfoItem icon={<ShieldCheck />} label="Extra Responsibilities" value={profileData.extraResponsibilities?.join(', ')} />
            </div>
        </ProfileSection>
        <ProfileSection title="Education History" icon={<GraduationCap />}>
             {(profileData.education && profileData.education.length > 0) ? profileData.education.map((edu, i) => <div key={i} className="p-4 border rounded-lg bg-gray-50"><p className="font-bold">{edu.degree}</p><p>{edu.university} - {edu.passingYear}</p></div>) : <p className="text-gray-500">No education history added.</p>}
        </ProfileSection>
        <ProfileSection title="Work Experience" icon={<Building />}>
            {(profileData.experience && profileData.experience.length > 0) ? profileData.experience.map((exp, i) => <div key={i} className="p-4 border rounded-lg bg-gray-50"><p className="font-bold">{exp.role}</p><p>{exp.schoolName} ({new Date(exp.from).getFullYear()} - {exp.to ? new Date(exp.to).getFullYear() : 'Present'})</p></div>) : <p className="text-gray-500">No work experience added.</p>}
        </ProfileSection>
    </div>
);

// ================== EDIT COMPONENT (EXPORTED) ==================
export const EditProfileForm = ({ initialData, onSave, onCancel, apiError, isCompletionStep = false }) => {
    const [formData, setFormData] = useState({
        ...initialData,
        // --- FIX: Set the default value in the component's state, not just visually ---
        gender: initialData.gender || 'Male',
        maritalStatus: initialData.maritalStatus || 'Single',
        // --- End Fix ---
        preferredLocations: initialData.preferredLocations?.join(', ') || '',
        languages: initialData.languages?.join(', ') || '',
        extraResponsibilities: initialData.extraResponsibilities?.join(', ') || '',
    });

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleNestedChange = (section, index, e) => {
        const updatedSection = [...formData[section]];
        updatedSection[index] = { ...updatedSection[index], [e.target.name]: e.target.value };
        setFormData({ ...formData, [section]: updatedSection });
    };
    const addNestedItem = (section) => {
        const newItem = section === 'education' ? { level: 'Bachelors', degree: '', university: '', passingYear: '' } : { role: '', schoolName: '', from: '', to: '', employmentType: 'Full-Time' };
        setFormData({ ...formData, [section]: [...(formData[section] || []), newItem] });
    };
    const removeNestedItem = (section, index) => {
        const updatedSection = formData[section].filter((_, i) => i !== index);
        setFormData({ ...formData, [section]: updatedSection });
    };

    return (
        <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); onSave(formData, false); }}>
             {apiError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">{apiError}</div>}
            <ProfileSection title="Edit Personal Details" icon={<User />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Full Name" name="fullName" value={formData.fullName || ''} onChange={handleInputChange} />
                    <InputField label="Contact" name="contact" value={formData.contact || ''} onChange={handleInputChange} />
                    <InputField label="Date of Birth" name="dob" type="date" value={formData.dob ? formData.dob.split('T')[0] : ''} onChange={handleInputChange} />
                    <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </SelectField>
                    <SelectField label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange}>
                        <option>Single</option>
                        <option>Married</option>
                        <option>Other</option> {/* <-- FIX: Added missing option */}
                    </SelectField>
                    <div className="md:col-span-2"><InputField label="Address" name="address" value={formData.address || ''} onChange={handleInputChange} /></div>
                    <InputField label="City" name="city" value={formData.city || ''} onChange={handleInputChange} />
                    <InputField label="State" name="state" value={formData.state || ''} onChange={handleInputChange} />
                    <InputField label="Pin Code" name="pinCode" value={formData.pinCode || ''} onChange={handleInputChange} />
                </div>
            </ProfileSection>
            {/* ... Rest of the form JSX is unchanged ... */}
            <ProfileSection title="Edit Professional Details" icon={<Briefcase />}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Preferred Locations (comma-separated)" name="preferredLocations" value={formData.preferredLocations} onChange={handleInputChange} />
                    <InputField label="Previous Salary (p.a.)" name="previousSalary" type="number" value={formData.previousSalary || ''} onChange={handleInputChange} />
                    <InputField label="Expected Salary (p.a.)" name="expectedSalary" type="number" value={formData.expectedSalary || ''} onChange={handleInputChange} />
                    <InputField label="Languages (comma-separated)" name="languages" value={formData.languages} onChange={handleInputChange} />
                    <div className="md:col-span-2"><InputField label="Achievements" name="achievements" value={formData.achievements || ''} onChange={handleInputChange} /></div>
                    <div className="md:col-span-2"><InputField label="Extra Responsibilities (comma-separated)" name="extraResponsibilities" value={formData.extraResponsibilities} onChange={handleInputChange} /></div>
                 </div>
            </ProfileSection>
            <ProfileSection title="Edit Education" icon={<GraduationCap />}>
                {(formData.education || []).map((edu, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg mb-4 items-end">
                        <InputField label="Degree" name="degree" value={edu.degree} onChange={(e) => handleNestedChange('education', index, e)} />
                        <InputField label="University" name="university" value={edu.university} onChange={(e) => handleNestedChange('education', index, e)} />
                        <InputField label="Year" name="passingYear" type="number" value={edu.passingYear} onChange={(e) => handleNestedChange('education', index, e)} />
                        <button type="button" onClick={() => removeNestedItem('education', index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={18} /></button>
                    </div>
                ))}
                <button type="button" onClick={() => addNestedItem('education')} className="flex items-center space-x-2 text-blue-600 font-semibold"><Plus size={18} /><span>Add Education</span></button>
            </ProfileSection>
            <ProfileSection title="Edit Work Experience" icon={<Building />}>
                {(formData.experience || []).map((exp, index) => (
                     <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg mb-4 items-end">
                        <InputField label="Role" name="role" value={exp.role} onChange={(e) => handleNestedChange('experience', index, e)} />
                        <InputField label="School/Organization" name="schoolName" value={exp.schoolName} onChange={(e) => handleNestedChange('experience', index, e)} />
                        <InputField label="From" name="from" type="date" value={exp.from ? exp.from.split('T')[0] : ''} onChange={(e) => handleNestedChange('experience', index, e)} />
                        <InputField label="To" name="to" type="date" value={exp.to ? exp.to.split('T')[0] : ''} onChange={(e) => handleNestedChange('experience', index, e)} />
                        <SelectField label="Employment Type" name="employmentType" value={exp.employmentType} onChange={(e) => handleNestedChange('experience', index, e)}>
                            <option value="Full-Time">Full-Time</option><option value="Part-Time">Part-Time</option><option value="Contract">Contract</option><option value="Internship">Internship</option>
                        </SelectField>
                        <button type="button" onClick={() => removeNestedItem('experience', index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full md:col-start-5"><Trash2 size={18} /></button>
                    </div>
                ))}
                <button type="button" onClick={() => addNestedItem('experience')} className="flex items-center space-x-2 text-blue-600 font-semibold"><Plus size={18} /><span>Add Experience</span></button>
            </ProfileSection>
            <div className="flex justify-end items-center pt-6 border-t gap-4">
                {!isCompletionStep && <button type="button" onClick={onCancel} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg">Cancel</button>}
                <button type="button" onClick={() => onSave(formData, true)} className="flex items-center space-x-2 py-2 px-6 bg-gray-500 text-white rounded-lg"><Save size={18} /><span>Save as Draft</span></button>
                <button type="submit" className="flex items-center space-x-2 py-2 px-6 bg-green-500 text-white rounded-lg"><Save size={18} /><span>{isCompletionStep ? 'Save & Continue' : 'Save Changes'}</span></button>
            </div>
        </form>
    );
};

// ================== HELPER COMPONENTS (Unchanged) ==================
const ProfileSection = ({ title, icon, children }) => (<section><div className="flex items-center space-x-3 mb-4"><div className="bg-blue-100 p-2 rounded-full text-blue-600">{icon}</div><h3 className="text-xl font-semibold text-gray-800">{title}</h3></div><div className="pl-12">{children}</div></section>);
const InfoItem = ({ icon, label, value }) => (<div><p className="text-sm text-gray-500 flex items-center space-x-2">{icon}<span>{label}</span></p><p className="font-semibold text-gray-800">{value || '-'}</p></div>);
const InputField = ({ label, ...props }) => (<div><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><input {...props} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>);
const SelectField = ({ label, children, ...props }) => (<div><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><select {...props} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg appearance-none">{children}</select></div>);

export default CandidateProfilePage;