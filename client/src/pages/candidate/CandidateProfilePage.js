import React, { useState, useEffect } from 'react';
import api from '../../api';
// FIX: All imported icons and functions are now used below.
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, Building, DollarSign, Edit, Save, Plus, Trash2, Languages, Award, ShieldCheck, CheckCircle } from 'lucide-react';

const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;
    const fields = [
        'fullName', 'gender', 'dob', 'maritalStatus', 'contact', 'address', 'city', 'state', 'pinCode',
        'preferredLocations', 'previousSalary', 'expectedSalary', 'languages', 'achievements',
        { key: 'education', min: 1 },
        { key: 'experience', min: 1 }
    ];
    const totalFields = fields.length;
    let completedFields = 0;

    fields.forEach(field => {
        if (typeof field === 'object') {
            if (profile[field.key] && profile[field.key].length >= field.min) completedFields++;
        } else {
            if (profile[field] && profile[field].toString().trim() !== '') completedFields++;
        }
    });
    return Math.round((completedFields / totalFields) * 100);
};

const CandidateProfilePage = () => {
    const [profileData, setProfileData] = useState(null);
    const [draftData, setDraftData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [completion, setCompletion] = useState(0);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [profileRes, draftRes] = await Promise.all([
                    api.get('/candidates/profile'),
                    api.get('/candidates/draft')
                ]);
                const profile = profileRes.data.data;
                setProfileData(profile);
                setCompletion(calculateProfileCompletion(profile));

                if (draftRes.data.data && Object.keys(draftRes.data.data).length > 0) {
                    setDraftData(draftRes.data);
                }
            } catch (err) {
                setError('Failed to fetch profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const handleEditClick = () => {
        if (draftData && new Date(draftData.meta.updatedAt) > new Date(profileData.updatedAt)) {
            const restoreDraft = window.confirm(`You have a saved draft from ${new Date(draftData.meta.updatedAt).toLocaleString()}.\nWould you like to continue editing it?`);
            if (restoreDraft) {
                setProfileData({ ...profileData, ...draftData.data });
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
                const updatedProfile = response.data.data;
                setProfileData(updatedProfile);
                setCompletion(calculateProfileCompletion(updatedProfile));
                setDraftData(null);
                alert('Profile updated successfully!');
            }
            setIsEditMode(false);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to update profile.';
            setError(errorMsg);
        }
    };

    const handleCancel = () => {
        setIsEditMode(false);
        setError('');
        window.location.reload();
    };

    if (loading) return <div className="text-center p-8">Loading profile...</div>;
    if (error && !isEditMode) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!profileData) return <div className="text-center p-8">Could not load profile.</div>;

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">{profileData.fullName}</h2>
                        <p className="text-gray-500 text-lg">{profileData.type} / {profileData.position}</p>
                    </div>
                     {!isEditMode && (
                        <div className="mt-4 md:mt-0 w-full md:w-1/3">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                                <span className={`text-sm font-medium ${completion < 100 ? 'text-blue-700' : 'text-green-700'}`}>{completion}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className={`h-2.5 rounded-full ${completion < 100 ? 'bg-blue-600' : 'bg-green-600'}`} style={{ width: `${completion}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Profile' : 'My Profile'}</h3>
                    {!isEditMode && (
                        <button onClick={handleEditClick} className="flex items-center space-x-2 py-2 px-4 rounded-lg font-semibold transition bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md">
                            <Edit size={18} /><span>Edit Profile</span>
                        </button>
                    )}
                </div>
                {isEditMode ? 
                    <EditProfileForm initialData={profileData} onSave={handleSave} onCancel={handleCancel} apiError={error} /> : 
                    <ViewProfile profileData={profileData} />
                }
            </div>
        </div>
    );
};

const ViewProfile = ({ profileData }) => (
    <div className="space-y-12">
        <ProfileSection title="Personal Details" icon={<User />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
             {(profileData.education && profileData.education.length > 0) ? (
                 <div className="space-y-4">
                    {profileData.education.map((edu, i) => <div key={i} className="p-4 border rounded-lg bg-gray-50/50"><p className="font-bold text-gray-800">{edu.degree}</p><p className="text-sm text-gray-600">{edu.university} - {edu.passingYear}</p></div>)}
                 </div>
             ) : <p className="text-gray-500">No education history added.</p>}
        </ProfileSection>
        <ProfileSection title="Work Experience" icon={<Building />}>
            {(profileData.experience && profileData.experience.length > 0) ? (
                 <div className="space-y-4">
                    {profileData.experience.map((exp, i) => <div key={i} className="p-4 border rounded-lg bg-gray-50/50"><p className="font-bold text-gray-800">{exp.role}</p><p className="text-sm text-gray-600">{exp.schoolName} ({new Date(exp.from).getFullYear()} - {exp.to ? new Date(exp.to).getFullYear() : 'Present'})</p></div>)}
                 </div>
            ) : <p className="text-gray-500">No work experience added.</p>}
        </ProfileSection>
    </div>
);

export const EditProfileForm = ({ initialData, onSave, onCancel, apiError, isCompletionStep = false }) => {
    const [formData, setFormData] = useState({
        ...initialData,
        gender: initialData.gender || 'Male',
        maritalStatus: initialData.maritalStatus || 'Single',
        preferredLocations: initialData.preferredLocations?.join(', ') || '',
        languages: initialData.languages?.join(', ') || '',
        extraResponsibilities: initialData.extraResponsibilities?.join(', ') || '',
    });

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleNestedChange = (section, index, e) => {
        const updatedSection = [...(formData[section] || [])];
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
        <form className="space-y-12" onSubmit={(e) => { e.preventDefault(); onSave(formData, false); }}>
            {apiError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg" role="alert">{apiError}</div>}
            
            <fieldset className="p-4 border rounded-lg">
                <legend className="px-2 text-lg font-semibold text-gray-700 flex items-center space-x-2"><User size={20}/><span>Personal Details</span></legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <InputField label="Full Name" name="fullName" value={formData.fullName || ''} onChange={handleInputChange} />
                    <InputField label="Contact" name="contact" value={formData.contact || ''} onChange={handleInputChange} />
                    <InputField label="Date of Birth" name="dob" type="date" value={formData.dob ? formData.dob.split('T')[0] : ''} onChange={handleInputChange} />
                    <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange}><option>Male</option><option>Female</option><option>Other</option></SelectField>
                    <SelectField label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange}><option>Single</option><option>Married</option><option>Other</option></SelectField>
                    <div className="md:col-span-2"><InputField label="Address" name="address" value={formData.address || ''} onChange={handleInputChange} /></div>
                    <InputField label="City" name="city" value={formData.city || ''} onChange={handleInputChange} />
                    <InputField label="State" name="state" value={formData.state || ''} onChange={handleInputChange} />
                    <InputField label="Pin Code" name="pinCode" value={formData.pinCode || ''} onChange={handleInputChange} />
                </div>
            </fieldset>

            <fieldset className="p-4 border rounded-lg">
                 <legend className="px-2 text-lg font-semibold text-gray-700 flex items-center space-x-2"><Briefcase size={20}/><span>Professional Details</span></legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <InputField label="Preferred Locations (comma-separated)" name="preferredLocations" value={formData.preferredLocations} onChange={handleInputChange} />
                    <InputField label="Previous Salary (p.a.)" name="previousSalary" type="number" value={formData.previousSalary || ''} onChange={handleInputChange} />
                    <InputField label="Expected Salary (p.a.)" name="expectedSalary" type="number" value={formData.expectedSalary || ''} onChange={handleInputChange} />
                    <InputField label="Languages (comma-separated)" name="languages" value={formData.languages} onChange={handleInputChange} />
                    <div className="md:col-span-2"><InputField label="Achievements" name="achievements" value={formData.achievements || ''} onChange={handleInputChange} /></div>
                    <div className="md:col-span-2"><InputField label="Extra Responsibilities (comma-separated)" name="extraResponsibilities" value={formData.extraResponsibilities} onChange={handleInputChange} /></div>
                 </div>
            </fieldset>

            {/* FIX: Connected handlers and icons for Education section */}
            <fieldset className="p-4 border rounded-lg">
                <legend className="px-2 text-lg font-semibold text-gray-700 flex items-center space-x-2"><GraduationCap size={20}/><span>Education</span></legend>
                <div className="space-y-4 pt-4">
                    {(formData.education || []).map((edu, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,1fr,auto] gap-4 p-4 border rounded-lg bg-gray-50/50 items-end">
                            <InputField label="Degree" name="degree" value={edu.degree || ''} onChange={(e) => handleNestedChange('education', index, e)} />
                            <InputField label="University" name="university" value={edu.university || ''} onChange={(e) => handleNestedChange('education', index, e)} />
                            <InputField label="Year" name="passingYear" type="number" value={edu.passingYear || ''} onChange={(e) => handleNestedChange('education', index, e)} />
                            <button type="button" onClick={() => removeNestedItem('education', index)} className="p-2 h-10 w-10 text-red-500 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors"><Trash2 size={18} /></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addNestedItem('education')} className="flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"><Plus size={18} /><span>Add Education</span></button>
                </div>
            </fieldset>

            {/* FIX: Connected handlers and icons for Experience section */}
            <fieldset className="p-4 border rounded-lg">
                <legend className="px-2 text-lg font-semibold text-gray-700 flex items-center space-x-2"><Building size={20}/><span>Work Experience</span></legend>
                <div className="space-y-4 pt-4">
                    {(formData.experience || []).map((exp, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr,1fr,1fr,1fr,auto] gap-4 p-4 border rounded-lg bg-gray-50/50 items-end">
                            <InputField label="Role" name="role" value={exp.role || ''} onChange={(e) => handleNestedChange('experience', index, e)} />
                            <InputField label="School/Organization" name="schoolName" value={exp.schoolName || ''} onChange={(e) => handleNestedChange('experience', index, e)} />
                            <InputField label="From" name="from" type="date" value={exp.from ? exp.from.split('T')[0] : ''} onChange={(e) => handleNestedChange('experience', index, e)} />
                            <InputField label="To" name="to" type="date" value={exp.to ? exp.to.split('T')[0] : ''} onChange={(e) => handleNestedChange('experience', index, e)} />
                            <SelectField label="Employment Type" name="employmentType" value={exp.employmentType || 'Full-Time'} onChange={(e) => handleNestedChange('experience', index, e)}>
                                <option value="Full-Time">Full-Time</option><option value="Part-Time">Part-Time</option><option value="Contract">Contract</option><option value="Internship">Internship</option>
                            </SelectField>
                            <button type="button" onClick={() => removeNestedItem('experience', index)} className="p-2 h-10 w-10 text-red-500 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors lg:col-start-5"><Trash2 size={18} /></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => addNestedItem('experience')} className="flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"><Plus size={18} /><span>Add Experience</span></button>
                </div>
            </fieldset>

            <div className="flex justify-end items-center pt-6 border-t gap-4 sticky bottom-0 bg-white py-4 -mx-8 px-8 rounded-b-2xl">
                {!isCompletionStep && <button type="button" onClick={onCancel} className="py-2 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>}
                <button type="button" onClick={() => onSave(formData, true)} className="flex items-center space-x-2 py-2 px-6 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"><Save size={18} /><span>Save as Draft</span></button>
                <button type="submit" className="flex items-center space-x-2 py-2 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"><CheckCircle size={18} /><span>{isCompletionStep ? 'Save & Continue' : 'Save Changes'}</span></button>
            </div>
        </form>
    );
};

const ProfileSection = ({ title, icon, children }) => (<section><div className="flex items-center space-x-3 mb-6"><div className="bg-blue-100 p-3 rounded-full text-blue-600">{React.cloneElement(icon, { size: 24 })}</div><h3 className="text-2xl font-bold text-gray-800">{title}</h3></div><div className="pl-16 border-l-2 border-blue-100">{children}</div></section>);
const InfoItem = ({ icon, label, value }) => (<div className="flex items-start space-x-3"><div className="text-gray-400 mt-1">{React.cloneElement(icon, { size: 18 })}</div><div><p className="text-sm text-gray-500">{label}</p><p className="font-semibold text-gray-800 text-base">{value || '-'}</p></div></div>);
const InputField = ({ label, ...props }) => (<div><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><input {...props} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" /></div>);
const SelectField = ({ label, children, ...props }) => (<div><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><select {...props} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition">{children}</select></div>);

export default CandidateProfilePage;