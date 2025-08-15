import React, { useState, useEffect } from 'react';
import api from '../../api';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, Building, DollarSign, Edit, Save, X, Plus, Trash2, Languages, Award, ShieldCheck } from 'lucide-react';

const CandidateProfilePage = () => {
    const [profileData, setProfileData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/candidates/profile');
                setProfileData(response.data.data);
            } catch (err) {
                setError('Failed to fetch profile data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (formData) => {
        try {
            // Convert comma-separated strings back to arrays for the backend
            const payload = {
                ...formData,
                preferredLocations: Array.isArray(formData.preferredLocations) ? formData.preferredLocations : formData.preferredLocations.split(',').map(s => s.trim()),
                languages: Array.isArray(formData.languages) ? formData.languages : formData.languages.split(',').map(s => s.trim()),
                extraResponsibilities: Array.isArray(formData.extraResponsibilities) ? formData.extraResponsibilities : formData.extraResponsibilities.split(',').map(s => s.trim()),
            };
            const response = await api.put('/candidates/profile', payload);
            setProfileData(response.data.data);
            setIsEditMode(false);
            alert('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile.');
            console.error(err);
        }
    };

    if (loading) return <div className="text-center p-8">Loading profile...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!profileData) return <div className="text-center p-8">Could not load profile.</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-semibold transition ${isEditMode ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'}`}
                    >
                        {isEditMode ? <X size={18} /> : <Edit size={18} />}
                        <span>{isEditMode ? 'Cancel' : 'Edit Profile'}</span>
                    </button>
                </div>
                {isEditMode ? <EditProfileForm initialData={profileData} onSave={handleSave} /> : <ViewProfile profileData={profileData} />}
            </div>
        </div>
    );
};

// ================== VIEW COMPONENT ==================
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
                <div className="lg:col-span-3"><InfoItem icon={<MapPin />} label="Address" value={`${profileData.address}, ${profileData.city}, ${profileData.state} - ${profileData.pinCode}`} /></div>
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
            {profileData.education?.map(edu => <div key={edu._id} className="p-4 border rounded-lg bg-gray-50"><p className="font-bold">{edu.degree}</p><p>{edu.boardOrUniversity} - {edu.passingYear}</p></div>)}
        </ProfileSection>
        <ProfileSection title="Work Experience" icon={<Building />}>
            {profileData.experience?.map(exp => <div key={exp._id} className="p-4 border rounded-lg bg-gray-50"><p className="font-bold">{exp.role}</p><p>{exp.organization} ({new Date(exp.from).getFullYear()} - {new Date(exp.to).getFullYear()})</p></div>)}
        </ProfileSection>
    </div>
);

