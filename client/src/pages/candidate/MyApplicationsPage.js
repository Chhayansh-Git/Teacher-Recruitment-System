import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Briefcase, Building, CheckCircle, Clock, Send, Award } from 'lucide-react';

const MyApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await api.get('/candidates/dashboard');
                const events = response.data.data?.recentEvents || [];

                const latestEvents = new Map();
                events.forEach(event => {
                    latestEvents.set(event.requirementTitle, event);
                });

                setApplications(Array.from(latestEvents.values()));
            } catch (err) {
                setError('Failed to fetch dashboard data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (loading) return <div className="text-center p-8 text-gray-600">Loading your applications...</div>;
    if (error) return <div className="text-center p-8 text-red-500 font-semibold">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">My Applications</h2>
                <p className="text-gray-500 mt-1">Track the status of every role you have been considered for.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">
                                    <div className="flex items-center space-x-2"><Briefcase size={16} /><span >Role</span></div>
                                </th>
                                <th className="p-4 font-semibold text-gray-600">
                                    <div className="flex items-center space-x-2"><Building size={16} /><span>School</span></div>
                                </th>
                                <th className="p-4 font-semibold text-gray-600">
                                     <div className="flex items-center space-x-2"><CheckCircle size={16} /><span>Current Status</span></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.length > 0 ? applications.map((app, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-800">{app.requirementTitle || 'N/A'}</td>
                                    <td className="p-4 text-gray-600">{app.school || 'N/A'}</td>
                                    <td className="p-4"><StatusBadge status={app.status} /></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center p-12 text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <Send size={40} className="text-gray-300 mb-3" />
                                            <h3 className="font-semibold text-lg">No Applications Found</h3>
                                            <p>When an admin submits your profile to a school, it will appear here.</p>
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
        pushed: { text: 'Submitted to School', icon: <Send size={14} />, color: 'bg-gray-100 text-gray-800' },
        shortlisted: { text: 'Shortlisted', icon: <CheckCircle size={14} />, color: 'bg-blue-100 text-blue-800' },
        invited: { text: 'Interview Invited', icon: <Clock size={14} />, color: 'bg-purple-100 text-purple-800' },
        hired: { text: 'Hired!', icon: <Award size={14} />, color: 'bg-green-100 text-green-800 font-bold' },
    };
    
    const currentStatus = statusConfig[(status || 'pushed').toLowerCase()] || { text: status, icon: <CheckCircle size={14} />, color: 'bg-gray-100 text-gray-800' };

    return (
        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${currentStatus.color}`}>
            {currentStatus.icon}
            <span>{currentStatus.text}</span>
        </span>
    );
};

export default MyApplicationsPage;