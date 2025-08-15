import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Users, CheckSquare, FilePlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const SchoolDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchSchoolDashboard = async () => {
            try {
                const response = await api.get('/schools/requirements');
                const requirements = response.data.data || [];
                const calculatedStats = {
                    totalRequirements: requirements.length,
                    openRequirements: requirements.filter(req => req.status === 'open').length,
                    candidatesPushed: 25, // Placeholder - requires more complex backend query
                    candidatesHired: 4,   // Placeholder - requires more complex backend query
                };
                setStats(calculatedStats);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchSchoolDashboard();
    }, []);

    if (loading) return <div className="text-center p-8">Loading dashboard...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    const kpiData = [
        { title: 'Total Requirements', value: stats?.totalRequirements || 0, icon: <Briefcase /> },
        { title: 'Open Positions', value: stats?.openRequirements || 0, icon: <FilePlus /> },
        { title: 'Candidates in Pipeline', value: stats?.candidatesPushed || 0, icon: <Users /> },
        { title: 'Successful Hires', value: stats?.candidatesHired || 0, icon: <CheckSquare /> },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">School Dashboard</h2>
                    <p className="text-gray-500">Welcome, {user?.name}!</p>
                </div>
                <Link to="/school/requirements/new" className="flex items-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                    <FilePlus size={18} />
                    <span>Post New Requirement</span>
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map(kpi => (
                    <div key={kpi.title} className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{kpi.title}</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{kpi.value}</p>
                            </div>
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">{kpi.icon}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SchoolDashboard;