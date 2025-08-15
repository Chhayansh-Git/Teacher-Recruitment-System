import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import { ArrowLeft, Briefcase, Users, GraduationCap, Calendar, DollarSign, Edit, UserCheck, Mail, Phone, Clock, CheckCircle, Award } from 'lucide-react';
import ScheduleInterviewModal from '../../components/school/ScheduleInterviewModal';
import CompleteInterviewModal from '../../components/school/CompleteInterviewModal';
import CandidateDetailsModal from '../../components/school/CandidateDetailsModal';

const RequirementDetailsPage = () => {
    const [requirement, setRequirement] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id } = useParams();

    const [scheduleModal, setScheduleModal] = useState({ isOpen: false, candidate: null });
    const [completeModal, setCompleteModal] = useState({ isOpen: false, interview: null });
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, candidate: null });

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [reqResponse, pushResponse, shortlistResponse, interviewResponse] = await Promise.all([
                api.get(`/schools/requirements/${id}`),
                api.get(`/push?requirementId=${id}`),
                api.get(`/shortlists?requirementID=${id}`),
                api.get(`/interviews?requirementID=${id}`)
            ]);

            setRequirement(reqResponse.data.data);
            setInterviews(interviewResponse.data.data || []);
            
            const pushedData = pushResponse.data.data.find(p => p.requirement?._id === id)?.candidates || [];
            const shortlistData = shortlistResponse.data.data || [];
            const interviewData = interviewResponse.data.data || [];
            
            const shortlistMap = new Map(shortlistData.map(s => [s.candidate._id, s]));
            const interviewMap = new Map(interviewData.map(i => [i.candidate._id, i]));

            const mergedCandidates = pushedData.map(p => ({
                ...p.candidate,
                score: p.score,
                shortlist: shortlistMap.get(p.candidate._id),
                interview: interviewMap.get(p.candidate._id),
                status: shortlistMap.get(p.candidate._id)?.status || 'pushed',
            }));

            setCandidates(mergedCandidates);

        } catch (err) {
            setError('Failed to fetch requirement details or candidates.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { if (id) fetchAllData(); }, [id, fetchAllData]);

    const handleShortlist = async (candidateId) => {
        try {
            await api.post('/shortlists', {
                candidate: candidateId,
                requirement: requirement._id,
                school: requirement.school,
            });
            alert('Candidate shortlisted successfully!');
            fetchAllData();
        } catch (err) {
            alert('Failed to shortlist candidate. They may have already been shortlisted.');
        }
    };

    const handleHire = async (shortlistId) => {
        if (window.confirm('Are you sure you want to hire this candidate?')) {
            try {
                await api.put(`/shortlists/${shortlistId}`, { status: 'hired' });
                alert('Candidate hired successfully!');
                fetchAllData();
            } catch (err) {
                alert('Failed to hire candidate.');
            }
        }
    };
    
    const handleOpenScheduleModal = (candidate) => setScheduleModal({ isOpen: true, candidate });
    const handleScheduleSuccess = () => { setScheduleModal({ isOpen: false, candidate: null }); fetchAllData(); };
    
    const handleOpenCompleteModal = (interview) => setCompleteModal({ isOpen: true, interview });
    const handleCompleteSuccess = () => { setCompleteModal({ isOpen: false, interview: null }); fetchAllData(); };

    const handleOpenDetailsModal = (candidate) => setDetailsModal({ isOpen: true, candidate });

    if (loading) return <div className="text-center p-8">Loading details...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!requirement) return <div className="text-center p-8">Requirement not found.</div>;

    return (
        <>
            <ScheduleInterviewModal isOpen={scheduleModal.isOpen} onClose={() => setScheduleModal({ isOpen: false, candidate: null })} candidate={scheduleModal.candidate} requirement={requirement} schoolId={requirement.school} onSuccess={handleScheduleSuccess} />
            <CompleteInterviewModal isOpen={completeModal.isOpen} onClose={() => setCompleteModal({ isOpen: false, interview: null })} interview={completeModal.interview} onSuccess={handleCompleteSuccess} />
            <CandidateDetailsModal isOpen={detailsModal.isOpen} onClose={() => setDetailsModal({ isOpen: false, candidate: null })} candidate={detailsModal.candidate} />

            <div className="max-w-7xl mx-auto">
                <div className="mb-6"><Link to="/school/requirements" className="flex items-center space-x-2 text-blue-600 hover:underline"><ArrowLeft size={18} /><span>Back to All Requirements</span></Link></div>
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start mb-6 border-b pb-4">
                        <div><h2 className="text-3xl font-bold text-gray-800">{requirement.title}</h2><p className="text-gray-500">Posted on {new Date(requirement.postedAt).toLocaleDateString()}</p></div>
                        <Link to={`/school/requirements/edit/${requirement._id}`} className="flex items-center space-x-2 py-2 px-4 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition"><Edit size={16} /><span>Edit</span></Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                        <InfoCard icon={<Users />} label="Candidates Needed" value={requirement.noOfCandidates} />
                        <InfoCard icon={<Briefcase />} label="Type" value={requirement.teachingOrNonTeaching} />
                        <InfoCard icon={<Users />} label="Gender Preference" value={requirement.gender} />
                        <InfoCard icon={<GraduationCap />} label="Min. Qualification" value={requirement.minQualification} />
                        <InfoCard icon={<Calendar />} label="Min. Experience" value={`${requirement.minExperience} years`} />
                        <InfoCard icon={<DollarSign />} label="Max Salary (p.a.)" value={requirement.maxSalary ? `₹${requirement.maxSalary.toLocaleString('en-IN')}` : 'Not specified'} />
                    </div>
                    
                    <div className="mt-8 pt-6 border-t">
                         <h3 className="text-xl font-semibold text-gray-700 mb-4">Candidate Pipeline</h3>
                         {candidates.length > 0 ? (
                            <div className="space-y-4">{candidates.map((candidate) => (<CandidateCard key={candidate._id} candidate={candidate} onShortlist={() => handleShortlist(candidate._id)} onHire={() => handleHire(candidate.shortlist._id)} onScheduleInterview={() => handleOpenScheduleModal(candidate)} onCompleteInterview={() => handleOpenCompleteModal(candidate.interview)} />))}</div>
                         ) : <div className="text-center p-8 bg-gray-50 rounded-lg"><p className="text-gray-500">No candidates have been pushed yet.</p></div>}
                    </div>

                    <div className="mt-8 pt-6 border-t">
                         <h3 className="text-xl font-semibold text-gray-700 mb-4">Scheduled Interviews</h3>
                         {interviews.length > 0 ? (
                            <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50"><tr><th className="p-3">Candidate</th><th className="p-3">Date & Time</th><th className="p-3">Mode</th><th className="p-3">Status</th></tr></thead><tbody>{interviews.map(interview => (<tr key={interview._id} className="border-b"><td className="p-3 font-medium"><button onClick={() => handleOpenDetailsModal(interview.candidate)} className="text-blue-600 hover:underline">{interview.candidate?.fullName}</button></td><td className="p-3">{new Date(interview.scheduledAt).toLocaleString()}</td><td className="p-3">{interview.mode}</td><td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${interview.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{interview.status}</span></td></tr>))}</tbody></table></div>
                         ) : <div className="text-center p-8 bg-gray-50 rounded-lg"><p className="text-gray-500">No interviews have been scheduled yet.</p></div>}
                    </div>
                </div>
            </div>
        </>
    );
};

