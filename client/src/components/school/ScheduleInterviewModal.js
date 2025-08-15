import React, { useState } from 'react';
import api from '../../api';
import { Calendar, Video, MapPin, X, Send } from 'lucide-react';

const ScheduleInterviewModal = ({ isOpen, onClose, candidate, requirement, schoolId, onSuccess }) => {
    const [formData, setFormData] = useState({
        scheduledAt: '',
        mode: 'Online',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...formData,
                candidate: candidate._id,
                requirement: requirement._id,
                school: schoolId,
            };
            await api.post('/interviews', payload);
            onSuccess();
        } catch (err) {
            // --- THIS IS THE FIX ---
            // This logic ensures that 'error' is always a string,
            // preventing React from crashing if the server sends an object.
            const errorMessage = err.response?.data?.error;
            if (typeof errorMessage === 'string') {
                setError(errorMessage);
            } else {
                setError('An unexpected server error occurred. Please check the backend connection.');
            }
            // --------------------
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Schedule Interview</h3>
                        <p className="text-sm text-gray-500">For: {candidate.fullName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}
                    <div>
                        <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="datetime-local"
                                id="scheduledAt"
                                name="scheduledAt"
                                value={formData.scheduledAt}
                                onChange={handleInputChange}
                                required
                                className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interview Mode</label>
                        <div className="flex space-x-2">
                            <RadioPill name="mode" value="Online" checked={formData.mode === 'Online'} onChange={handleInputChange} icon={<Video size={16} />} />
                            <RadioPill name="mode" value="Offline" checked={formData.mode === 'Offline'} onChange={handleInputChange} icon={<MapPin size={16} />} />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={loading} className="flex items-center space-x-2 py-2 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300">
                            {loading ? 'Scheduling...' : 'Send Invite'}
                            {!loading && <Send size={16} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RadioPill = ({ icon, ...props }) => (
    <label className={`flex items-center space-x-2 py-2 px-4 rounded-full border cursor-pointer transition ${props.checked ? 'bg-blue-500 text-white border-blue-500' : 'bg-white hover:bg-gray-50'}`}>
        <input type="radio" className="hidden" {...props} />
        {icon}
        <span>{props.value}</span>
    </label>
);

export default ScheduleInterviewModal;