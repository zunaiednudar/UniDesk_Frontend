import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    ArrowLeft, BookOpen, Users, Building2, Hash, GraduationCap,
    ClipboardCheck, Megaphone, Calendar, Clock, AlertCircle,
    ChevronRight, CheckCircle2, Circle, AlertTriangle, FolderOpen
} from 'lucide-react';
import axiosSecure from "../../utils/axiosSecure.js";
import { AuthContext } from "../../Providers/AuthProvider/AuthProvider.jsx";
import CourseFilesDrawer from "../../Components/Course/CourseFilesDrawer.jsx";

const statusBadgeConfig = {
    active:    { badge: 'bg-green-100 text-green-700 border border-green-200', dot: 'bg-green-500' },
    completed: { badge: 'bg-blue-100 text-blue-700 border border-blue-200',   dot: 'bg-blue-500'  },
};

const assignmentStatusConfig = {
    completed: { icon: CheckCircle2,   color: 'text-green-500',  bg: 'bg-green-50',  label: 'Submitted'   },
    late:      { icon: AlertTriangle,  color: 'text-orange-500', bg: 'bg-orange-50', label: 'Late'        },
    missed:    { icon: AlertCircle,    color: 'text-red-400',    bg: 'bg-red-50',    label: 'Missed'      },
    pending:   { icon: Circle,         color: 'text-gray-400',   bg: 'bg-gray-50',   label: 'Pending'     },
};

const timeAgo = (dateString) => {
    const now  = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000);
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const SkeletonLine = ({ w = 'w-full', h = 'h-4' }) => (
    <div className={`${w} ${h} bg-gray-100 rounded animate-pulse`} />
);

const SectionCard = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, title, iconBg, iconColor, action }) => (
    <div className="flex items-center gap-2.5 mb-5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon size={15} className={iconColor} strokeWidth={2} />
        </div>
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {action && <div className="ml-auto">{action}</div>}
    </div>
);

