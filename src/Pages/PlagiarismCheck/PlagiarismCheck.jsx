import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
    ShieldCheck, ShieldAlert, ArrowLeft, Upload,
    FileText, AlertTriangle, CheckCircle2, Loader2, BarChart2
} from 'lucide-react';
import axiosSecure from '../../utils/axiosSecure.js';

// Colour thresholds for the similarity score
const scoreConfig = (score) => {
    if (score === null) return null;
    if (score < 20) return { label: 'Low', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-500', icon: CheckCircle2 };
    if (score < 50) return { label: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', bar: 'bg-yellow-400', icon: AlertTriangle };
    return { label: 'High', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-500', icon: ShieldAlert };
};

// Individual match entry shown in results
const MatchCard = ({ match, index }) => (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[10px] font-bold text-gray-500">#{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">{match.title ?? `Submission ${match.submissionId}`}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{match.studentName ?? 'Another student'} · {match.courseCode ?? ''}</p>
            {match.matchedPassage && (
                <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-100 italic">
                    "{match.matchedPassage}"
                </p>
            )}
        </div>
        <span className={`text-xs font-bold shrink-0 ${match.similarity >= 50 ? 'text-red-500' : match.similarity >= 20 ? 'text-yellow-500' : 'text-green-500'}`}>
            {match.similarity}%
        </span>
    </div>
);

const PlagiarismCheck = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Data passed from MyAssessments via navigate state
    const {
        assignmentId,
        assignmentTitle = 'Assignment',
        courseCode = '',
        submissionURL = null,
    } = location.state ?? {};

    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState(null);   // { score, matches: [] }
    const [error, setError] = useState(null);

    // If there is no submission URL the student can upload a file manually
    const fileInputRef = React.useRef(null);
    const [manualFile, setManualFile] = useState(null);

    const cfg = result ? scoreConfig(result.score) : null;
    const ScoreIcon = cfg?.icon ?? ShieldCheck;

    const handleCheck = async () => {
        setChecking(true);
        setError(null);
        setResult(null);

        try {
            let res;
            if (manualFile) {
                const formData = new FormData();
                formData.append('file', manualFile);
                if (assignmentId) formData.append('assignmentId', assignmentId);
                res = await axiosSecure.post('/plagiarism/check-file', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                res = await axiosSecure.post('/plagiarism/check', {
                    assignmentId,
                    submissionURL,
                });
            }

            if (res.status === 200) {
                setResult(res.data);
            } else {
                setError('Unexpected response from server.');
            }
        } catch (err) {
            setError(err?.response?.data?.message ?? 'Check failed. Please try again.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Back + Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
                    >
                        <ArrowLeft size={15}/>
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 leading-tight">Plagiarism Check</h1>
                        <p className="text-xs text-gray-400">{courseCode ? `${courseCode} · ` : ''}{assignmentTitle}</p>
                    </div>
                </div>

                {/* Info card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                            <ShieldCheck size={15} className="text-violet-500"/>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Similarity Analysis</p>
                            <p className="text-[11px] text-gray-400">Compares your submission against the course corpus</p>
                        </div>
                    </div>

                    {/* Submission source */}
                    {submissionURL ? (
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                            <FileText size={13} className="text-gray-400 shrink-0"/>
                            <span className="truncate">Using submitted file</span>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs text-gray-500">No submission on record — upload a file to check:</p>
                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition">
                                <Upload size={12}/>
                                {manualFile ? manualFile.name : 'Choose file'}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    className="hidden"
                                    onChange={e => setManualFile(e.target.files[0] ?? null)}
                                />
                            </label>
                        </div>
                    )}

                    <button
                        onClick={handleCheck}
                        disabled={checking || (!submissionURL && !manualFile)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {checking ? (
                            <>
                                <Loader2 size={14} className="animate-spin"/>
                                Analysing…
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={14}/>
                                Run Check
                            </>
                        )}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5"/>
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                )}

                {/* Results */}
                {result && cfg && (
                    <div className="space-y-4">
                        {/* Score card */}
                        <div className={`bg-white rounded-2xl border shadow-sm px-6 py-5 ${cfg.border}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                                        <ScoreIcon size={15} className={cfg.color}/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Similarity Score</p>
                                        <p className={`text-[11px] font-semibold ${cfg.color}`}>{cfg.label} similarity</p>
                                    </div>
                                </div>
                                <span className={`text-3xl font-black ${cfg.color}`}>{result.score}%</span>
                            </div>

                            {/* Bar */}
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
                                    style={{ width: `${result.score}%` }}
                                />
                            </div>

                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-gray-300">0%</span>
                                <span className="text-[10px] text-gray-300">100%</span>
                            </div>
                        </div>

                        {/* Matches */}
                        {result.matches?.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <BarChart2 size={14} className="text-gray-400"/>
                                    <p className="text-sm font-semibold text-gray-800">
                                        Matching Sources
                                        <span className="ml-1.5 text-xs font-normal text-gray-400">({result.matches.length})</span>
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    {result.matches.map((m, i) => (
                                        <MatchCard key={m.submissionId ?? i} match={m} index={i}/>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                <CheckCircle2 size={14} className="text-green-500 shrink-0"/>
                                <p className="text-xs text-green-700 font-medium">No matching sources found.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlagiarismCheck;