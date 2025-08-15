import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Building, Users, Briefcase, UserCheck } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                setStats(response.data.data);
            } catch (err) {
                setError('Failed to fetch dashboard statistics.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="text-center p-8">Loading Dashboard...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    const kpiData = [
        { title: 'Total Schools', value: stats?.schools?.total || 0, icon: <Building />, color: 'blue' },
        { title: 'Total Candidates', value: stats?.candidates?.total || 0, icon: <Users />, color: 'green' },
        { title: 'Open Requirements', value: stats?.requirements?.open || 0, icon: <Briefcase />, color: 'yellow' },
        { title: 'Total Hires', value: stats?.hires || 0, icon: <UserCheck />, color: 'purple' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
                <p className="text-gray-500">Platform-wide analytics and overview.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map(kpi => (
                    <div key={kpi.title} className={`bg-white p-6 rounded-xl shadow-md border-l-4 border-${kpi.color}-500`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{kpi.title}</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{kpi.value}</p>
                            </div>
                            <div className={`p-3 bg-${kpi.color}-100 text-${kpi.color}-600 rounded-full`}>
                                {kpi.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* We will add recent activity and charts here in later steps */}
        </div>
    );
};

export default AdminDashboard;