// ================== EDIT COMPONENT ==================
const EditProfileForm = ({ initialData, onSave }) => {
    const [formData, setFormData] = useState({
        ...initialData,
        // Convert arrays to comma-separated strings for easier editing
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
        const newItem = section === 'education' ? { level: 'Bachelors', degree: '', boardOrUniversity: '', passingYear: '' } : { role: '', organization: '', from: '', to: '', employmentType: 'Full-time' };
        setFormData({ ...formData, [section]: [...(formData[section] || []), newItem] });
    };
    const removeNestedItem = (section, index) => {
        const updatedSection = formData[section].filter((_, i) => i !== index);
        setFormData({ ...formData, [section]: updatedSection });
    };

    return (
        <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <ProfileSection title="Edit Personal Details" icon={<User />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                    <InputField label="Contact" name="contact" value={formData.contact} onChange={handleInputChange} />
                    <InputField label="Date of Birth" name="dob" type="date" value={formData.dob ? formData.dob.split('T')[0] : ''} onChange={handleInputChange} />
                    <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange}><option>Male</option><option>Female</option><option>Other</option></SelectField>
                    <SelectField label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange}><option>Single</option><option>Married</option></SelectField>
                    <div className="md:col-span-2"><InputField label="Address" name="address" value={formData.address} onChange={handleInputChange} /></div>
                </div>
            </ProfileSection>
            <ProfileSection title="Edit Professional Details" icon={<Briefcase />}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Position" name="position" value={formData.position} onChange={handleInputChange} />
                    <InputField label="Preferred Locations (comma-separated)" name="preferredLocations" value={formData.preferredLocations} onChange={handleInputChange} />
                    <InputField label="Previous Salary (p.a.)" name="previousSalary" type="number" value={formData.previousSalary} onChange={handleInputChange} />
                    <InputField label="Expected Salary (p.a.)" name="expectedSalary" type="number" value={formData.expectedSalary} onChange={handleInputChange} />
                    <InputField label="Languages (comma-separated)" name="languages" value={formData.languages} onChange={handleInputChange} />
                 </div>
            </ProfileSection>
            <ProfileSection title="Edit Education" icon={<GraduationCap />}>
                {(formData.education || []).map((edu, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg mb-4">
                        <InputField label="Degree" name="degree" value={edu.degree} onChange={(e) => handleNestedChange('education', index, e)} />
                        <InputField label="University" name="boardOrUniversity" value={edu.boardOrUniversity} onChange={(e) => handleNestedChange('education', index, e)} />
                        <InputField label="Year" name="passingYear" type="number" value={edu.passingYear} onChange={(e) => handleNestedChange('education', index, e)} />
                        <button type="button" onClick={() => removeNestedItem('education', index)} className="self-end p-2 text-red-500"><Trash2 size={18} /></button>
                    </div>
                ))}
                <button type="button" onClick={() => addNestedItem('education')} className="flex items-center space-x-2 text-blue-600"><Plus size={18} /><span>Add Education</span></button>
            </ProfileSection>
            <ProfileSection title="Edit Work Experience" icon={<Building />}>
                {(formData.experience || []).map((exp, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg mb-4">
                        <InputField label="Role" name="role" value={exp.role} onChange={(e) => handleNestedChange('experience', index, e)} />
                        <InputField label="Organization" name="organization" value={exp.organization} onChange={(e) => handleNestedChange('experience', index, e)} />
                        <InputField label="From" name="from" type="date" value={exp.from ? exp.from.split('T')[0] : ''} onChange={(e) => handleNestedChange('experience', index, e)} />
                        <InputField label="To" name="to" type="date" value={exp.to ? exp.to.split('T')[0] : ''} onChange={(e) => handleNestedChange('experience', index, e)} />
                        <button type="button" onClick={() => removeNestedItem('experience', index)} className="self-end p-2 text-red-500"><Trash2 size={18} /></button>
                    </div>
                ))}
                <button type="button" onClick={() => addNestedItem('experience')} className="flex items-center space-x-2 text-blue-600"><Plus size={18} /><span>Add Experience</span></button>
            </ProfileSection>
            <div className="flex justify-end pt-6 border-t"><button type="submit" className="flex items-center space-x-2 py-2 px-6 bg-green-500 text-white rounded-lg"><Save size={18} /><span>Save Changes</span></button></div>
        </form>
    );
};

// ================== HELPER COMPONENTS ==================
const ProfileSection = ({ title, icon, children }) => (<section><div className="flex items-center space-x-3 mb-4"><div className="bg-blue-100 p-2 rounded-full text-blue-600">{icon}</div><h3 className="text-xl font-semibold">{title}</h3></div><div className="pl-12">{children}</div></section>);
const InfoItem = ({ icon, label, value }) => (<div><p className="text-sm text-gray-500 flex items-center space-x-2">{icon}<span>{label}</span></p><p className="font-semibold">{value || '-'}</p></div>);
const InputField = ({ label, ...props }) => (<div><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><input {...props} className="w-full px-3 py-2 bg-gray-50 border rounded-lg" /></div>);
const SelectField = ({ label, children, ...props }) => (<div><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><select {...props} className="w-full px-3 py-2 bg-gray-50 border rounded-lg">{children}</select></div>);

export default CandidateProfilePage;