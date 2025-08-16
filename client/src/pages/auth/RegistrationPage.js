import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Users, Building, Phone, Globe, BookUser, Briefcase, MapPin, Hash, Eye, EyeOff, GraduationCap, School as SchoolIcon, ArrowRight, UserCheck } from 'lucide-react';
import formSchemas from '../../config/formSchemas';

export const RegistrationPage = () => {
    const [role, setRole] = useState('candidate');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '', contactNo: '', fullName: '', password: '', confirmPassword: '', type: 'teaching', position: 'Primary Teacher',
        name: '', affiliationNo: '', address: '', location: '', pincode: '', whatsappNumber: '', website: '',
        principalName: '', directorName: '', strength: 500, schoolUpto: 'XII', board: 'CBSE', acceptedTerms: false,
    });
    
    useEffect(() => {
        if (role === 'candidate') {
            const validPositions = Object.keys(formSchemas[formData.type]);
            setFormData(prev => ({ ...prev, position: validPositions[0] || '' }));
        }
    }, [formData.type, role]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (role === 'candidate' && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
        
        try {
            const message = await register(role, formData);
            // FIX: Redirect to profile completion instead of OTP page directly from here.
            // The OTP step should ideally be part of the 'register' service and resolve before this.
            setSuccess(`${message}. Redirecting to complete your profile...`);
            setTimeout(() => {
                navigate('/complete-profile');
            }, 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Registration failed.';
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        } finally {
            setLoading(false);
        }
    };
    
    const { gradient, title } = role === 'candidate' 
        ? { gradient: 'from-teal-500 to-cyan-500', title: 'Candidate Registration' }
        : { gradient: 'from-blue-500 to-indigo-500', title: 'School Registration' };

    // ... The rest of the JSX for this component remains the same
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-4">{role === 'candidate' ? <GraduationCap className="w-16 h-16 text-teal-500" /> : <SchoolIcon className="w-16 h-16 text-blue-500" />}</div>
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{title}</h2>
                    <p className="text-center text-gray-500 mb-6">Create an account to get started.</p>
                    <div className="flex justify-center mb-6 rounded-full p-1 bg-gray-100">
                        <button onClick={() => setRole('candidate')} className={`w-1/2 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${role === 'candidate' ? 'bg-white shadow-md text-teal-600' : 'text-gray-500'}`}>I'm a Candidate</button>
                        <button onClick={() => setRole('school')} className={`w-1/2 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${role === 'school' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500'}`}>I'm a School</button>
                    </div>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">{error}</div>}
                        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm" role="alert">{success}</div>}
                        {role === 'candidate' ? <CandidateFormFields formData={formData} handleInputChange={handleInputChange} showPassword={showPassword} setShowPassword={setShowPassword} /> : <SchoolFormFields formData={formData} handleInputChange={handleInputChange} />}
                        <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 bg-gradient-to-r ${gradient} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>{loading ? 'Registering...' : 'Create Account'}<ArrowRight className="inline-block ml-2" size={16} /></button>
                        <div className="mt-6 text-center"><p className="text-sm text-gray-600">Already have an account?{' '}<Link to="/login" className="font-medium text-blue-600 hover:underline">Sign In</Link></p></div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const CandidateFormFields = ({ formData, handleInputChange, showPassword, setShowPassword }) => {
    const positionOptions = Object.keys(formSchemas[formData.type] || {});

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><InputField icon={<User />} name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name" required /></div>
            <InputField icon={<Mail />} name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" required />
            <InputField icon={<Phone />} name="contactNo" value={formData.contactNo} onChange={handleInputChange} placeholder="Contact Number" required />
            <div className="relative">
                <InputField icon={<Lock />} name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} placeholder="Password" required />
                <PasswordToggle show={showPassword} setShow={setShowPassword} />
            </div>
            <InputField icon={<Lock />} name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm Password" required />
            <SelectField icon={<Briefcase />} name="type" value={formData.type} onChange={handleInputChange}><option value="teaching">Teaching</option><option value="nonTeaching">Non-Teaching</option></SelectField>
            <SelectField icon={<BookUser />} name="position" value={formData.position} onChange={handleInputChange}>
                {positionOptions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
            </SelectField>
        </div>
    );
};

const SchoolFormFields = ({ formData, handleInputChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <h3 className="md:col-span-2 text-lg font-semibold text-gray-700 border-b pb-2">School Information</h3>
        <InputField icon={<Building />} name="name" value={formData.name} onChange={handleInputChange} placeholder="School Name" required />
        <InputField icon={<Hash />} name="affiliationNo" value={formData.affiliationNo} onChange={handleInputChange} placeholder="Affiliation No." required />
        <div className="md:col-span-2"><InputField icon={<MapPin />} name="address" value={formData.address} onChange={handleInputChange} placeholder="Full Address" required /></div>
        <InputField icon={<MapPin />} name="location" value={formData.location} onChange={handleInputChange} placeholder="City/Location" required />
        <InputField icon={<Hash />} name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Pincode" required />
        <InputField icon={<Users />} name="strength" type="number" value={formData.strength} onChange={handleInputChange} placeholder="Total Student Strength" required />
        <div className="flex items-center space-x-4">
            <SelectField icon={<GraduationCap />} name="schoolUpto" value={formData.schoolUpto} onChange={handleInputChange}><option value="V">Up to V</option><option value="X">Up to X</option><option value="XII">Up to XII</option></SelectField>
            <SelectField icon={<BookUser />} name="board" value={formData.board} onChange={handleInputChange}><option value="CBSE">CBSE</option><option value="ICSE">ICSE</option><option value="State">State</option><option value="IB">IB</option><option value="IGCSE">IGCSE</option></SelectField>
        </div>
        <h3 className="md:col-span-2 text-lg font-semibold text-gray-700 border-b pb-2 mt-4">Contact & Leadership</h3>
        <InputField icon={<Mail />} name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Official Email Address" required />
        <InputField icon={<Phone />} name="contactNo" value={formData.contactNo} onChange={handleInputChange} placeholder="Contact Number" required />
        <InputField icon={<Phone color="green"/>} name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} placeholder="WhatsApp Number (Optional)" />
        <InputField icon={<Globe />} name="website" value={formData.website} onChange={handleInputChange} placeholder="Website (Optional)" />
        <InputField icon={<UserCheck />} name="principalName" value={formData.principalName} onChange={handleInputChange} placeholder="Principal Name (Optional)" />
        <InputField icon={<UserCheck />} name="directorName" value={formData.directorName} onChange={handleInputChange} placeholder="Director Name (Optional)" />
        <div className="md:col-span-2 mt-4">
            <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" name="acceptedTerms" checked={formData.acceptedTerms} onChange={handleInputChange} className="form-checkbox h-4 w-4 text-blue-600 rounded" required />
                <span className="ml-2">I accept the <button type="button" className="text-blue-600 hover:underline">Terms and Conditions</button></span>
            </label>
        </div>
    </div>
);

const InputField = ({ icon, ...props }) => (<div className="relative">{icon && <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">{icon}</div>}<input {...props} className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition`} /></div>);
const SelectField = ({ icon, children, ...props }) => (<div className="relative">{icon && <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">{icon}</div>}<select {...props} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none">{children}</select><div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 pointer-events-none"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div></div>);
const PasswordToggle = ({ show, setShow }) => (<button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700">{show ? <EyeOff size={20} /> : <Eye size={20} />}</button>);