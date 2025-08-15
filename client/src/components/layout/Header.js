import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, ChevronDown } from 'lucide-react';

const Header = () => {
    const { user } = useAuth();
    // --- THIS IS THE FIX ---
    // This logic now checks for fullName (candidate/admin), then name (school), then falls back to email.
    const displayName = user?.fullName || user?.name || user?.email;
    // --------------------

    return (
        <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
            <h1 className="text-xl font-semibold text-gray-700">Welcome, {displayName}</h1>
            <div className="flex items-center space-x-6">
                <button className="relative text-gray-600 hover:text-gray-800"><Bell size={22} /></button>
                <div className="relative">
                    <button className="flex items-center space-x-2">
                        <img className="h-9 w-9 rounded-full object-cover" src={`https://ui-avatars.com/api/?name=${displayName?.replace(/\s+/g, '+')}&background=0D8ABC&color=fff`} alt="User avatar" />
                        <span className="hidden md:block font-medium text-gray-700">{displayName}</span>
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;