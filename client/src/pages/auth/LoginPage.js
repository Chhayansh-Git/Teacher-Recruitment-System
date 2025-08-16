import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Building, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
    const [role, setRole] = useState('candidate');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const loggedInUser = await login(role, email, password);
            const redirectRole = loggedInUser.role === 'super-admin' ? 'admin' : loggedInUser.role;
            navigate(`/${redirectRole}/dashboard`);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };
    
    const getRoleConfig = () => {
        switch (role) {
            case 'school': return { icon: <Building className="w-16 h-16 text-blue-500" />, title: 'School Login', placeholder: 'Enter School Email or Username', gradient: 'from-blue-500 to-indigo-500' };
            case 'admin': return { icon: <ShieldCheck className="w-16 h-16 text-gray-700" />, title: 'Admin Login', placeholder: 'Enter Admin Email', gradient: 'from-gray-700 to-gray-900' };
            case 'candidate': default: return { icon: <UserIcon className="w-16 h-16 text-teal-500" />, title: 'Candidate Login', placeholder: 'Enter Your Email', gradient: 'from-teal-500 to-cyan-500' };
        }
    };
    const { icon, title, placeholder, gradient } = getRoleConfig();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-6">{icon}</div>
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{title}</h2>
                    <p className="text-center text-gray-500 mb-8">Welcome back! Please sign in.</p>
                    <div className="flex justify-center mb-8 rounded-full p-1 bg-gray-100">
                        <button onClick={() => setRole('candidate')} className={`w-1/3 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${role === 'candidate' ? 'bg-white shadow-md text-teal-600' : 'text-gray-500'}`}>Candidate</button>
                        <button onClick={() => setRole('school')} className={`w-1/3 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${role === 'school' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500'}`}>School</button>
                        <button onClick={() => setRole('admin')} className={`w-1/3 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${role === 'admin' ? 'bg-white shadow-md text-gray-700' : 'text-gray-500'}`}>Admin</button>
                    </div>
                    <form onSubmit={handleLogin}>
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm" role="alert">{error}</div>}
                        <div className="relative mb-6">
                            <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
                            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={placeholder} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                        </div>
                        <div className="text-right mt-2">
                            <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <button type="submit" disabled={loading} className={`w-full mt-4 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 bg-gradient-to-r ${gradient} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>{loading ? 'Signing In...' : 'Sign In'}</button>
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-600">Don't have an account?{' '}<Link to="/register" className="font-medium text-blue-600 hover:underline">Register Here</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};