const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center py-8 text-gray-400 text-sm gap-2">
        <AlertCircle size={24} className="text-gray-200" />
        {message}
    </div>
);

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userData } = useContext(AuthContext);

    const [course,      setCourse]      = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [notices,     setNotices]     = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [drawerOpen,  setDrawerOpen]  = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            if (!id || !userData?._id) return;
            setLoading(true);
            try {
                // Fetch course details from my-courses list
                const coursesRes = await axiosSecure.get('/courses/my-courses');
                const allCourses = [
                    ...(coursesRes.data.activeCourses    || []),
                    ...(coursesRes.data.completedCourses || []),
                ];
                const raw = allCourses.find(c => c._id === id);

                if (raw) {
                    setCourse({
                        id:          raw._id,
                        code:        raw.courseCode,
                        name:        raw.courseName,
                        description: raw.description,
                        session:     raw.session,
                        department:  raw.department,
                        year:        raw.year,
                        semester:    raw.semester,
                        instructors: Array.isArray(raw.teachers)
                            ? raw.teachers.map(t => typeof t === 'object' ? t : { name: t })
                            : [],
                        students: Array.isArray(raw.students) ? raw.students.length : 0,
                        status: coursesRes.data.activeCourses?.find(c => c._id === id) ? 'active' : 'completed',
                    });
                }

                // Fetch assignments
                const assignRes = await axiosSecure.get(`/course/${id}/assignments`);
                const allAssignments = assignRes.data.assignments || [];

                const mapped = allAssignments.map(a => {
                    const submissions = Array.isArray(a.submissions) ? a.submissions : [];
                    const userSub     = submissions.find(s => s.student === userData._id);
                    let status = 'pending';
                    if (userSub) {
                        const diffHrs = (new Date(userSub.submittedAt) - new Date(a.dueDate)) / (1000 * 60 * 60);
                        status = diffHrs <= 0 ? 'completed' : 'late';
                    } else if (new Date(a.dueDate) < new Date()) {
                        status = 'missed';
                    }
                    return {
                        id:          a._id,
                        title:       a.title,
                        description: a.description,
                        dueDate:     new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        dueDateRaw:  a.dueDate,
                        status,
                    };
                }).sort((a, b) => new Date(a.dueDateRaw) - new Date(b.dueDateRaw));

                setAssignments(mapped);

                // Fetch announcements
                const noticeRes = await axiosSecure.get(`/course/${id}/announcements`);
                const allNotices = (noticeRes.data.announcements || [])
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 10)
                    .map(n => ({
                        id:      n._id,
                        title:   n.title,
                        message: n.description,
                        time:    timeAgo(n.createdAt),
                        faculty: n.faculty?.name || '',
                    }));
                setNotices(allNotices);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id, userData]);

    const statusCfg = statusBadgeConfig[course?.status] ?? statusBadgeConfig.active;
    const pendingCount = assignments.filter(a => a.status === 'pending').length;
    const doneCount    = assignments.filter(a => a.status === 'completed').length;

    return (
        <div className="gilroy space-y-6">

            {/* Back + Header */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition mb-4 group"
                >
                    <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" strokeWidth={2} />
                    Back to Courses
                </button>

                {loading ? (
                    <div className="space-y-2">
                        <SkeletonLine w="w-40" h="h-8" />
                        <SkeletonLine w="w-64" h="h-5" />
                    </div>
                ) : course ? (
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="graphik text-3xl font-semibold text-gray-900">{course.code}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1.5 ${statusCfg.badge}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                    {course.status}
                                </span>
                            </div>
                            <p className="text-base text-gray-500 mt-1">{course.name}</p>
                        </div>
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all duration-150"
                        >
                            <FolderOpen size={15} strokeWidth={1.75} />
                            Course Files
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">Course not found.</p>
                )}
            </div>

            {/* Info Cards Row */}
            {!loading && course && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Building2,      label: 'Department', value: course.department || '—' },
                        { icon: Hash,           label: 'Session',    value: [course.year, course.semester, course.session].filter(Boolean).join(' · ') || '—' },
                        { icon: Users,          label: 'Students',   value: `${course.students} enrolled` },
                        { icon: ClipboardCheck, label: 'Assignments',value: `${doneCount}/${assignments.length} done` },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Icon size={13} className="text-gray-400" strokeWidth={2} />
                                <span className="text-xs font-medium text-gray-400">{label}</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Assignments — spans 2 cols */}
                <div className="lg:col-span-2">
                    <SectionCard>
                        <SectionTitle
                            icon={ClipboardCheck}
                            title="Assignments"
                            iconBg="bg-orange-50"
                            iconColor="text-orange-500"
                            action={
                                pendingCount > 0 && (
                                    <span className="text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5">
                                        {pendingCount} pending
                                    </span>
                                )
                            }
                        />
                        {loading ? (
                            <div className="space-y-3">
                                {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}
                            </div>
                        ) : assignments.length === 0 ? (
                            <EmptyState message="No assignments yet." />
                        ) : (
                            <div className="space-y-2">
                                {assignments.map(a => {
                                    const cfg = assignmentStatusConfig[a.status] ?? assignmentStatusConfig.pending;
                                    const StatusIcon = cfg.icon;
                                    return (
                                        <div key={a.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-150 hover:shadow-sm ${cfg.bg} border-transparent`}>
                                            <StatusIcon size={18} className={`${cfg.color} shrink-0`} strokeWidth={1.75} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{a.title}</p>
                                                {a.description && (
                                                    <p className="text-xs text-gray-400 mt-0.5 truncate">{a.description}</p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 justify-end">
                                                    <Calendar size={10} strokeWidth={2} />
                                                    {a.dueDate}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </SectionCard>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-6">

                    {/* Instructors */}
                    {!loading && course?.instructors?.length > 0 && (
                        <SectionCard>
                            <SectionTitle
                                icon={GraduationCap}
                                title="Instructors"
                                iconBg="bg-purple-50"
                                iconColor="text-purple-500"
                            />
                            <div className="space-y-3">
                                {course.instructors.map((t, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-purple-600">
                                                {(t?.name || t)?.[0]?.toUpperCase() || '?'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{t?.name || t}</p>
                                            {t?.designation && (
                                                <p className="text-xs text-gray-400 capitalize">{t.designation}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Announcements */}
                    <SectionCard className="flex-1">
                        <SectionTitle
                            icon={Megaphone}
                            title="Announcements"
                            iconBg="bg-blue-50"
                            iconColor="text-blue-500"
                        />
                        {loading ? (
                            <div className="space-y-3">
                                {[1,2].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
                            </div>
                        ) : notices.length === 0 ? (
                            <EmptyState message="No announcements." />
                        ) : (
                            <div className="space-y-3">
                                {notices.map(n => (
                                    <div key={n.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-150">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className="text-sm font-semibold text-gray-800 leading-snug">{n.title}</p>
                                            <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{n.time}</span>
                                        </div>
                                        {n.message && (
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                        )}
                                        {n.faculty && (
                                            <p className="text-[10px] text-gray-400 mt-1.5">— {n.faculty}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>

            {/* Description */}
            {!loading && course?.description && (
                <SectionCard>
                    <SectionTitle
                        icon={BookOpen}
                        title="About this Course"
                        iconBg="bg-gray-100"
                        iconColor="text-gray-500"
                    />
                    <p className="text-sm text-gray-600 leading-relaxed">{course.description}</p>
                </SectionCard>
            )}

            {/* Files Drawer */}
            <CourseFilesDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                course={course}
            />
        </div>
    );
};

export default CourseDetails;