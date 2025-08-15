import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, Briefcase, Building, FileText, BarChart2, Mail, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navLinks = {
        candidate: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/candidate/dashboard' },
            { name: 'My Profile', icon: <User size={20} />, path: '/candidate/profile' },
            { name: 'My Applications', icon: <Briefcase size={20} />, path: '/candidate/applications' },
        ],
        school: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/school/dashboard' },
            { name: 'Post Requirement', icon: <FileText size={20} />, path: '/school/requirements/new' },
            { name: 'View Requirements', icon: <Briefcase size={20} />, path: '/school/requirements' },
            { name: 'School Profile', icon: <Building size={20} />, path: '/school/profile' },
        ],
        admin: [
            { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
            { name: 'Manage Schools', icon: <Building size={20} />, path: '/admin/schools' },
            { name: 'Manage Candidates', icon: <User size={20} />, path: '/admin/candidates' },
            { name: 'Manage Requirements', icon: <Briefcase size={20} />, path: '/admin/requirements' },
            { name: 'Reports', icon: <BarChart2 size={20} />, path: '/admin/reports' },
            { name: 'Email Templates', icon: <Mail size={20} />, path: '/admin/email-templates' },
            { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
        ]
    };

    const userRole = user?.role === 'super-admin' ? 'admin' : user?.role;
    const links = navLinks[userRole] || [];

    return (
        <aside className="bg-white text-gray-800 w-64 space-y-6 py-7 px-2 flex flex-col shadow-lg absolute inset-y-0 left-0 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30">
            <div className="flex items-center justify-between px-4">
                <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
                    TRS Portal
                </Link>
            </div>

            <nav className="flex-1">
                {links.map((link) => (
                    <Link
                        key={link.name}
                        to={link.path}
                        className={`flex items-center space-x-3 py-2.5 px-4 rounded-lg transition duration-200 ${location.pathname === link.path ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100'}`}
                    >
                        {link.icon}
                        <span className="font-medium">{link.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="px-2">
                <button
                    onClick={logout}
                    className="flex w-full items-center space-x-3 py-2.5 px-4 rounded-lg transition duration-200 text-red-500 hover:bg-red-50"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;