// --- FIX: Restored the full helper component implementations ---

const InfoCard = ({ icon, label, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3 text-gray-500">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <p className="text-lg font-bold text-gray-800 mt-2">{value}</p>
    </div>
);

const CandidateCard = ({ candidate, onShortlist, onScheduleInterview, onCompleteInterview, onHire }) => {
    if (!candidate) return null;

    const renderActionButton = () => {
        const interviewStatus = candidate.interview?.status;
        const shortlistStatus = candidate.status;

        if (shortlistStatus === 'hired') {
            return <div className="w-full text-center py-2 px-4 bg-green-100 text-green-700 rounded-lg font-medium text-sm flex justify-center items-center space-x-2"><Award size={16} /><span>Hired</span></div>;
        }
        if (interviewStatus === 'completed') {
            return <button onClick={onHire} className="w-full flex justify-center items-center space-x-2 py-2 px-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"><Award size={16} /><span>Mark as Hired</span></button>;
        }
        if (shortlistStatus === 'shortlisted' || shortlistStatus === 'invited') {
            if (interviewStatus === 'scheduled') {
                return <button onClick={onCompleteInterview} className="w-full flex justify-center items-center space-x-2 py-2 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"><CheckCircle size={16} /><span>Complete Interview</span></button>;
            }
            return <button onClick={onScheduleInterview} className="w-full flex justify-center items-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"><Clock size={16} /><span>Schedule Interview</span></button>;
        }
        if (shortlistStatus === 'pushed') {
            return <button onClick={onShortlist} className="w-full flex justify-center items-center space-x-2 py-2 px-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"><UserCheck size={16} /><span>Shortlist</span></button>;
        }
        return <div className="w-full text-center py-2 px-4 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm flex justify-center items-center space-x-2"><CheckCircle size={16} /><span>{shortlistStatus}</span></div>;
    };
    
    return (
        <div className="bg-white border rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-4"><img className="h-12 w-12 rounded-full object-cover" src={`https://ui-avatars.com/api/?name=${candidate.fullName.replace(/\s+/g, '+')}&background=random`} alt="User avatar" /><div><h4 className="text-lg font-bold text-gray-900">{candidate.fullName}</h4><p className="text-sm text-gray-600">{candidate.position}</p></div></div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"><div className="flex items-center space-x-2 text-gray-500"><Mail size={14} /><span>{candidate.email}</span></div><div className="flex items-center space-x-2 text-gray-500"><Phone size={14} /><span>{candidate.contact}</span></div></div>
            </div>
            <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-2">
                <div className="text-sm text-center md:text-right"><span className="font-semibold">Match Score: </span><span className="text-green-600 font-bold">{candidate.score?.toFixed(2) || 'N/A'}%</span></div>
                {renderActionButton()}
            </div>
        </div>
    );
}

export default RequirementDetailsPage;