import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../api';
import { Mail, ArrowLeft, Save } from 'lucide-react';

const fetchTemplate = async (key) => {
    const { data } = await api.get(`/email-templates/${key}`);
    return data.data;
};

const saveTemplate = ({ key, data }) => {
    if (key) {
        return api.put(`/email-templates/${key}`, data);
    }
    return api.post('/email-templates', data);
};

const EmailTemplateFormPage = () => {
    const { key } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEditMode = Boolean(key);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const { data: templateData, isLoading } = useQuery({
        queryKey: ['emailTemplate', key],
        queryFn: () => fetchTemplate(key),
        enabled: isEditMode,
    });

    useEffect(() => {
        if (isEditMode && templateData) {
            reset(templateData);
        }
    }, [templateData, isEditMode, reset]);

    const mutation = useMutation({
        mutationFn: saveTemplate,
        onSuccess: () => {
            alert(`Template ${isEditMode ? 'updated' : 'created'} successfully!`);
            queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
            navigate('/admin/email-templates');
        },
        onError: (err) => {
            alert(`Error: ${err.response?.data?.error || 'Failed to save template.'}`);
        }
    });

    const onSubmit = (data) => {
        mutation.mutate({ key, data });
    };

    if (isLoading) return <div className="text-center p-8">Loading template...</div>;

    return (
        <div>
            <div className="mb-6">
                <Link to="/admin/email-templates" className="flex items-center space-x-2 text-blue-600 hover:underline">
                    <ArrowLeft size={18} />
                    <span>Back to All Templates</span>
                </Link>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-4 mb-6 border-b pb-4">
                    <Mail size={32} className="text-blue-600" />
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">{isEditMode ? 'Edit Email Template' : 'Create New Template'}</h2>
                        {/* --- FINAL FIX: Wrapped the string in {' '} to ensure it's treated as a literal --- */}
                        <p className="text-gray-500">{'Use placeholders like {{name}} or {{otp}} in the body.'}</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="key" className="block text-sm font-medium text-gray-700">Template Key</label>
                        <input id="key" {...register('key', { required: 'Key is required' })} readOnly={isEditMode || templateData?.reserved} className="mt-1 block w-full p-2 border border-gray-300 rounded-md read-only:bg-gray-100 read-only:cursor-not-allowed" />
                        {errors.key && <p className="text-red-500 text-xs mt-1">{errors.key.message}</p>}
                        {templateData?.reserved && <p className="text-xs text-yellow-600 mt-1">This is a reserved template and its key cannot be changed.</p>}
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                        <input id="subject" {...register('subject', { required: 'Subject is required' })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="body" className="block text-sm font-medium text-gray-700">Body (HTML allowed)</label>
                        <textarea id="body" {...register('body', { required: 'Body is required' })} rows="15" className="mt-1 block w-full p-2 border border-gray-300 rounded-md font-mono text-sm"></textarea>
                        {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body.message}</p>}
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={mutation.isPending} className="flex items-center space-x-2 py-2.5 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300">
                            <Save size={18} />
                            <span>{mutation.isPending ? 'Saving...' : 'Save Template'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmailTemplateFormPage;