// src/pages/candidate/MyApplicationsPage.js

import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Briefcase, Building, CheckCircle, Clock, Send, Award, Calendar, Search } from 'lucide-react';

const MyApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                // Using the specific dashboard endpoint to get event data
                const response = await api.get('/candidates/dashboard');
                const events = response.data.data?.recentEvents || [];

                // Logic to get only the latest status for each unique requirement
                const latestEvents = new Map();
                events.forEach(event => {
                    // Assuming each event has a unique identifier for the requirement, like requirementId
                    const key = event.requirementId || event.requirementTitle;
                    if (!latestEvents.has(key) || new Date(event.timestamp) > new Date(latestEvents.get(key).timestamp)) {
                        latestEvents.set(key, event);
                    }
                });

                // Sort by most recent event first
                const sortedApps = Array.from(latestEvents.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setApplications(sortedApps);

            } catch (err) {
                setError('Failed to fetch application data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (loading) return <div className="text-center p-8 text-gray-600">Loading your applications...</div>;
    if (error) return <div className="text-center p-8 text-red-500 font-semibold">{error}</div>;

    return (
        <div className="space-y-8">
            {/* ENHANCEMENT: Clearer page header */}
            <div className="p-6 bg-white rounded-2xl shadow-md border-l-4 border-blue-500">
                <h2 className="text-3xl font-bold text-gray-800">My Applications</h2>
                <p className="text-gray-500 mt-1">Track the status of every role you have been considered for.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        {/* ENHANCEMENT: Improved table header styling */}
                        <thead className="border-b bg-gray-50/75">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider text-sm"><div className="flex items-center space-x-2"><Briefcase size={16} /><span>Role</span></div></th>
                                <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider text-sm"><div className="flex items-center space-x-2"><Building size={16} /><span>School</span></div></th>
                                <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider text-sm"><div className="flex items-center space-x-2"><Calendar size={16} /><span>Last Updated</span></div></th>
                                <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider text-sm"><div className="flex items-center space-x-2"><CheckCircle size={16} /><span>Current Status</span></div></th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.length > 0 ? applications.map((app, index) => (
                                // ENHANCEMENT: Added zebra-striping for readability
                                <tr key={app.requirementId || index} className="border-b last:border-b-0 even:bg-gray-50/50 hover:bg-blue-50/50 transition-colors">
                                    <td className="p-4 font-medium text-gray-800">{app.requirementTitle || 'N/A'}</td>
                                    <td className="p-4 text-gray-600">{app.school || 'N/A'}</td>
                                    <td className="p-4 text-gray-600 text-sm">{app.timestamp ? new Date(app.timestamp).toLocaleDateString() : 'N/A'}</td>
                                    <td className="p-4"><StatusBadge status={app.status} /></td>
                                </tr>
                            )) : (
                                <tr>
                                    {/* ENHANCEMENT: Improved empty state design */}
                                    <td colSpan="4" className="text-center p-16 text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <Search size={48} className="text-gray-300 mb-4" />
                                            <h3 className="font-semibold text-xl text-gray-700">No Applications Found</h3>
                                            <p className="max-w-sm mt-1">When an admin submits your profile to a school for a requirement, your application status will appear here.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const statusConfig = {
        pushed: { text: 'Submitted', icon: <Send size={14} />, color: 'bg-gray-100 text-gray-800' },
        shortlisted: { text: 'Shortlisted', icon: <CheckCircle size={14} />, color: 'bg-blue-100 text-blue-800' },
        invited: { text: 'Interview', icon: <Clock size={14} />, color: 'bg-purple-100 text-purple-800' },
        hired: { text: 'Hired!', icon: <Award size={14} />, color: 'bg-green-100 text-green-800 font-bold' },
    };
    
    const currentStatus = statusConfig[(status || 'pushed').toLowerCase()] || { text: status, icon: <CheckCircle size={14} />, color: 'bg-gray-100 text-gray-800' };

    return (
        <span className={`inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-full capitalize ${currentStatus.color}`}>
            {currentStatus.icon}
            <span>{currentStatus.text}</span>
        </span>
    );
};

export default MyApplicationsPage;