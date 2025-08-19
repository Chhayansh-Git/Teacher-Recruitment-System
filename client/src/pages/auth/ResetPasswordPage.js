// src/pages/auth/ResetPasswordPage.js

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const { userId, token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await api.post('/auth/reset-password', { userId, token, password });
            setSuccess('Password has been reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password. The link may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8 md:p-12">
                    {/* ENHANCEMENT: Refined header section */}
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                            <Lock className="w-8 h-8 text-blue-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Set New Password</h2>
                        <p className="text-gray-500 mt-2">Create a strong, new password for your account.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg" role="alert">{error}</div>}
                        {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-r-lg flex items-center space-x-2" role="alert"><CheckCircle size={18}/><span>{success}</span></div>}
                        
                        <div className="relative">
                            <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
                            <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
                        </div>

                        <button type="submit" disabled={loading || success} className="w-full text-white font-bold py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed transform hover:-translate-y-0.5 hover:shadow-lg">
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};