// src/pages/candidate/CompleteProfilePage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { EditProfileForm } from './CandidateProfilePage'; // Importing the form
import { UserCheck } from 'lucide-react';

const CompleteProfilePage = () => {
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/candidates/profile');
                setInitialData(response.data.data);
            } catch (err) {
                setError('Failed to load profile data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveProfile = async (formData, isDraft) => {
        const payload = {
            ...formData,
            preferredLocations: formData.preferredLocations.split(',').map(s => s.trim()),
            languages: formData.languages.split(',').map(s => s.trim()),
            extraResponsibilities: formData.extraResponsibilities.split(',').map(s => s.trim()),
        };
        
        try {
            if (isDraft) {
                await api.post('/candidates/draft', { data: payload, step: 'profile-completion' });
                alert('Draft saved successfully!');
            } else {
                await api.put('/candidates/profile', payload);
                alert('Profile updated successfully!');
            }
            navigate('/candidate/dashboard');
        } catch (err) {
            alert('Failed to save profile. Please check your inputs and try again.');
        }
    };

    if (loading) return <div className="text-center p-8">Loading Your Profile...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                {/* ENHANCEMENT: Clearer, more encouraging header */}
                <div className="text-center mb-8 border-b pb-6">
                    <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                        <UserCheck className="w-10 h-10 text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Complete Your Profile</h2>
                    <p className="text-gray-500 mt-2 max-w-2xl mx-auto">A complete profile stands out to recruiters. Fill in your details below to boost your chances.</p>
                </div>
                
                {initialData && <EditProfileForm initialData={initialData} onSave={handleSaveProfile} isCompletionStep={true} />}
                
                <div className="text-center mt-8 pt-6 border-t">
                    <button 
                        onClick={() => navigate('/candidate/dashboard')}
                        className="font-medium text-gray-600 hover:text-blue-600 transition"
                    >
                        Skip for Now & Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfilePage;