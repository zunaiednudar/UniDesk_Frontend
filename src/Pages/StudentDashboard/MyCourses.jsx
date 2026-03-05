import { useContext, useEffect, useState } from 'react';
import { BookOpen, Search, Users, Award, TrendingUp, Building2, Hash, AlertCircle, FolderOpen, ChevronRight } from 'lucide-react';
import {NavLink, useNavigate} from 'react-router';
import axiosSecure from "../../utils/axiosSecure.js";
import { AuthContext } from "../../Providers/AuthProvider/AuthProvider.jsx";
import CourseFilesDrawer from "../../Components/Course/CourseFilesDrawer.jsx";

const statusBadgeConfig = {
    active:    'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
};

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
        <div className="h-10 w-full bg-gray-100 rounded-xl" />
    </div>
);

const EmptyState = ({ message }) => (
    <div className="col-span-full flex flex-col items-center py-16 text-gray-400 text-sm">
        <AlertCircle size={32} className="text-gray-200 mb-3" />
        {message}
    </div>
);

const CourseCard = ({ course, onFilesClick, navigate }) => (
    <div
        onClick={() => navigate(`/dashboard/student/courses/${course.id}/details`)}
        className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-orange-200 transition-all duration-200 cursor-pointer relative overflow-hidden"
    >
        {/* Hover accent bar */}
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-orange-400 to-orange-300 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
            <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors duration-150">
                    {course.code}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5 truncate">{course.name}</p>
            </div>
            <span className={`ml-3 flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusBadgeConfig[course.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {course.status}
            </span>
        </div>

        {/* Meta */}
        <div className="space-y-2 mb-5">
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

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
                onClick={e => { e.stopPropagation(); onFilesClick(course); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-all duration-150"
            >
                <FolderOpen size={15} strokeWidth={1.75} />
                <span>Files</span>
            </button>
            <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mr-1">
                    View details
                </span>
                <ChevronRight
                    size={16}
                    className="text-gray-300 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all duration-150"
                    strokeWidth={2}
                />
            </div>
        </div>
    </div>
);

const MyCourses = () => {
    const { userData } = useContext(AuthContext);
    const navigate = useNavigate();

    const [courses, setCourses]           = useState([]);
    const [loading, setLoading]           = useState(true);
    const [searchQuery, setSearchQuery]   = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [drawerOpen, setDrawerOpen]     = useState(false);
    const [activeCourse, setActiveCourse] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!userData?._id) return;
            setLoading(true);
            try {
                const res = await axiosSecure.get('/courses/my-courses');
                const activeCourses    = res.data.activeCourses    || [];
                const completedCourses = res.data.completedCourses || [];

                const mapCourse = (course, status) => ({
                    id:          course._id,
                    code:        course.courseCode,
                    name:        course.courseName,
                    description: course.description,
                    session:     course.session,
                    department:  course.department,
                    year:        course.year,
                    semester:    course.semester,
                    instructors: Array.isArray(course.teachers)
                        ? course.teachers.map(t => t?.name ?? t).filter(Boolean)
                        : [],
                    students: Array.isArray(course.students) ? course.students.length : 0,
                    status,
                    progress: course.progress ?? 0,
                });

                setCourses([
                    ...activeCourses.map(c    => mapCourse(c, 'active')),
                    ...completedCourses.map(c => mapCourse(c, 'completed')),
                ]);
            } catch (err) {
                console.error('Failed to fetch courses:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [userData]);

    const totalCourses   = courses.length;
    const activeCount    = courses.filter(c => c.status === 'active').length;
    const completedCount = courses.filter(c => c.status === 'completed').length;

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
        <div className="gilroy space-y-6">
            <div>
                <h1 className="graphik text-3xl font-semibold text-gray-900">My Courses</h1>
                <p className="text-sm text-gray-400 mt-1">Manage and track your enrolled courses</p>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                <StatCard icon={BookOpen}  value={loading ? '—' : totalCourses}   label="Total Courses" iconBg="bg-blue-50"  iconColor="text-blue-500" />
                <StatCard icon={TrendingUp} value={loading ? '—' : activeCount}   label="Active"        iconBg="bg-green-50" iconColor="text-green-500" valueColor="text-green-600" />
                <StatCard icon={Award}     value={loading ? '—' : completedCount} label="Completed"     iconBg="bg-blue-50"  iconColor="text-blue-500" valueColor="text-blue-600" />
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search size={16} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by name, code, department…"
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                    [1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)
                ) : filteredCourses.length === 0 ? (
                    <EmptyState message="No courses found matching your search." />
                ) : (
                    filteredCourses.map(course => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            navigate={navigate}
                            onFilesClick={c => { setActiveCourse(c); setDrawerOpen(true); }}
                        />
                    ))
                )}
            </div>

            <CourseFilesDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                course={activeCourse}
            />
        </div>
    );
};

export default MyCourses;