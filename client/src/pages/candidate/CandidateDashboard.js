import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Target, Briefcase, Calendar, Award } from 'lucide-react';

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
        <div>
            {/* --- THIS IS THE FIX --- */}
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user?.fullName || user?.email}!</h2>
            {/* -------------------- */}
            <p className="text-gray-500 mb-8">Here's a summary of your job search activity.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <div key={stat.title} className={`bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 border-l-4 border-${stat.color}-500`}>
                        <div className={`p-3 rounded-full bg-${stat.color}-100`}>{React.cloneElement(stat.icon, { size: 24 })}</div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CandidateDashboard;