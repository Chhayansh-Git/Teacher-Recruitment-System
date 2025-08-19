// src/pages/candidate/CandidateDashboard.js

import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Target, Briefcase, Calendar, Award, User, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const CandidateDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/candidates/dashboard');
                setDashboardData(response.data.data);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="text-center p-8">Loading dashboard...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    const { pushes = 0, shortlist = { total: 0 }, interviews = { total: 0 }, offers = { hired: 0 } } = dashboardData || {};

    const stats = [
        { title: 'Pushed Requirements', value: pushes, icon: <Target className="text-blue-500" />, color: 'blue' },
        { title: 'Active Applications', value: shortlist.total, icon: <Briefcase className="text-green-500" />, color: 'green' },
        { title: 'Interviews Scheduled', value: interviews.total, icon: <Calendar className="text-yellow-500" />, color: 'yellow' },
        { title: 'Offers Received', value: offers.hired, icon: <Award className="text-purple-500" />, color: 'purple' },
    ];

    return (
        <div className="space-y-8">
            {/* ENHANCEMENT: More prominent and welcoming header */}
            <div className="p-6 bg-white rounded-2xl shadow-md border-l-4 border-teal-500">
                <h2 className="text-3xl font-bold text-gray-800">Welcome back, {user?.fullName || user?.email}!</h2>
                <p className="text-gray-500 mt-1">Here's a summary of your job search activity.</p>
            </div>

            {/* ENHANCEMENT: Redesigned stat cards for better visual appeal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.title} className="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4 transition-transform transform hover:-translate-y-1 hover:shadow-lg">
                        <div className={`p-4 rounded-full bg-${stat.color}-100`}>{React.cloneElement(stat.icon, { size: 28 })}</div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ENHANCEMENT: Added a "Next Steps" section to guide the user */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Next Steps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link to="/candidate/profile" className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600"><User size={24} /></div>
                        <div>
                            <p className="font-semibold text-gray-800">Update Your Profile</p>
                            <p className="text-sm text-gray-500">Keep your details fresh to attract more opportunities.</p>
                        </div>
                    </Link>
                    <Link to="/candidate/applications" className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all">
                        <div className="p-3 bg-green-100 rounded-full text-green-600"><FileText size={24} /></div>
                        <div>
                            <p className="font-semibold text-gray-800">View My Applications</p>
                            <p className="text-sm text-gray-500">Track the status of your active applications.</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CandidateDashboard;