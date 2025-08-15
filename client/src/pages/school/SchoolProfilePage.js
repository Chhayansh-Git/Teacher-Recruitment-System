import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Building, Mail, Phone, MapPin, Globe, UserCheck, Edit, Save, X, Hash, Users, GraduationCap, BookUser } from 'lucide-react';

const SchoolProfilePage = () => {
    const [profileData, setProfileData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/schools/profile');
                setProfileData(response.data.data);
            } catch (err) {
                setError('Failed to fetch profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (formData) => {
        try {
            const response = await api.put('/schools/profile', formData);
            setProfileData(response.data.data);
            setIsEditMode(false);
            alert('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile.');
        }
    };

    if (loading) return <div className="text-center p-8">Loading profile...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!profileData) return <div className="text-center p-8">Could not load profile.</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-3xl font-bold text-gray-800">School Profile</h2>
                    <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-semibold transition ${isEditMode ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white'}`}>
                        {isEditMode ? <X size={18} /> : <Edit size={18} />}
                        <span>{isEditMode ? 'Cancel' : 'Edit Profile'}</span>
                    </button>
                </div>
                {isEditMode ? <EditSchoolProfileForm initialData={profileData} onSave={handleSave} /> : <ViewSchoolProfile profileData={profileData} />}
            </div>
        </div>
    );
};

const ViewSchoolProfile = ({ profileData }) => (
    <div className="space-y-10">
        <ProfileSection title="School Information" icon={<Building />}><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><InfoItem icon={<Building />} label="School Name" value={profileData.name} /><InfoItem icon={<UserCheck />} label="Username" value={profileData.username} /><InfoItem icon={<Hash />} label="Affiliation No." value={profileData.affiliationNo} /><InfoItem icon={<Users />} label="Student Strength" value={profileData.strength} /><InfoItem icon={<GraduationCap />} label="School Upto" value={`Class ${profileData.schoolUpto}`} /><InfoItem icon={<BookUser />} label="Board" value={profileData.board} /><div className="lg:col-span-3"><InfoItem icon={<MapPin />} label="Address" value={`${profileData.address}, ${profileData.location}, ${profileData.pincode}`} /></div></div></ProfileSection>
        <ProfileSection title="Contact Details" icon={<Phone />}><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><InfoItem icon={<Mail />} label="Official Email" value={profileData.email} /><InfoItem icon={<Phone />} label="Contact Number" value={profileData.contactNo} /><InfoItem icon={<Phone color="green" />} label="WhatsApp Number" value={profileData.whatsappNumber} /><InfoItem icon={<Globe />} label="Website" value={<a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profileData.website}</a>} /></div></ProfileSection>
        <ProfileSection title="Leadership" icon={<UserCheck />}><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><InfoItem icon={<UserCheck />} label="Principal Name" value={profileData.principalName} /><InfoItem icon={<UserCheck />} label="Director Name" value={profileData.directorName} /></div></ProfileSection>
    </div>
);

const EditSchoolProfileForm = ({ initialData, onSave }) => {
    const [formData, setFormData] = useState(initialData);
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <ProfileSection title="Edit School Information" icon={<Building />}><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><InputField label="School Name" name="name" value={formData.name} onChange={handleInputChange} /><InputField label="Affiliation No." name="affiliationNo" value={formData.affiliationNo} onChange={handleInputChange} /><div className="md:col-span-2"><InputField label="Address" name="address" value={formData.address} onChange={handleInputChange} /></div><InputField label="Location / City" name="location" value={formData.location} onChange={handleInputChange} /><InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} /><InputField label="Student Strength" name="strength" type="number" value={formData.strength} onChange={handleInputChange} /></div></ProfileSection>
            <ProfileSection title="Edit Contact Details" icon={<Phone />}><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><InputField label="Contact Number" name="contactNo" value={formData.contactNo} onChange={handleInputChange} /><InputField label="WhatsApp Number" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} /><InputField label="Website" name="website" value={formData.website} onChange={handleInputChange} /></div></ProfileSection>
            <ProfileSection title="Edit Leadership" icon={<UserCheck />}><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><InputField label="Principal Name" name="principalName" value={formData.principalName} onChange={handleInputChange} /><InputField label="Director Name" name="directorName" value={formData.directorName} onChange={handleInputChange} /></div></ProfileSection>
            <div className="flex justify-end pt-6 border-t"><button type="submit" className="flex items-center space-x-2 py-2 px-6 bg-green-500 text-white rounded-lg"><Save size={18} /><span>Save Changes</span></button></div>
        </form>
    );
};

const ProfileSection = ({ title, icon, children }) => (<section><div className="flex items-center space-x-3 mb-4"><div className="bg-blue-100 p-2 rounded-full text-blue-600">{icon}</div><h3 className="text-xl font-semibold">{title}</h3></div><div className="pl-12">{children}</div></section>);
const InfoItem = ({ icon, label, value }) => (<div><p className="text-sm text-gray-500 flex items-center space-x-2">{icon}<span>{label}</span></p><p className="font-semibold">{value || '-'}</p></div>);
const InputField = ({ label, ...props }) => (<div><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><input {...props} className="w-full px-3 py-2 bg-gray-50 border rounded-lg" /></div>);

export default SchoolProfilePage;