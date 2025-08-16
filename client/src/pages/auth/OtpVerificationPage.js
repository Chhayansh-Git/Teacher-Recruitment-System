import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const OtpVerificationPage = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendStatus, setResendStatus] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();
    const { authenticateWithToken } = useAuth();

    const { email, role } = location.state || {};

    useEffect(() => {
        if (!email || !role) {
            navigate('/register');
        }
    }, [email, role, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // --- THIS IS THE FIX ---
            // The 'role' is now included in the payload for the API call.
            const payload = { email, otp, role };
            // --------------------

            if (role === 'school') {
                const response = await api.post('/schools/verify-otp', payload);
                setSuccess(`Verification successful! Your username is: ${response.data.data.username}. Please login.`);
                setTimeout(() => navigate('/login'), 5000);
            } else {
                const response = await api.post('/auth/verify-otp', payload);
                const token = response.data.token;
                await authenticateWithToken(token, role);
                
                const redirectRole = role === 'super-admin' ? 'admin' : role;
                navigate(`/${redirectRole}/dashboard`);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Verification failed. Please check the OTP and try again.';
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendStatus('Sending...');
        setError('');
        try {
            const endpoint = role === 'school' ? '/schools/resend-otp' : '/auth/resend-otp';
            await api.post(endpoint, { email });
            setResendStatus('A new OTP has been sent.');
        } catch (err) {
            setResendStatus('');
            setError('Failed to resend OTP. Please try again in a moment.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-6"><ShieldCheck className="w-16 h-16 text-green-500" /></div>
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Account Verification</h2>
                    <p className="text-center text-gray-500 mb-8">An OTP has been sent to <span className="font-semibold text-gray-700">{email}</span>. Please enter it below.</p>
                    
                    <form onSubmit={handleVerify}>
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm" role="alert">{error}</div>}
                        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 text-sm" role="alert">{success}</div>}
                        
                        <div className="relative mb-6">
                            <KeyRound className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                                placeholder="Enter 6-Digit OTP" 
                                maxLength="6"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition text-center tracking-[0.5em]" 
                                required 
                            />
                        </div>

                        <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-green-500 to-emerald-500 ${loading ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}`}>
                            {loading ? 'Verifying...' : 'Verify Account'}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Didn't receive the code?{' '}
                            <button onClick={handleResend} disabled={!!resendStatus && resendStatus === 'Sending...'} className="font-medium text-blue-600 hover:underline disabled:text-gray-400">
                                Resend OTP
                            </button>
                        </p>
                        {resendStatus && <p className="text-sm text-green-600 mt-2">{resendStatus}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};