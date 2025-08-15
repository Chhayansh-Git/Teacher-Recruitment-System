import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Edit, Briefcase, Users, GraduationCap, Calendar, DollarSign, Save, ArrowLeft } from 'lucide-react';

const EditRequirementPage = () => {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchRequirement = async () => {
            try {
                const response = await api.get(`/schools/requirements/${id}`);
                const data = response.data.data;
                // Convert arrays to comma-separated strings for form fields
                setFormData({
                    ...data,
                    posts: data.posts.join(', '),
                    subjects: data.subjects.join(', '),
                });
            } catch (err) {
                setError('Failed to load requirement data.');
            } finally {
                setLoading(false);
            }
        };
        fetchRequirement();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                ...formData,
                noOfCandidates: Number(formData.noOfCandidates),
                experience: Number(formData.experience),
                minExperience: Number(formData.minExperience),
                maxSalary: formData.maxSalary ? Number(formData.maxSalary) : undefined,
                posts: formData.posts.split(',').map(s => s.trim()).filter(Boolean),
                subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
            };

            await api.put(`/schools/requirements/${id}`, payload);
            
            setSuccess('Requirement updated successfully! Redirecting...');
            setTimeout(() => navigate('/school/requirements'), 2000);

        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update requirement.');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <div className="text-center p-8">Loading form...</div>;
    if (error && !formData) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto">
             <div className="mb-6">
                <Link to="/school/requirements" className="flex items-center space-x-2 text-blue-600 hover:underline">
                    <ArrowLeft size={18} />
                    <span>Back to All Requirements</span>
                </Link>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-4 mb-6 border-b pb-4">
                    <Edit size={32} className="text-blue-600" />
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Edit Requirement</h2>
                        <p className="text-gray-500">Update the details for this job posting.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p>{error}</p></div>}
                    {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert"><p>{success}</p></div>}

                    {formData && (
                        <>
                            <FormSection title="Basic Details">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Requirement Title" name="title" value={formData.title} onChange={handleInputChange} required icon={<Briefcase />} />
                                    <InputField label="Number of Candidates Needed" name="noOfCandidates" type="number" min="1" value={formData.noOfCandidates} onChange={handleInputChange} required icon={<Users />} />
                                </div>
                            </FormSection>
                            <FormSection title="Role Specifics">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Posts (comma-separated)" name="posts" value={formData.posts} onChange={handleInputChange} icon={<Users />} />
                                    <InputField label="Subjects (comma-separated)" name="subjects" value={formData.subjects} onChange={handleInputChange} icon={<Briefcase />} />
                                    <SelectField label="Type" name="teachingOrNonTeaching" value={formData.teachingOrNonTeaching} onChange={handleInputChange}><option value="Teaching">Teaching</option><option value="Non-Teaching">Non-Teaching</option></SelectField>
                                    <SelectField label="Gender Preference" name="gender" value={formData.gender} onChange={handleInputChange}><option value="Any">Any</option><option value="Male">Male</option><option value="Female">Female</option></SelectField>
                                </div>
                            </FormSection>
                            <FormSection title="Candidate Criteria">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Minimum Qualification Required" name="minQualification" value={formData.minQualification} onChange={handleInputChange} required icon={<GraduationCap />} />
                                    <InputField label="Preferred Qualification" name="qualification" value={formData.qualification} onChange={handleInputChange} required icon={<GraduationCap />} />
                                    <InputField label="Minimum Experience (years)" name="minExperience" type="number" min="0" value={formData.minExperience} onChange={handleInputChange} required icon={<Calendar />} />
                                    <InputField label="Preferred Experience (years)" name="experience" type="number" min="0" value={formData.experience} onChange={handleInputChange} required icon={<Calendar />} />
                                    <InputField label="Maximum Salary (p.a.)" name="maxSalary" type="number" min="0" value={formData.maxSalary} onChange={handleInputChange} icon={<DollarSign />} />
                                </div>
                            </FormSection>
                            <div className="flex justify-end pt-6 border-t">
                                <button type="submit" disabled={loading} className="flex items-center space-x-2 py-2.5 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300">
                                    {loading ? 'Saving...' : 'Save Changes'}
                                    {!loading && <Save size={18} />}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

const FormSection = ({ title, children }) => (<section><h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">{title}</h3><div className="pl-2">{children}</div></section>);
const InputField = ({ label, icon, ...props }) => (<div><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{icon}</div><input {...props} className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div></div>);
const SelectField = ({ label, children, ...props }) => (<div><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><select {...props} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">{children}</select></div>);

export default EditRequirementPage;