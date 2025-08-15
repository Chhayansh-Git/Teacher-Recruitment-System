import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { BarChart2, Download, CheckSquare, Clock, TrendingUp } from 'lucide-react';

// Fetcher functions for different report endpoints
const fetchOverview = async () => {
    const { data } = await api.get('/reports/overview');
    return data.data;
};

const fetchPlacementMetrics = async () => {
    const { data } = await api.get('/reports/placement-metrics');
    return data.data;
};

const ReportsPage = () => {
    // Fetch data from multiple endpoints concurrently
    const { data: overview, isLoading: isLoadingOverview } = useQuery({
        queryKey: ['reportsOverview'],
        queryFn: fetchOverview,
    });
    
    const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
        queryKey: ['placementMetrics'],
        queryFn: fetchPlacementMetrics,
    });

    const handleDownloadPdf = () => {
        // Simple way to trigger a download; opens in a new tab.
        // A more advanced implementation might fetch the blob and save it.
        const token = localStorage.getItem('token');
        window.open(`${api.defaults.baseURL}/reports/pdf?type=overview&token=${token}`, '_blank');
    };

    const isLoading = isLoadingOverview || isLoadingMetrics;

    if (isLoading) return <div className="text-center p-8">Loading reports...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Reports & Analytics</h2>
                    <p className="text-gray-500">Key performance indicators for the platform.</p>
                </div>
                <button 
                    onClick={handleDownloadPdf}
                    className="flex items-center space-x-2 py-2 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                    <Download size={18} />
                    <span>Download Overview PDF</span>
                </button>
            </div>

            {/* Overview Section */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Platform Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Active Schools" value={overview?.schools?.active || 0} icon={<TrendingUp />} />
                    <StatCard title="Active Candidates" value={overview?.candidates?.active || 0} icon={<TrendingUp />} />
                    <StatCard title="Open Requirements" value={overview?.requirements?.open || 0} icon={<TrendingUp />} />
                    <StatCard title="Total Hires" value={overview?.placements?.total || 0} icon={<TrendingUp />} />
                </div>
            </div>

            {/* Placement Metrics Section */}
            <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Placement Metrics</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Avg. Time to Hire (Days)" value={metrics?.avgTimeToHire?.toFixed(1) || 'N/A'} icon={<Clock />} />
                    <StatCard title="Successful Placements" value={metrics?.successfulPlacements || 0} icon={<CheckSquare />} />
                    <StatCard title="Hire Rate (%)" value={metrics?.hireRate?.toFixed(2) || 'N/A'} icon={<BarChart2 />} />
                    <StatCard title="Withdrawal Rate (%)" value={metrics?.withdrawalRate?.toFixed(2) || 'N/A'} icon={<BarChart2 />} />
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">{icon}</div>
        </div>
    </div>
);

export default ReportsPage;