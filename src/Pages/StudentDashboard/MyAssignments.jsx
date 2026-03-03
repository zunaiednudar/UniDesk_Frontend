import { useContext, useEffect, useState } from 'react';
import {
    ClipboardCheck, Search, Upload, Download, Calendar,
    CheckCircle2, Clock, AlertCircle, Star, MessageSquare, ChevronDown, ChevronUp
} from 'lucide-react';
import axiosSecure from "../../utils/axiosSecure.js";
import { AuthContext } from "../../Providers/AuthProvider/AuthProvider.jsx";

// ─── Constants ───────────────────────────────────────────────────────────────

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Soft pastel column header backgrounds (like the Notion homework tracker)
const DAY_COLORS = {
    Monday:    { header: 'bg-red-100 text-red-700',    border: 'border-red-100'    },
    Tuesday:   { header: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-100' },
    Wednesday: { header: 'bg-green-100 text-green-700',  border: 'border-green-100'  },
    Thursday:  { header: 'bg-pink-100 text-pink-700',    border: 'border-pink-100'   },
    Friday:    { header: 'bg-purple-100 text-purple-700', border: 'border-purple-100' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const deriveStatus = (assignment, userId) => {
    const submissions = Array.isArray(assignment.submissions) ? assignment.submissions : [];
    const my = submissions.find(s => (s.student?._id ?? s.student) === userId);
    if (my) return my.marks != null ? 'graded' : 'submitted';
    return new Date(assignment.dueDate) < new Date() ? 'missed' : 'pending';
};

const statusConfig = {
    pending:   { badge: 'bg-yellow-100 text-yellow-700', icon: Clock,        label: 'Pending'   },
    submitted: { badge: 'bg-blue-100 text-blue-700',     icon: Upload,       label: 'Submitted' },
    graded:    { badge: 'bg-green-100 text-green-700',   icon: CheckCircle2, label: 'Graded'    },
    missed:    { badge: 'bg-red-100 text-red-700',       icon: AlertCircle,  label: 'Missed'    },
};

const gradeColor = (marks, total) => {
    if (!total) return 'text-gray-900';
    const pct = (marks / total) * 100;
    if (pct >= 80) return 'text-green-600';
    if (pct >= 60) return 'text-orange-500';
    return 'text-red-500';
};

const getDayName = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'long' });
};

// Returns the Mon–Fri of the current week
const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day; // shift to Monday
    const mon = new Date(now);
    mon.setDate(now.getDate() + diff);
    mon.setHours(0, 0, 0, 0);
    return WEEKDAYS.map((_, i) => {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        return d;
    });
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ label, value, valueColor = 'text-gray-900', loading }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="text-sm font-medium text-gray-500 mb-2">{label}</div>
        <div className={`text-3xl font-bold ${valueColor}`}>{loading ? '—' : (value ?? '—')}</div>
    </div>
);

