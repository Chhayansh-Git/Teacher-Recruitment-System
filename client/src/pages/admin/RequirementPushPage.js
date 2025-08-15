import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import { ArrowLeft, Building, Sparkles, Send } from 'lucide-react';

// Fetcher for requirement details and AI-matched candidates
const fetchRequirementAndMatches = async (requirementId) => {
    const [reqResponse, matchResponse] = await Promise.all([
        api.get(`/admin/requirements/${requirementId}`),
        api.get(`/admin/match/${requirementId}`)
    ]);
    return {
        requirement: reqResponse.data.data,
        matchedCandidates: matchResponse.data.data,
    };
};

// Pusher for selected candidates
const pushCandidates = ({ requirementId, candidateIds }) => {
    return api.post(`/admin/requirements/${requirementId}/push-candidates`, { candidateIds });
};

const RequirementPushPage = () => {
    const { id: requirementId } = useParams();
    const queryClient = useQueryClient();
    const [selectedCandidates, setSelectedCandidates] = useState(new Set());

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['requirementMatches', requirementId],
        queryFn: () => fetchRequirementAndMatches(requirementId),
        enabled: !!requirementId,
        retry: false, // Prevent retrying on 404 errors
    });

    const mutation = useMutation({
        mutationFn: pushCandidates,
        onSuccess: () => {
            alert(`${selectedCandidates.size} candidates pushed successfully!`);
            setSelectedCandidates(new Set());
            queryClient.invalidateQueries({ queryKey: ['requirementMatches', requirementId] });
        },
        onError: (err) => {
            alert(`Error: ${err.response?.data?.error || 'Failed to push candidates.'}`);
        }
    });

    const handleSelectCandidate = (candidateId) => {
        setSelectedCandidates(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(candidateId)) {
                newSelection.delete(candidateId);
            } else {
                newSelection.add(candidateId);
            }
            return newSelection;
        });
    };

    const handlePushClick = () => {
        if (selectedCandidates.size === 0) {
            alert('Please select at least one candidate to push.');
            return;
        }
        mutation.mutate({ requirementId, candidateIds: Array.from(selectedCandidates) });
    };

    if (isLoading) return <div className="text-center p-8">Fetching matches...</div>;
    
    if (isError) {
        const errorMessage = error.response?.data?.error || error.message || "An unknown error occurred.";
        return (
            <div className="text-center p-8 text-red-500">
                <h3 className="text-xl font-bold mb-2">Failed to Load Page</h3>
                <p>Error: {errorMessage}</p>
                <p className="mt-4 text-sm text-gray-600">Please ensure the requirement ID in the URL is correct and the record exists.</p>
                <Link to="/admin/requirements" className="mt-4 inline-block text-blue-600 hover:underline">
                    &larr; Go back to all requirements
                </Link>
            </div>
        );
    }

    const { requirement, matchedCandidates } = data || {};

    return (
        <div>
            <div className="mb-6">
                <Link to="/admin/requirements" className="flex items-center space-x-2 text-blue-600 hover:underline">
                    <ArrowLeft size={18} />
                    <span>Back to All Requirements</span>
                </Link>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                <div className="flex items-center space-x-2 text-gray-500">
                    <Building size={16} />
                    <span>{requirement?.school?.name}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mt-2">{requirement?.title}</h2>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                    <Sparkles className="text-purple-500" />
                    <h3 className="text-xl font-semibold text-gray-700">AI Matched Candidates</h3>
                </div>
                <div className="space-y-3">
                    {(matchedCandidates?.length ?? 0) > 0 ? matchedCandidates.map(({ candidate, aiScore }) => (
                        <div key={candidate._id} className={`p-4 border rounded-lg flex items-center gap-4 transition ${selectedCandidates.has(candidate._id) ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-white'}`}>
                            <input 
                                type="checkbox"
                                checked={selectedCandidates.has(candidate._id)}
                                onChange={() => handleSelectCandidate(candidate._id)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <p className="font-bold">{candidate.fullName}</p>
                                <p className="text-sm text-gray-500">{candidate.position}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-600">{(aiScore * 100).toFixed(1)}%</p>
                                <p className="text-xs text-gray-400">Match Score</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-500 text-center p-4">No suitable candidates found. The rule-based filter may be too strict.</p>
                    )}
                </div>
                <div className="mt-6 pt-6 border-t flex justify-end">
                    <button 
                        onClick={handlePushClick}
                        disabled={mutation.isPending || selectedCandidates.size === 0}
                        className="flex items-center space-x-2 py-2.5 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                        <span>Push {selectedCandidates.size} Selected Candidates</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequirementPushPage;