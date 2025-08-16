import React, { useState } from 'react';
import api from '../../api';
import { Mail, ArrowLeft } from 'lucide-react'; // Removed 'Send'
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Forgot Password</h2>
                    <p className="text-center text-gray-500 mb-8">Enter your email to receive a reset link.</p>
                    
                    <form onSubmit={handleSubmit}>
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4">{error}</div>}
                        {success && <div className="bg-green-100 text-green-700 p-3 rounded-md text-sm mb-4">{success}</div>}
                        
                        <div className="relative mb-6">
                            <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="Enter your registered email" 
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
                                required 
                            />
                        </div>

                        <button type="submit" disabled={loading || success} className="w-full text-white font-bold py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition disabled:bg-blue-300">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <Link to="/login" className="text-sm font-medium text-gray-600 hover:underline flex items-center justify-center">
                            <ArrowLeft size={16} className="mr-1" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};