// Board card — compact, Notion-style
const BoardCard = ({ assignment }) => {
    const isCompleted = assignment.status === 'graded' || assignment.status === 'submitted';
    const isMissed    = assignment.status === 'missed';

    return (
        <div className={`flex items-start gap-2 py-1.5 group ${isMissed ? 'opacity-60' : ''}`}>
            {/* checkbox-style indicator */}
            <div className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all
                ${isCompleted ? 'bg-green-500 border-green-500' : isMissed ? 'border-red-400' : 'border-gray-300'}`}>
                {isCompleted && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-xs leading-snug ${isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {assignment.title}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 font-medium truncate">
                    {assignment.courseCode}
                </p>
            </div>
        </div>
    );
};

// Weekly board column
const DayColumn = ({ day, date, assignments }) => {
    const colors = DAY_COLORS[day];
    const isToday = new Date().toDateString() === date.toDateString();
    const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const pendingCount = assignments.filter(a => a.status === 'pending').length;

    return (
        <div className={`flex-1 min-w-0 bg-white rounded-xl border ${colors.border} flex flex-col min-h-[200px]`}>
            {/* Column header */}
            <div className={`px-3 py-2.5 rounded-t-xl flex items-center justify-between ${colors.header} ${isToday ? 'ring-2 ring-offset-0 ring-current ring-opacity-30' : ''}`}>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold tracking-wide">{day}</span>
                    {isToday && (
                        <span className="text-[10px] font-semibold bg-white bg-opacity-60 rounded px-1 py-0.5 leading-none">Today</span>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-current opacity-60">{dateLabel}</span>
                    {pendingCount > 0 && (
                        <span className="text-[10px] font-bold bg-white bg-opacity-60 rounded-full w-4 h-4 flex items-center justify-center">
                            {pendingCount}
                        </span>
                    )}
                </div>
            </div>

            {/* Assignment items */}
            <div className="px-3 py-2 flex-1 space-y-0.5">
                {assignments.length === 0 ? (
                    <p className="text-[11px] text-gray-300 py-3 text-center">No assignments</p>
                ) : (
                    assignments.map(a => <BoardCard key={a.id} assignment={a} />)
                )}
            </div>
        </div>
    );
};

// Todoist-style list row
const AssignmentRow = ({ assignment }) => {
    const [expanded, setExpanded] = useState(false);
    const cfg = statusConfig[assignment.status] ?? statusConfig.pending;
    const StatusIcon = cfg.icon;
    const isCompleted = assignment.status === 'graded' || assignment.status === 'submitted';

    const dueDateClass =
        assignment.status === 'missed' ? 'text-red-500' :
            assignment.status === 'pending' && assignment.dueDateRaw < new Date() ? 'text-orange-500' :
                'text-gray-400';

    return (
        <div className={`border-b border-gray-100 last:border-b-0 transition-colors ${expanded ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
            {/* Main row */}
            <div
                className="flex items-center gap-3 px-2 py-3 cursor-pointer"
                onClick={() => setExpanded(e => !e)}
            >
                {/* Status circle */}
                <div className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all
                    ${isCompleted ? 'border-green-500 bg-green-500' :
                    assignment.status === 'missed' ? 'border-red-400' : 'border-gray-300'}`}>
                    {isCompleted && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    )}
                </div>

                {/* Title + course */}
                <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {assignment.title}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">{assignment.courseCode}</span>
                </div>

                {/* Right side meta */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Due date */}
                    <div className={`hidden sm:flex items-center gap-1 text-xs font-medium ${dueDateClass}`}>
                        <Calendar size={11} strokeWidth={2} />
                        {assignment.dueDate}
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.badge}`}>
                        <StatusIcon size={10} strokeWidth={2.5} />
                        {cfg.label}
                    </span>

                    {/* Grade pill */}
                    {assignment.marks != null && assignment.totalMarks && (
                        <span className={`text-xs font-bold ${gradeColor(assignment.marks, assignment.totalMarks)}`}>
                            {assignment.marks}/{assignment.totalMarks}
                        </span>
                    )}

                    {/* Expand toggle */}
                    <button className="text-gray-300 hover:text-gray-500 transition-colors ml-1">
                        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                </div>
            </div>

            {/* Expanded detail panel */}
            {expanded && (
                <div className="px-10 pb-4 space-y-3">
                    {/* Description */}
                    {assignment.description && (
                        <p className="text-sm text-gray-500 leading-relaxed">{assignment.description}</p>
                    )}

                    {/* Meta chips row */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
                            <Calendar size={12} className="text-gray-400" />
                            <span>Due {assignment.dueDate}</span>
                        </div>
                        {assignment.submittedAt && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
                                <CheckCircle2 size={12} className="text-green-400" />
                                <span>Submitted {assignment.submittedAt}</span>
                            </div>
                        )}
                        {assignment.totalMarks && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
                                <Star size={12} className="text-yellow-400" />
                                <span>
                                    {assignment.marks != null
                                        ? `${assignment.marks} / ${assignment.totalMarks} marks`
                                        : `${assignment.totalMarks} marks total`}
                                </span>
                            </div>
                        )}
                        {assignment.attachments.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5">
                                <Download size={12} className="text-gray-400" />
                                <span>{assignment.attachments.length} attachment{assignment.attachments.length !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>

                    {/* Feedback */}
                    {assignment.feedback && (
                        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                            <MessageSquare size={13} className="text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[11px] font-semibold text-blue-500 mb-0.5">Instructor Feedback</div>
                                <p className="text-xs text-gray-700 leading-relaxed">{assignment.feedback}</p>
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    {assignment.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {assignment.attachments.map((att, i) => (
                                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                                   className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
                                    <Download size={11} />
                                    Attachment {i + 1}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Action */}
                    <div className="flex gap-2 pt-1">
                        {assignment.status === 'pending' && (
                            <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                                <Upload size={12} />
                                Submit Assignment
                            </button>
                        )}
                        {assignment.status === 'submitted' && assignment.submissionURL && (
                            <a href={assignment.submissionURL} target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                                <Download size={12} />
                                View Submission
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const SkeletonBoard = () => (
    <div className="flex gap-3">
        {WEEKDAYS.map(d => (
            <div key={d} className="flex-1 h-48 bg-gray-100 rounded-xl animate-pulse" />
        ))}
    </div>
);

const SkeletonRows = () => (
    <div className="space-y-0">
        {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center gap-3 px-2 py-3 border-b border-gray-100 animate-pulse">
                <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 h-3 bg-gray-200 rounded" />
                <div className="w-20 h-3 bg-gray-100 rounded" />
                <div className="w-16 h-5 bg-gray-100 rounded-full" />
            </div>
        ))}
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const MyAssignments = () => {
    const { userData } = useContext(AuthContext);

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [searchQuery, setSearchQuery]   = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!userData?._id) return;
            setLoading(true);
            try {
                const coursesRes = await axiosSecure.get('/courses/my-courses');
                const courses = coursesRes.data.courses || [];

                const assignmentResponses = await Promise.all(
                    courses.map(c => axiosSecure.get(`/course/${c._id}/assignments`))
                );

                const mapped = assignmentResponses.flatMap((res, idx) => {
                    const course = courses[idx];
                    return (res.data.assignments || []).map(a => {
                        const submissions = Array.isArray(a.submissions) ? a.submissions : [];
                        const my = submissions.find(s => (s.student?._id ?? s.student) === userData._id);
                        const status = deriveStatus(a, userData._id);

                        return {
                            id:            a._id,
                            title:         a.title,
                            description:   a.description,
                            dueDate:       new Date(a.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                            dueDateRaw:    new Date(a.dueDate),
                            totalMarks:    a.totalMarks,
                            attachments:   Array.isArray(a.attachments) ? a.attachments : [],
                            courseCode:    course.courseCode,
                            courseName:    course.courseName,
                            courseId:      course._id,
                            status,
                            submittedAt:   my?.submittedAt
                                ? new Date(my.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                : null,
                            submissionURL: my?.submissionURL ?? null,
                            marks:         my?.marks ?? null,
                            feedback:      my?.feedback ?? null,
                        };
                    });
                });

                const order = { pending: 0, missed: 1, submitted: 2, graded: 3 };
                mapped.sort((a, b) =>
                    (order[a.status] - order[b.status]) || (a.dueDateRaw - b.dueDateRaw)
                );

                setAssignments(mapped);
            } catch (err) {
                console.error('Failed to fetch assignments:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, [userData]);

    // ── Stats ──────────────────────────────────────────────────────────────
    const total     = assignments.length;
    const pending   = assignments.filter(a => a.status === 'pending').length;
    const submitted = assignments.filter(a => a.status === 'submitted').length;
    const graded    = assignments.filter(a => a.status === 'graded').length;
    const gradedArr = assignments.filter(a => a.status === 'graded' && a.marks != null && a.totalMarks);
    const avgGrade  = gradedArr.length
        ? Math.round(gradedArr.reduce((s, a) => s + (a.marks / a.totalMarks) * 100, 0) / gradedArr.length)
        : null;

    // ── Weekly board data ──────────────────────────────────────────────────
    const weekDates = getWeekRange(); // [Mon, Tue, Wed, Thu, Fri]
    const boardByDay = WEEKDAYS.map((day, i) => ({
        day,
        date: weekDates[i],
        assignments: assignments.filter(a => {
            const d = a.dueDateRaw;
            return (
                d.getFullYear() === weekDates[i].getFullYear() &&
                d.getMonth()    === weekDates[i].getMonth() &&
                d.getDate()     === weekDates[i].getDate()
            );
        }),
    }));

    // ── Filtered list ──────────────────────────────────────────────────────
    const filtered = assignments.filter(a => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            a.title?.toLowerCase().includes(q) ||
            a.courseCode?.toLowerCase().includes(q) ||
            a.courseName?.toLowerCase().includes(q);
        return matchesSearch && (statusFilter === 'all' || a.status === statusFilter);
    });

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">My Assignments</h1>
                <p className="text-sm text-gray-400 mt-1">Track and submit your course assignments</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Total"     value={total}     loading={loading} />
                <StatCard label="Pending"   value={pending}   loading={loading} valueColor="text-orange-500" />
                <StatCard label="Submitted" value={submitted} loading={loading} valueColor="text-blue-500" />
                <StatCard label="Graded"    value={graded}    loading={loading} valueColor="text-green-600" />
                <StatCard label="Avg Grade" value={avgGrade != null ? `${avgGrade}%` : '—'} loading={loading} valueColor="text-purple-600" />
            </div>

            {/* ── Weekly Board ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                            <Calendar size={15} className="text-orange-500" strokeWidth={2} />
                        </div>
                        <h2 className="text-sm font-bold text-gray-900">This Week</h2>
                    </div>
                    <span className="text-xs text-gray-400">
                        {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' – '}
                        {weekDates[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>

                {loading ? (
                    <SkeletonBoard />
                ) : (
                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                        {boardByDay.map(({ day, date, assignments: dayAssignments }) => (
                            <DayColumn key={day} day={day} date={date} assignments={dayAssignments} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Assignment List ───────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* List header + search/filter */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                            <ClipboardCheck size={15} className="text-orange-500" strokeWidth={2} />
                        </div>
                        <h2 className="text-sm font-bold text-gray-900">All Assignments</h2>
                        {!loading && (
                            <span className="text-xs font-semibold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                                {filtered.length}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search size={13} className="text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
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

                {/* Rows */}
                <div className="px-3">
                    {loading ? (
                        <SkeletonRows />
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center py-12 text-gray-400 text-sm">
                            <AlertCircle size={28} className="text-gray-200 mb-2" />
                            No assignments found
                        </div>
                    ) : (
                        filtered.map(a => <AssignmentRow key={a.id} assignment={a} />)
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyAssignments;