import React, { useState } from 'react';
import api from '../../api';
// --- FIX: Removed unused 'Check', 'Star', and 'MessageSquare' icons ---
import { X, Send } from 'lucide-react';

const CompleteInterviewModal = ({ isOpen, onClose, interview, onSuccess }) => {
    const [formData, setFormData] = useState({
        feedback: '',
        score: 5,
        status: 'completed',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { ...formData, score: Number(formData.score) };
            await api.put(`/interviews/${interview._id}/complete`, payload);
            onSuccess();
        } catch (err) {
            const errorMessage = err.response?.data?.error;
            setError(typeof errorMessage === 'string' ? errorMessage : 'An unexpected server error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Complete Interview</h3>
                        <p className="text-sm text-gray-500">For: {interview?.candidate?.fullName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border rounded-lg">
                            <option value="completed">Completed</option>
                            <option value="no_show">No Show</option>
                            <option value="canceled">Canceled</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                        <textarea id="feedback" name="feedback" rows="4" value={formData.feedback} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border rounded-lg" placeholder="Enter your feedback about the candidate..."></textarea>
                    </div>
                    <div>
                        <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">Score (out of 10)</label>
                        <input type="number" id="score" name="score" min="0" max="10" step="1" value={formData.score} onChange={handleInputChange} className="w-full p-2 bg-gray-50 border rounded-lg" />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={loading} className="flex items-center space-x-2 py-2 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300">
                            {loading ? 'Submitting...' : 'Submit Feedback'}
                            {!loading && <Send size={16} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompleteInterviewModal;