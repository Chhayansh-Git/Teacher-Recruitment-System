// src/pages/auth/ForgotPasswordPage.js

import React, { useState } from 'react';
import api from '../../api';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess('If an account with that email exists, a password reset link has been sent.');
        } catch (err) {
            setSuccess('If an account with that email exists, a password reset link has been sent.');
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
                            <Mail className="w-8 h-8 text-blue-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Forgot Password</h2>
                        <p className="text-gray-500 mt-2">No worries! Enter your email to receive a reset link.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg" role="alert">{error}</div>}
                        {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded-r-lg" role="alert">{success}</div>}
                        
                        <div className="relative">
                            <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="Enter your registered email" 
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" 
                                required 
                            />
                        </div>

                        <button type="submit" disabled={loading || success} className="w-full flex justify-center items-center space-x-2 text-white font-bold py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed transform hover:-translate-y-0.5 hover:shadow-lg">
                            <Send size={16} />
                            <span>{loading ? 'Sending Link...' : 'Send Reset Link'}</span>
                        </button>
                    </form>
                    <div className="text-center mt-8">
                        <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-700 flex items-center justify-center transition-colors">
                            <ArrowLeft size={16} className="mr-1" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};