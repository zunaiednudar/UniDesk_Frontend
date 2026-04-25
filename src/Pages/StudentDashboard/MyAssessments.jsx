import React, {useContext, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import {
    ClipboardCheck, Search, Upload, Download, Calendar,
    CheckCircle2, Clock, AlertCircle, Star, MessageSquare, ChevronDown, ChevronUp,
    GraduationCap, BookOpen, Briefcase, X, Trash2, ScanEye
} from 'lucide-react';
import axiosSecure from "../../utils/axiosSecure.js";
import formatName from "../../utils/formatName.js";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";
import {toast} from "sonner";
import {uploadFileToCloudinary} from "../../utils/uploadToCloudinary.js";
import SectionHeader from "../../Components/SectionHeader/SectionHeader.jsx";
import EmptyState from "../../Components/EmptyState/EmptyState.jsx";

// Helper

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DAY_COLORS = {
    Monday: {header: 'bg-red-100 text-red-700', border: 'border-red-100'},
    Tuesday: {header: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-100'},
    Wednesday: {header: 'bg-green-100 text-green-700', border: 'border-green-100'},
    Thursday: {header: 'bg-pink-100 text-pink-700', border: 'border-pink-100'},
    Friday: {header: 'bg-purple-100 text-purple-700', border: 'border-purple-100'},
};

// Design helper for status badges
const statusConfig = {
    pending: {badge: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending'},
    submitted: {badge: 'bg-blue-100 text-blue-700', icon: Upload, label: 'Submitted'},
    graded: {badge: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Graded'},
    missed: {badge: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Missed'},
};

// Design helper for grades
const gradeColor = (marks, total) => {
    if (!total) return 'text-gray-900';
    const pct = (marks / total) * 100;
    if (pct >= 80) return 'text-green-600';
    if (pct >= 60) return 'text-orange-500';
    return 'text-red-500';
};

// Status is returned after comparing with due date
const deriveStatus = (a) => {
    const submission = a.submission;
    const dueDate = a.assignment.dueDate;
    if (!submission) return new Date(dueDate) < new Date() ? 'missed' : 'pending';
    if (submission.isGraded) return 'graded';
    return 'submitted';
};

const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon = new Date(now);
    mon.setDate(now.getDate() + diff);
    mon.setHours(0, 0, 0, 0);
    return WEEKDAYS.map((_, i) => {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        return d;
    });
};

// Component to show each stat in the stats section
const StatItem = ({label, value, valueColor = 'text-gray-900', loading, icon: Icon, iconBg, iconColor}) => (
    <div className="flex items-center gap-3 px-5 py-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon size={16} className={iconColor} strokeWidth={1.75}/>
        </div>
        <div>
            <p className=" text-xs text-gray-400 font-medium mb-0.5">{label}</p>
            <p className={`text-xl font-bold leading-none ${valueColor}`}>
                {loading ? '—' : (value ?? '—')}
            </p>
        </div>
    </div>
);

// Component to show each board in the kanban board section
const BoardCard = ({assignment}) => {
    const isCompleted = assignment.status === 'graded' || assignment.status === 'submitted';
    const isMissed = assignment.status === 'missed';
    return (
        <div className={`flex items-start gap-2 py-1.5 group ${isMissed ? 'opacity-60' : ''}`}>
            <div className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all
                ${isCompleted ? 'bg-green-500 border-green-500' : isMissed ? 'border-red-400' : 'border-gray-300'}`}>
                {isCompleted && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-xs leading-snug ${isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {assignment.title}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 font-medium truncate">{assignment.courseCode}</p>
            </div>
        </div>
    );
};

// Helper for the board in kanban board section
const DayColumn = ({day, date, assignments}) => {
    const colors = DAY_COLORS[day];
    const isToday = new Date().toDateString() === date.toDateString();
    const dateLabel = date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
    const pendingCount = assignments.filter(a => a.status === 'pending').length;
    return (
        <div className={`flex-1 min-w-0 bg-white rounded-xl border ${colors.border} flex flex-col min-h-[200px]`}>
            <div
                className={`px-3 py-2.5 rounded-t-xl flex items-center justify-between ${colors.header} ${isToday ? 'ring-2 ring-offset-0 ring-current ring-opacity-30' : ''}`}>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold tracking-wide">{day}</span>
                    {isToday && (
                        <span
                            className="text-[10px] font-semibold bg-white bg-opacity-60 rounded px-1 py-0.5 leading-none">Today</span>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-current opacity-60">{dateLabel}</span>
                    {pendingCount > 0 && (
                        <span
                            className="text-[10px] font-bold bg-white bg-opacity-60 rounded-full w-4 h-4 flex items-center justify-center">
                            {pendingCount}
                        </span>
                    )}
                </div>
            </div>
            <div className="px-3 py-2 flex-1 space-y-0.5">
                {assignments.length === 0 ? (
                    <p className="text-[11px] text-gray-300 py-3 text-center">No assignments</p>
                ) : (
                    assignments.map(a => <BoardCard key={a.id} assignment={a}/>)
                )}
            </div>
        </div>
    );
};

// Row for each assignment in the assignments section
const AssignmentRow = ({assignment, onSubmitted, onUnsubmitted, onRecheckSent}) => {
    const [expanded, setExpanded] = useState(false);
    const [unsubmitting, setUnsubmitting] = useState(false);
    const [recheckSending, setRecheckSending] = useState(false);
    const [recheckMessage, setRecheckMessage] = useState('');
    const navigate = useNavigate();

    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState('');

    const cfg = statusConfig[assignment.status] ?? statusConfig.pending;
    const StatusIcon = cfg.icon;
    const isCompleted = assignment.status === 'graded' || assignment.status === 'submitted';
    const dueDateClass =
        assignment.status === 'missed' ? 'text-red-500' :
            assignment.status === 'pending' && assignment.dueDateRaw < new Date() ? 'text-orange-500' :
                'text-gray-400';

    const handleSubmit = async (id) => {
        const file = fileInputRef.current?.files[0];

        if (!file) {
            toast.error("You must provide the assignment file!");
            return;
        }

        const fileData = await uploadFileToCloudinary(file);

        if (!fileData?.url) {
            toast.error("File upload failed. Please try again.");
            return;
        }

        const data = {
            submissionURL: fileData.url,
            cloudinaryId: fileData.public_id,
            resourceType: fileData.resource_type,
        };

        try {
            const res = await axiosSecure.post(`/assignment/${id}/submit`, data);

            if (res.status === 200) {
                onSubmitted(id, data.submissionURL);
                toast.success("Assignment submitted successfully");
                setFileName('');
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        } catch {
            toast.error("Submission failed");
            setFileName('');
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    const handleRecheckSend = async () => {
        if (!recheckMessage.trim()) {
            toast.error("You need to provide a message to proceed with recheck");
            return;
        }

        setRecheckSending(true);

        try {
            const res = await axiosSecure.post(
                `/submission/recheck/${assignment.submissionId}`,
                { message: recheckMessage },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (res.status === 200) {
                toast.success("Recheck request sent successfully!");
                onRecheckSent(assignment.id);
                setRecheckMessage('');
            }
        } catch {
            toast.error("Recheck send failed");
        } finally {
            setRecheckSending(false);
        }
    }

    const handleUnsubmit = async (e) => {
        e.stopPropagation();
        setUnsubmitting(true);

        try {
            const res = await axiosSecure.delete(`/submission/${assignment.submissionId}/`);
            onUnsubmitted(assignment.id);

            if (res.status === 200) {
                toast.success("Submission successfully deleted");
                setFileName('');
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        } catch {
            toast.error('Unsubmission failed');
        } finally {
            setUnsubmitting(false);
        }
    };

    return (
        <div
            className={`border-b border-gray-100 last:border-b-0 transition-colors ${expanded ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 px-2 py-3 cursor-pointer"
                 onClick={() => setExpanded(e => !e)}>
                <div className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all
                        ${isCompleted ? 'border-green-500 bg-green-500' :
                    assignment.status === 'missed' ? 'border-red-400' : 'border-gray-300'}`}>
                    {isCompleted && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row lg:flex-1 min-w-0 justify-center lg:justify-start items-start lg:items-center">
                    <span className={`text-sm font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>{assignment.title}</span>
                    <span className="lg:ml-2 text-xs text-gray-400">{assignment.courseCode}</span>
                </div>

                <div className="flex items-center gap-5 justify-between w-full lg:w-auto">
                    <div className={`flex-1 lg:flex hidden sm:flex items-center gap-1 text-xs font-medium ${dueDateClass}`}>
                        <Calendar size={11} strokeWidth={2}/>
                        {assignment.dueDate}
                    </div>
                    <div className="flex justify-between gap-4">
                        <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.badge}`}>
                            <StatusIcon size={10} strokeWidth={2.5}/>
                            {cfg.label}
                        </span>
                        {assignment.marks != null && assignment.totalMarks && (
                            <span
                                className={`text-xs font-bold ${gradeColor(assignment.marks, assignment.totalMarks)}`}>
                                {assignment.marks}/{assignment.totalMarks}
                            </span>
                        )}
                    </div>
                    <button className="text-gray-300 hover:text-gray-500 transition-colors ml-1">
                        {expanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className={`px-10 pb-4 space-y-3`}>
                    {assignment.description && (
                        <p className="text-sm text-gray-500 leading-relaxed">{assignment.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3">
                        <div
                            className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
                            <Calendar size={12} className="text-gray-400"/>
                            <span>Due {assignment.dueDate}</span>
                        </div>

                        {assignment.submittedAt && (
                            <div
                                className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
                                <CheckCircle2 size={12} className="text-green-400"/>
                                <span>Submitted {assignment.submittedAt}</span>
                            </div>
                        )}

                        {assignment.totalMarks && (
                            <div
                                className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
                                <Star size={12} className="text-yellow-400"/>
                                <span>
                                        {assignment.marks != null
                                            ? `${assignment.marks} / ${assignment.totalMarks} marks`
                                            : `${assignment.totalMarks} marks total`}
                                    </span>
                            </div>
                        )}

                        {assignment.attachments.length > 0 && (
                            <div
                                className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
                                <Download size={12} className="text-gray-400"/>
                                <span>{assignment.attachments.length} file{assignment.attachments.length !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>

                    {assignment.feedback && (
                        <div
                            className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                            <MessageSquare size={13} className="text-blue-400 flex-shrink-0 mt-0.5"/>
                            <div>
                                <div className="text-[11px] font-semibold text-blue-500 mb-0.5">Instructor
                                    Feedback
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed">{assignment.feedback}</p>
                            </div>
                        </div>
                    )}

                    {/* Teacher-provided files */}
                    {assignment.attachments.length > 0 && (
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Assignment
                                Files</p>
                            <div className="flex flex-col gap-1.5">
                                {assignment.attachments.map((att, i) => (
                                    <a key={att._id ?? i} href={att.url} target="_blank" rel="noopener noreferrer"
                                       className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
                                        <Download size={11} className="shrink-0"/>
                                        <span className="truncate">{decodeURIComponent(att.url.split('/').pop())}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {assignment.status === "graded" && assignment.recheckRequested && !assignment.recheckResolved && (
                        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                <ScanEye size={15} className="text-indigo-500"/>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-indigo-600">Recheck Requested</p>
                                <p className="text-[11px] text-indigo-400 mt-0.5">Your request is being reviewed by the instructor.</p>
                            </div>
                        </div>
                    )}

                    {assignment.status === "graded" && assignment.recheckRequested && assignment.recheckResolved && (
                        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <ScanEye size={15} className="text-emerald-500"/>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-emerald-600">Recheck Completed</p>
                                <p className="text-[11px] text-emerald-400 mt-0.5">Your marks have been updated by the instructor.</p>
                            </div>
                        </div>
                    )}

                    {assignment.status === "graded" && !assignment.recheckRequested && !assignment.recheckResolved && (
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={recheckMessage}
                                onChange={(e) => setRecheckMessage(e.target.value)}
                                className="w-full text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none transition focus:ring-2 focus:ring-blue-400 focus:border-blue-400 placeholder:text-gray-400 shadow-sm"
                                placeholder="Reason for recheck..."
                            />
                            <button
                                onClick={handleRecheckSend}
                                disabled={recheckSending || !recheckMessage.trim()}
                                className="ml-auto flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold border border-blue-200 text-blue-500 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {recheckSending ? (
                                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                    </svg>
                                ) : <ScanEye size={12}/>}
                                {recheckSending ? 'Sending…' : 'Send for recheck'}
                            </button>
                        </div>
                    )}

                    <form className="flex flex-col gap-4 pt-1" onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(assignment.id);
                    }}>
                        <div className="flex flex-col lg:flex-row items-center gap-4">
                            {assignment.status === 'pending' && (
                                <div className="flex flex-col lg:flex-row items-center gap-4">
                                    <label
                                        className="cursor-pointer flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                                        <Upload size={12}/>
                                        Upload file

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            name="assignment"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                                            className="hidden"
                                            onChange={(e) => {
                                                setFileName(e.target.files[0]?.name || '');
                                            }}
                                        />
                                    </label>

                                    <span className="flex-1 text-xs text-gray-400">
                                        {fileName || "No file chosen"}
                                </span>
                                </div>
                            )}

                            {assignment.status === 'submitted' && assignment.submissionURL && (
                                <a href={assignment.submissionURL} target="_blank" rel="noopener noreferrer"
                                   className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                                    <Download size={12}/>
                                    View Submission
                                </a>
                            )}

                            {assignment.status === 'submitted' && (
                                <button
                                    onClick={handleUnsubmit}
                                    disabled={unsubmitting}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold border border-red-200 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {unsubmitting ? (
                                        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8v8H4z"/>
                                        </svg>
                                    ) : <Trash2 size={12}/>}
                                    {unsubmitting ? 'Removing…' : 'Unsubmit'}
                                </button>
                            )}


                        </div>

                        {assignment.status === "pending" && (
                            <button type="submit" className="btn btn-primary btn-sm ml-auto" disabled={!fileName}>
                                Submit
                            </button>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};

// Represents loading mechanism as empty blocks
const SkeletonBoard = () => (
    <div className="flex gap-3">
        {WEEKDAYS.map(d => (
            <div key={d} className="flex-1 h-48 bg-gray-100 rounded-xl animate-pulse"/>
        ))}
    </div>
);

// Represents loading mechanism as empty rows
const SkeletonRows = () => (
    <div className="space-y-0">
        {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3 px-2 py-3 border-b border-gray-100 animate-pulse">
                <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0"/>
                <div className="flex-1 h-3 bg-gray-200 rounded"/>
                <div className="w-20 h-3 bg-gray-100 rounded"/>
                <div className="w-16 h-5 bg-gray-100 rounded-full"/>
            </div>
        ))}
    </div>
);

// Design configuration for projects section
const relTypeConfig = {
    thesis: {
        label: 'Thesis',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-100',
        icon: BookOpen
    },
    project: {
        label: 'Project',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-100',
        icon: Briefcase
    }
};

// Helper
const formatMeetingDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
};

// Default design as fall back
const DefaultProfile = ({name}) => (
    <div
        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-purple-600">
            {name?.[0]?.toUpperCase() || '?'}
        </span>
    </div>
);

//  Design configuration for projects section
const projectStatusConfig = {
    active: {
        badge: 'bg-green-100 text-green-700',
        dot: 'bg-green-500'
    },
    completed: {
        badge: 'bg-gray-100 text-gray-500',
        dot: 'bg-gray-400'
    },
};

// Modal that pops up after the blocks in the projects section are clicked
const ProjectModal = ({project, onClose, onBook, onChat}) => {
    const relCfg = relTypeConfig[project.relationshipType] ?? relTypeConfig.project;
    const statusCfg = projectStatusConfig[project.status] ?? projectStatusConfig.active;
    const RelIcon = relCfg.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
             onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                 onClick={e => e.stopPropagation()}>

                {/* Coloured header band */}
                <div className={`${relCfg.bg} px-6 py-5 border-b ${relCfg.border}`}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${relCfg.bg} ${relCfg.text} ${relCfg.border}`}>
                                <RelIcon size={11} strokeWidth={2.5}/>
                                {relCfg.label}
                            </span>
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusCfg.badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}/>
                                {project.status}
                            </span>
                        </div>
                        <button onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition shrink-0 mt-0.5">
                            <X size={18}/>
                        </button>
                    </div>
                    <h2 className="text-base font-bold text-gray-900 mt-3 leading-snug">{project.topic}</h2>
                </div>

                <div className="px-6 py-5 space-y-5">

                    {/* Description */}
                    {project.description && (
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
                        </div>
                    )}

                    {/* Supervisor */}
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Supervisor</p>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                            {project.supervisorPhoto ? (
                                <img src={project.supervisorPhoto} alt={project.supervisorName}
                                     className="w-10 h-10 rounded-full object-cover shrink-0"/>
                            ) : (
                                <DefaultProfile name={project.supervisorName}/>
                            )}
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800">{project.supervisorName}</p>
                                <p className="text-xs text-gray-400">{project.supervisorEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* Meetings */}
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Meetings</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-xl px-4 py-3">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Last
                                    Meeting</p>
                                <p className={`text-sm font-semibold ${project.lastMeetingAt ? 'text-gray-800' : 'text-gray-300'}`}>
                                    {formatMeetingDate(project.lastMeetingAt) ?? 'None yet'}
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-xl px-4 py-3">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Next
                                    Meeting</p>
                                <p className={`text-sm font-semibold ${project.nextMeetingAt ? 'text-orange-500' : 'text-gray-300'}`}>
                                    {formatMeetingDate(project.nextMeetingAt) ?? 'Not scheduled'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
                        <span
                            className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1 capitalize">
                            Type: <span className="font-semibold text-gray-600">{project.relationshipType}</span>
                        </span>
                        <span
                            className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1 capitalize">
                            Status: <span className="font-semibold text-gray-600">{project.status}</span>
                        </span>
                    </div>

                    {/* Quick actions */}
                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                        <button
                            onClick={onBook}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold bg-green-500 text-white rounded-xl hover:bg-green-600 active:scale-95 transition-all">
                            <Calendar size={14}/> Set Appointment
                        </button>
                        <button
                            onClick={onChat}
                            disabled
                            title="Chat coming soon"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold border border-gray-200 text-gray-400 rounded-xl cursor-not-allowed opacity-60">
                            <MessageSquare size={14}/> Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Cards in the projects section
const ProjectCard = ({project, onClick}) => {
    const relCfg = relTypeConfig[project.relationshipType] ?? relTypeConfig.project;
    const statusCfg = projectStatusConfig[project.status] ?? projectStatusConfig.active;
    const RelIcon = relCfg.icon;

    return (
        <div
            onClick={onClick}
            className={`rounded-2xl border ${relCfg.border} ${relCfg.bg} p-5 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow duration-200`}
        >
            {/* Top row: type badge + status */}
            <div className="flex items-center justify-between">
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${relCfg.bg} ${relCfg.text} border ${relCfg.border}`}>
                    <RelIcon size={11} strokeWidth={2.5}/>
                    {relCfg.label}
                </span>
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusCfg.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}/>
                    {project.status}
                </span>
            </div>

            {/* Topic */}
            <div>
                <p className="text-sm font-bold text-gray-900 leading-snug">{project.topic}</p>
                {project.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{project.description}</p>
                )}
            </div>

            {/* Supervisor */}
            <div className="flex items-center gap-3">
                {project.supervisorPhoto ? (
                    <img src={project.supervisorPhoto} alt={project.supervisorName}
                         className="w-10 h-10 rounded-full object-cover shrink-0"/>
                ) : (
                    <DefaultProfile name={project.supervisorName}/>
                )}
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{project.supervisorName}</p>
                    <p className="text-xs text-gray-400 truncate">{project.supervisorEmail}</p>
                </div>
            </div>

            {/* Meeting dates */}
            <div className="flex gap-3 pt-1 border-t border-white/60">
                <div className="flex-1">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Last
                        Meeting</p>
                    <p className={`text-xs font-medium ${project.lastMeetingAt ? 'text-gray-700' : 'text-gray-300'}`}>
                        {formatMeetingDate(project.lastMeetingAt) ?? 'None yet'}
                    </p>
                </div>
                <div className="w-px bg-white/60"/>
                <div className="flex-1">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Next
                        Meeting</p>
                    <p className={`text-xs font-medium ${project.nextMeetingAt ? 'text-orange-500' : 'text-gray-300'}`}>
                        {formatMeetingDate(project.nextMeetingAt) ?? 'Not scheduled'}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Helper for assignments section
const order = {pending: 0, missed: 1, submitted: 2, graded: 3};

// Main component
const MyAssessments = () => {
    const {userData} = useContext(AuthContext);
    const navigate = useNavigate();

    const [assignments, setAssignments] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Aid with proper state maintenance with project selection
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!userData?._id) return;

            try {
                setLoading(true);

                // Get all courses and student-supervisor relationships
                const [coursesRes, studentSupervisorRes] = await Promise.all([
                    axiosSecure.get("/courses/my-courses"),
                    axiosSecure.get(`/supervisor/student/${userData?._id}`)
                ]);

                // Get all active courses
                const activeCourses = coursesRes.data.activeCourses || [];

                // Get all supervisors
                const supervisorRels = studentSupervisorRes.data.supervisors || [];

                // Get all assignments paired with the course
                const courseDataWithSubmissionRes = await Promise.all(
                    activeCourses.map(async (course) => {
                        const assignmentsRes = await axiosSecure.get(`/course/${course._id}/assignments`);
                        const assignments = assignmentsRes.data.assignments || [];

                        const assignmentsWithSubmissions = await Promise.all(
                            assignments.map(async (assignment) => {
                                const assignmentWithSubmissionRes = await axiosSecure.get(`/course/${course._id}/assignment/${assignment._id}`);

                                return {
                                    assignment,
                                    submission: assignmentWithSubmissionRes.data.submission
                                };
                            })
                        );

                        return {
                            course,
                            assignments: assignmentsWithSubmissions
                        };
                    })
                );

                // Map and complete assignments collection
                const mappedAssignments = courseDataWithSubmissionRes.flatMap((item) => {
                    // Allocate the course
                    const course = item.course;

                    // Allocate the assignments
                    return (item.assignments || []).map(a => {
                        return {
                            id: a.assignment._id,
                            title: a.assignment.title,
                            description: a.assignment.description,
                            dueDate: new Date(a.assignment.dueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }),
                            dueDateRaw: new Date(a.assignment.dueDate),
                            totalMarks: a.assignment.totalMarks,
                            attachments: Array.isArray(a.assignment.attachments) ? a.assignment.attachments : [],
                            courseCode: course.courseCode,
                            courseName: course.courseName,
                            courseId: course._id,
                            status: deriveStatus(a),
                            recheckRequested: a.submission?.recheckRequested,
                            recheckResolved: a.submission?.recheckResolved,
                            submissionId: a.submission?._id,
                            submissionURL: a.submission?.submissionURL || null,
                            submittedAt: a.submission?.submittedAt
                                ? new Date(a.submission?.submittedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })
                                : null,
                            marks: a.submission?.marks ?? null,
                            feedback: a.submission?.feedback ?? null,
                        };
                    });
                });

                // Sort assignments in order of due date
                mappedAssignments.sort((a, b) =>
                    (order[a.status] - order[b.status]) || (a.dueDateRaw - b.dueDateRaw)
                );

                // Map and complete projects collection
                const mappedProjects = supervisorRels.map(s => ({
                    id: s.supervisor._id + '_' + s.relationshipType,
                    supervisorId: s.supervisor._id,
                    supervisorName: formatName(s.supervisor.name),
                    supervisorEmail: s.supervisor.email,
                    supervisorPhoto: s.supervisor.photoURL ?? null,
                    relationshipType: s.relationshipType,
                    topic: s.topic,
                    description: s.description,
                    status: s.status ?? 'active',
                    lastMeetingAt: s.lastMeetingAt,
                    nextMeetingAt: s.nextMeetingAt,
                }));

                // Set the state variables
                setProjects(mappedProjects);
                setAssignments(mappedAssignments);
            } catch {
                toast.error("Error fetching data");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [userData]);

    // Count assignments based on status
    const total = assignments.length;
    const pending = assignments.filter(a => a.status === 'pending').length;
    const submitted = assignments.filter(a => a.status === 'submitted').length;
    const graded = assignments.filter(a => a.status === 'graded').length;

    const gradedArr = assignments.filter(a => a.status === 'graded' && a.marks != null && a.totalMarks);

    // Calculate the average grade
    const avgGrade = gradedArr.length
        ? Math.round(gradedArr.reduce((s, a) => s + (a.marks / a.totalMarks) * 100, 0) / gradedArr.length)
        : null;

    const weekDates = getWeekRange();

    const boardByDay = WEEKDAYS.map((day, i) => ({
        day,
        date: weekDates[i],
        assignments: assignments.filter(a => {
            const d = a.dueDateRaw;
            return (
                d.getFullYear() === weekDates[i].getFullYear() &&
                d.getMonth() === weekDates[i].getMonth() &&
                d.getDate() === weekDates[i].getDate()
            );
        }),
    }));

    const filtered = assignments.filter(a => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            a.title?.toLowerCase().includes(q) ||
            a.courseCode?.toLowerCase().includes(q) ||
            a.courseName?.toLowerCase().includes(q);
        return matchesSearch && (statusFilter === 'all' || a.status === statusFilter);
    });

    return (
        <div className="gilroy space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] divide-y lg:divide-y-0">

                    {/* Assignments side */}
                    <div className="p-5 space-y-3">
                        <div>
                            <h2 className="graphik text-2xl font-semibold text-gray-900">My Assignments</h2>
                            <p className="text-sm text-gray-400 mt-0.5">View and manage assignments, upload submissions,
                                and track deadlines</p>
                        </div>
                        <div
                            className="grid grid-cols-1 md:grid-cols-3 divide-x divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                            <StatItem label="Total" value={total} loading={loading} icon={ClipboardCheck}
                                      iconBg="bg-gray-50" iconColor="text-gray-500"/>
                            <StatItem label="Pending" value={pending} loading={loading} icon={Clock}
                                      iconBg="bg-orange-50" iconColor="text-orange-400" valueColor="text-orange-500"/>
                            <StatItem label="Submitted" value={submitted} loading={loading} icon={Upload}
                                      iconBg="bg-blue-50" iconColor="text-blue-400" valueColor="text-blue-500"/>
                            <StatItem label="Graded" value={graded} loading={loading} icon={CheckCircle2}
                                      iconBg="bg-green-50" iconColor="text-green-400" valueColor="text-green-600"/>
                            <StatItem
                                label="Avg Grade"
                                value={avgGrade != null ? `${avgGrade}%` : '—'}
                                loading={loading}
                                icon={Star}
                                iconBg="bg-purple-50"
                                iconColor="text-purple-400"
                                valueColor="text-purple-600"
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden lg:block bg-gray-100"/>

                    {/* Projects side */}
                    <div className="p-5 space-y-3">
                        <div>
                            <h2 className="graphik text-2xl font-semibold text-gray-900">My Projects</h2>
                            <p className="text-sm text-gray-400 mt-0.5">Track ongoing projects, review progress, and
                                collaborate with supervisors</p>
                        </div>
                        <div
                            className="grid grid-cols-1 md:grid-cols-3 divide-x divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                            <StatItem label="Total" value={projects.length} loading={loading} icon={BookOpen}
                                      iconBg="bg-gray-50" iconColor="text-gray-500"/>
                            <StatItem label="Active" value={projects.filter(p => p.status === 'active').length}
                                      loading={loading} icon={CheckCircle2} iconBg="bg-green-50"
                                      iconColor="text-green-400" valueColor="text-green-600"/>
                            <StatItem label="Completed" value={projects.filter(p => p.status === 'completed').length}
                                      loading={loading} icon={Star} iconBg="bg-blue-50" iconColor="text-blue-400"
                                      valueColor="text-blue-500"/>
                            <StatItem label="Thesis"
                                      value={projects.filter(p => p.relationshipType === 'thesis').length}
                                      loading={loading} icon={GraduationCap} iconBg="bg-purple-50"
                                      iconColor="text-purple-400" valueColor="text-purple-600"/>
                            <StatItem label="Upcoming" value={projects.filter(p => p.nextMeetingAt).length}
                                      loading={loading} icon={Calendar} iconBg="bg-orange-50"
                                      iconColor="text-orange-400" valueColor="text-orange-500"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Board */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                    <SectionHeader
                        icon={Calendar}
                        title="This Week"
                        iconBg="bg-orange-50"
                        iconColor="text-orange-500"
                        navigate={false}
                    />

                    <span className="text-xs text-gray-400">
                        {weekDates[0].toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                        {' – '}
                        {weekDates[4].toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                    </span>
                </div>
                {loading ? (
                    <SkeletonBoard/>
                ) : (
                    <div className="flex flex-col xl:flex-row gap-2.5 overflow-x-auto pb-1">
                        {boardByDay.map(({day, date, assignments: dayAssignments}) => (
                            <DayColumn key={day} day={day} date={date} assignments={dayAssignments}/>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-2 lg:h-[720px] mb-10">
                {/* Assignment List */}
                <div
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-hidden overflow-y-auto xl:col-span-3 h-full px-5">
                    <div
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3 border-b border-gray-200">
                        <SectionHeader
                            icon={ClipboardCheck}
                            title="Assignments"
                            iconBg="bg-orange-50"
                            iconColor="text-orange-500"
                            count={filtered.length || 0}
                            navigate={false}
                        />

                        <div className="flex gap-2 w-full h-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search size={13} className="text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2"/>
                                <input
                                    type="text"
                                    placeholder="Search…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full sm:w-52 pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition bg-white"
                            >
                                <option value="all">All</option>
                                <option value="pending">Pending</option>
                                <option value="submitted">Submitted</option>
                                <option value="graded">Graded</option>
                                <option value="missed">Missed</option>
                            </select>
                        </div>
                    </div>
                    <div className="px-3">
                        {loading ? (
                            <SkeletonRows/>
                        ) : filtered.length === 0 ? (
                            <EmptyState message="No assignments found"/>
                        ) : (
                            filtered.map(a => (
                                <AssignmentRow
                                    key={a.id}
                                    assignment={a}
                                    onSubmitted={(id, url) => setAssignments(prev =>
                                        prev.map(x => x.id === id ? {
                                            ...x,
                                            status: 'submitted',
                                            submissionURL: url,
                                            submittedAt: new Date().toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }),
                                        } : x)
                                    )}

                                    onUnsubmitted={id => setAssignments(prev =>
                                        prev.map(x => x.id === id ? {
                                            ...x,
                                            status: 'pending',
                                            submissionURL: null,
                                            submittedAt: null,
                                            marks: null,
                                            feedback: null,
                                        } : x)
                                    )}

                                    onRecheckSent={id => setAssignments(prev =>
                                        prev.map(x => x.id === id ? {
                                            ...x,
                                            recheckRequested: true,
                                            recheckResolved: false,
                                        } : x)
                                    )}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Projects & Supervision */}
                <div
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-hidden overflow-y-auto xl:col-span-2 h-full p-6">
                    <SectionHeader
                        icon={GraduationCap}
                        title="Projects & Supervision"
                        iconBg="bg-purple-50"
                        iconColor="text-purple-500"
                        seeAllTo="../ask-mentor"
                        count={projects?.length || 0}
                        navigate={true}
                    />

                    <div className="p-5">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse"/>
                                ))}
                            </div>
                        ) : projects.length === 0 ? (
                            <EmptyState message="No supervision relationships found"/>
                        ) : (
                            <>
                                {selectedProject && (
                                    <ProjectModal
                                        project={selectedProject}
                                        onClose={() => setSelectedProject(null)}
                                        onBook={() => {
                                            navigate('/dashboard/student/ask-mentor', {
                                                state: {
                                                    openBookingFor: {
                                                        id: selectedProject.supervisorId,
                                                        name: selectedProject.supervisorName,
                                                        email: selectedProject.supervisorEmail,
                                                        photoURL: selectedProject.supervisorPhoto,
                                                        designation: '',
                                                        department: '',
                                                        room: '',
                                                        status: 'verified',
                                                        courses: [],
                                                        totalStudents: 0,
                                                    }
                                                }
                                            });
                                        }}
                                        onChat={() => {
                                            navigate('/dashboard/student/chat', {
                                                state: {withUser: selectedProject.supervisorId}
                                            });
                                        }}
                                    />
                                )}
                                <div className="grid grid-cols-1 gap-4">
                                    {projects.map(p => (
                                        <ProjectCard key={p.id} project={p} onClick={() => setSelectedProject(p)}/>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyAssessments;