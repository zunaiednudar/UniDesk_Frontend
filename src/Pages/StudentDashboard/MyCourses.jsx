import { useContext, useEffect, useState } from 'react';
import { BookOpen, Search, Users, Award, TrendingUp, GraduationCap, Building2, Hash, AlertCircle } from 'lucide-react';
import axiosSecure from "../../utils/axiosSecure.js";
import { AuthContext } from "../../Providers/AuthProvider/AuthProvider.jsx";

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusBadgeConfig = {
    active:    'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
};

const progressBarColor = (progress) => {
    if (progress === 100) return 'bg-blue-500';
    if (progress >= 60)  return 'bg-green-500';
    if (progress >= 30)  return 'bg-orange-400';
    return 'bg-red-400';
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, value, label, iconBg, iconColor, valueColor = 'text-gray-900' }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon size={18} className={iconColor} strokeWidth={1.75} />
            </div>
            <div className="text-sm font-medium text-gray-500">{label}</div>
        </div>
        <div className={`text-3xl font-bold ${valueColor}`}>{value ?? '—'}</div>
    </div>
);

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
        <div className="flex justify-between mb-4">
            <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-36 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full" />
        </div>
        <div className="space-y-2.5 mb-5">
            <div className="h-3 w-32 bg-gray-100 rounded" />
            <div className="h-3 w-28 bg-gray-100 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
        </div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full" />
    </div>
);

const EmptyState = ({ message }) => (
    <div className="col-span-full flex flex-col items-center py-16 text-gray-400 text-sm">
        <AlertCircle size={32} className="text-gray-200 mb-3" />
        {message}
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const MyCourses = () => {
    const { userData } = useContext(AuthContext);

    const [courses, setCourses]           = useState([]);
    const [loading, setLoading]           = useState(true);
    const [searchQuery, setSearchQuery]   = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchCourses = async () => {
            if (!userData?._id) return;
            setLoading(true);
            try {
                // GET /courses/my-courses → { courses: Course[] }
                const res = await axiosSecure.get('/courses/my-courses');
                console.log('Courses response:', res);

                const raw = res.data.courses || [];

                // Map Course model fields → UI shape
                const mapped = raw.map(course => ({
                    id:          course._id,
                    code:        course.courseCode,
                    name:        course.courseName,
                    description: course.description,
                    session:     course.session,
                    department:  course.department,
                    year:        course.year,
                    semester:    course.semester,
                    // teachers is an array of populated User refs; fall back to raw value if not populated
                    instructors: Array.isArray(course.teachers)
                        ? course.teachers.map(t => t?.name ?? t).filter(Boolean)
                        : [],
                    students:    Array.isArray(course.students) ? course.students.length : 0,
                    status:      course.status ?? 'active',
                    // progress is not in the Course model — can be added later via assignment data
                    progress:    course.progress ?? 0,
                }));

                setCourses(mapped);
            } catch (err) {
                console.error('Failed to fetch courses:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [userData]);

    // ── Derived stats ──────────────────────────────────────────────────────
    const totalCourses   = courses.length;
    const activeCount    = courses.filter(c => c.status === 'active').length;
    const completedCount = courses.filter(c => c.status === 'completed').length;
    const avgProgress    = totalCourses
        ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / totalCourses)
        : 0;

    // ── Search + filter ───────────────────────────────────────────────────
    const filteredCourses = courses.filter(course => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            course.name?.toLowerCase().includes(q) ||
            course.code?.toLowerCase().includes(q) ||
            course.department?.toLowerCase().includes(q) ||
            course.instructors?.some(i => i.toLowerCase().includes(q));
        const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">My Courses</h1>
                <p className="text-sm text-gray-400 mt-1">Manage and track your enrolled courses</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={BookOpen}
                    value={loading ? '—' : totalCourses}
                    label="Total Courses"
                    iconBg="bg-blue-50"
                    iconColor="text-blue-500"
                />
                <StatCard
                    icon={TrendingUp}
                    value={loading ? '—' : activeCount}
                    label="Active"
                    iconBg="bg-green-50"
                    iconColor="text-green-500"
                    valueColor="text-green-600"
                />
                <StatCard
                    icon={Award}
                    value={loading ? '—' : completedCount}
                    label="Completed"
                    iconBg="bg-blue-50"
                    iconColor="text-blue-500"
                    valueColor="text-blue-600"
                />
                <StatCard
                    icon={TrendingUp}
                    value={loading ? '—' : `${avgProgress}%`}
                    label="Avg Progress"
                    iconBg="bg-purple-50"
                    iconColor="text-purple-500"
                    valueColor="text-purple-600"
                />
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search size={16} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by name, code, department or instructor…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
                ) : filteredCourses.length === 0 ? (
                    <EmptyState message="No courses found matching your search." />
                ) : (
                    filteredCourses.map(course => (
                        <div
                            key={course.id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-orange-100 transition-all duration-200 cursor-pointer"
                        >
                            {/* Header row */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base font-bold text-gray-900 truncate">{course.code}</h3>
                                    <p className="text-sm text-gray-500 mt-0.5 truncate">{course.name}</p>
                                </div>
                                <span className={`ml-3 flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusBadgeConfig[course.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                    {course.status}
                                </span>
                            </div>

                            {/* Meta */}
                            <div className="space-y-2 mb-5">
                                {/*{course.instructors.length > 0 && (*/}
                                {/*    <div className="flex items-center gap-2 text-sm text-gray-500">*/}
                                {/*        <GraduationCap size={14} className="flex-shrink-0 text-gray-400" />*/}
                                {/*        <span className="truncate">{course.instructors.join(', ')}</span>*/}
                                {/*    </div>*/}
                                {/*)}*/}
                                {course.department && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Building2 size={14} className="flex-shrink-0 text-gray-400" />
                                        <span className="truncate">{course.department}</span>
                                    </div>
                                )}
                                {(course.year || course.semester || course.session) && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Hash size={14} className="flex-shrink-0 text-gray-400" />
                                        <span className="truncate">
                                            {[course.year, course.semester, course.session].filter(Boolean).join(' · ')}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Users size={14} className="flex-shrink-0 text-gray-400" />
                                    <span>{course.students} student{course.students !== 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-gray-500">Progress</span>
                                    <span className="text-xs font-bold text-gray-900">{course.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-500 ${progressBarColor(course.progress)}`}
                                        style={{ width: `${course.progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyCourses;