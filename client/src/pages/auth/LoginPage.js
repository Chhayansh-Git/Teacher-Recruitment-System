import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, BookOpen, Loader2 } from 'lucide-react';

export const LoginPage = () => {
    const [role, setRole] = useState('candidate');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const loggedInUser = await login(role, email, password);
            const redirectRole = loggedInUser.role === 'super-admin' ? 'admin' : loggedInUser.role;
            navigate(`/${redirectRole}/dashboard`);
        } catch (err) {
            // --- THIS IS THE FIX ---
            // It checks if the error is an object and extracts the message string.
            const errorData = err.response?.data?.error || err.response?.data;
            if (typeof errorData === 'object' && errorData !== null && errorData.message) {
                setError(errorData.message);
            } else if (typeof errorData === 'string') {
                setError(errorData);
            } else {
                setError('Login failed. Please check your credentials.');
            }
            // --- END FIX ---
        } finally {
            setLoading(false);
        }
    };
    
    const getRoleConfig = () => {
        switch (role) {
            case 'school': return { title: 'School Portal', placeholder: 'Enter School Email or Username', gradient: 'from-blue-500 to-indigo-600', accent: 'blue' };
            case 'admin': return { title: 'Admin Panel', placeholder: 'Enter Admin Email', gradient: 'from-gray-700 to-gray-900', accent: 'gray' };
            case 'candidate': default: return { title: 'Candidate Portal', placeholder: 'Enter Your Email', gradient: 'from-teal-500 to-cyan-600', accent: 'teal' };
        }
    };
    const { title, placeholder, gradient, accent } = getRoleConfig();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
            <div className={`w-full max-w-4xl mx-auto grid md:grid-cols-2 rounded-2xl overflow-hidden transition-all duration-700 ease-in-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="hidden md:block relative">
                    <img src="https://images.unsplash.com/photo-1571260899304-4252457e562d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80" alt="Modern school building" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-8 flex flex-col justify-end text-white">
                        <h2 className="text-3xl font-bold mb-2">Teacher Recruitment</h2>
                        <p className="opacity-90">Connecting talented educators with the best institutions.</p>
                    </div>
                </div>
                
                <div className="p-8 md:p-12 bg-white/70 backdrop-blur-xl shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 bg-white rounded-full shadow-md mb-4">
                            <BookOpen className={`w-8 h-8 text-${accent}-500`} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
                        <p className="text-gray-600 mt-2">Welcome back! Please sign in to your account.</p>
                    </div>

                    <div className="flex justify-center mb-8 rounded-full p-1 bg-gray-200/50">
                        <button onClick={() => setRole('candidate')} className={`w-1/3 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${role === 'candidate' ? `bg-white shadow-md text-teal-600` : 'text-gray-500 hover:bg-white/50'}`}>Candidate</button>
                        <button onClick={() => setRole('school')} className={`w-1/3 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${role === 'school' ? `bg-white shadow-md text-blue-600` : 'text-gray-500 hover:bg-white/50'}`}>School</button>
                        <button onClick={() => setRole('admin')} className={`w-1/3 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${role === 'admin' ? `bg-white shadow-md text-gray-700` : 'text-gray-500 hover:bg-white/50'}`}>Admin</button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-r-lg text-sm" role="alert">{error}</div>}
                        
                        <div className="relative">
                            <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
                            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={placeholder} className={`w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accent}-400 transition-all duration-300`} required />
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={`w-full pl-12 pr-12 py-3 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${accent}-400 transition-all duration-300`} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-gray-700">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                        </div>

                        <div className="text-right">
                            <Link to="/forgot-password" className={`text-sm font-medium text-${accent}-600 hover:text-${accent}-800 hover:underline`}>Forgot Password?</Link>
                        </div>
                        
                        <button type="submit" disabled={loading} className={`w-full flex items-center justify-center text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 bg-gradient-to-r ${gradient} ${loading ? 'opacity-70 cursor-not-allowed' : `hover:opacity-90 transform hover:-translate-y-1 hover:shadow-xl`}`}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                        
                        <div className="text-center pt-4">
                            <p className="text-sm text-gray-600">Don't have an account?{' '}<Link to="/register" className={`font-semibold text-${accent}-600 hover:text-${accent}-800 hover:underline`}>Register Here</Link></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};