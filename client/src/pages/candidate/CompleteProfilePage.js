// src/pages/candidate/CompleteProfilePage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { EditProfileForm } from './CandidateProfilePage'; // Importing the form

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
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveProfile = async (formData, isDraft) => {
        // This unified handler can save drafts or final versions
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
            navigate('/candidate/dashboard'); // Navigate to dashboard after any save
        } catch (err) {
            alert('Failed to save profile. Please check your inputs and try again.');
            console.error(err);
        }
    };

    if (loading) return <div className="text-center p-8">Loading Your Profile...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Complete Your Profile</h2>
                    <p className="text-gray-500 mt-2">Fill in your details to get noticed by schools, or skip for now and do it later.</p>
                </div>
                
                {initialData && <EditProfileForm initialData={initialData} onSave={handleSaveProfile} isCompletionStep={true} />}
                
                <div className="text-center mt-8">
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