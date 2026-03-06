import React, {useContext, useEffect, useState} from 'react';
import {
    BookOpen,
    Search,
    Users,
    Award,
    TrendingUp,
    Building2,
    Hash,
    AlertCircle,
    FolderOpen,
    ChevronRight,
    CheckCircle,
    Check, ArrowRight
} from 'lucide-react';
import {NavLink, useNavigate} from 'react-router';
import axiosSecure from "../../utils/axiosSecure.js";
import formatName from "../../utils/formatName.js";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";
import CourseFilesDrawer from "../../Components/Course/CourseFilesDrawer.jsx";
import DefaultProfile from "../../assets/default-profile.png";

const statusBadgeConfig = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
};

const StatCard = ({icon: Icon, value, label, iconBg, iconColor, valueColor = 'text-gray-900'}) => (
    <div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon size={18} className={iconColor} strokeWidth={1.75}/>
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
                <div className="h-4 w-24 bg-gray-200 rounded"/>
                <div className="h-3 w-36 bg-gray-100 rounded"/>
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full"/>
        </div>
        <div className="space-y-2.5 mb-5">
            <div className="h-3 w-32 bg-gray-100 rounded"/>
            <div className="h-3 w-28 bg-gray-100 rounded"/>
            <div className="h-3 w-40 bg-gray-100 rounded"/>
        </div>
        <div className="h-10 w-full bg-gray-100 rounded-xl"/>
    </div>
);

const EmptyState = ({message}) => (
    <div className="col-span-full flex flex-col items-center py-12 text-gray-400 text-sm">
        <AlertCircle size={32} className="text-gray-200 mb-3"/>
        {message}
    </div>
);

const CourseCard = ({course, onFilesClick, navigate}) => (
    <div
        onClick={() => navigate(`/dashboard/student/courses/${course.id}/details`)}
        className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-orange-200 transition-all duration-200 cursor-pointer relative overflow-hidden"
    >
        {/* Hover accent bar */}
        <div
            className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-orange-400 to-orange-300 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"/>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
            <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors duration-150">
                    {course.code}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5 truncate">{course.name}</p>
            </div>
            <span
                className={`ml-3 flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusBadgeConfig[course.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {course.status}
            </span>
        </div>

        <div className="flex flex-col justify-between gap-4">
            {/* Meta */}
            <div className="space-y-2 mb-5">
                {course.department && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Building2 size={14} className="flex-shrink-0 text-gray-400"/>
                        <span className="truncate">{course.department}</span>
                    </div>
                )}
                {(course.year || course.semester || course.session) && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Hash size={14} className="flex-shrink-0 text-gray-400"/>
                        <span className="truncate">
                            {[course.year, course.semester, course.session].filter(Boolean).join(' · ')}
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={14} className="flex-shrink-0 text-gray-400"/>
                    <span>{course.students.length} student{course.students.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {course.faculties?.length > 0 &&
                <span className="text-sm text-gray-500 mb-2">Instructors</span>
            }

            {/* Faculty info */}
            <div className="space-y-2">
                {course.faculties?.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                        <img
                            src={f?.photoURL || DefaultProfile}
                            alt={f?.name || "Profile"}
                            className="w-5 h-5 rounded-full object-cover mr-2"
                        />
                        <div className="flex flex-col items-start">
                            <span className="text-sm text-gray-500">{f?.name || ""}</span>
                            <span className="text-xs text-gray-400">{f?.email || ""}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
                onClick={e => {
                    e.stopPropagation();
                    onFilesClick(course);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-all duration-150"
            >
                <FolderOpen size={15} strokeWidth={1.75}/>
                <span>Files</span>
            </button>
            <div className="flex items-center gap-1">
                <span
                    className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mr-1">
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
    const {userData} = useContext(AuthContext);
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeCourse, setActiveCourse] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!userData?._id) return;
            setLoading(true);
            try {
                const res = await axiosSecure.get('/courses/my-courses');
                const activeCourses = res.data.activeCourses || [];
                const completedCourses = res.data.completedCourses || [];

                // /courses/my-courses already has faculties populated with _id, name, email.
                // /courses/:id has no .populate() so it returns raw ObjectIds — don't use it.
                const mapCourse = (course, status) => ({
                    id: course._id,
                    code: course.courseCode,
                    name: course.courseName,
                    description: course.description,
                    session: course.session,
                    department: course.department,
                    year: course.year,
                    semester: course.semester,
                    faculties: Array.isArray(course.faculties)
                        ? course.faculties.map(f => ({
                            name: formatName(f?.name),
                            email: f?.email ?? "",
                            photoURL: f?.photoURL ?? null,
                        }))
                        : [],
                    students: Array.isArray(course.students)
                        ? course.students.map(s => ({
                            name: formatName(s?.name),
                            email: s?.email ?? "",
                            photoURL: s?.photoURL ?? null,
                            roll: s?.studentID ?? "",
                        }))
                        : [],
                    status,
                });

                const detailed = [
                    ...activeCourses.map(c => mapCourse(c, 'active')),
                    ...completedCourses.map(c => mapCourse(c, 'completed')),
                ];

                setCourses(detailed);
            } catch (err) {
                console.error('Failed to fetch courses:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [userData]);

    const totalCourses = courses.length;
    const activeCount = courses.filter(c => c.status === 'active').length;
    const completedCount = courses.filter(c => c.status === 'completed').length;

    const q = searchQuery.toLowerCase();
    const matchesCourse = (course) =>
        course.name?.toLowerCase().includes(q) ||
        course.code?.toLowerCase().includes(q) ||
        course.department?.toLowerCase().includes(q) ||
        course.faculties?.some(f => f.name?.toLowerCase().includes(q));

    const activeCourses = courses.filter(c => c.status === 'active' && matchesCourse(c));
    const completedCourses = courses.filter(c => c.status === 'completed' && matchesCourse(c));
    const recentCompleted = completedCourses.slice(0, 10);

    return (
        <div className="gilroy space-y-6">

            {/* Page title */}
            <div>
                <h1 className="graphik text-3xl font-semibold text-gray-900">My Courses</h1>
                <p className="text-sm text-gray-400 mt-1">Track your courses, monitor progress, and stay updated with
                    assignments and deadlines</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                <StatCard icon={BookOpen} value={loading ? '—' : totalCourses} label="Total Courses" iconBg="bg-blue-50"
                          iconColor="text-blue-500"/>
                <StatCard icon={TrendingUp} value={loading ? '—' : activeCount} label="Active" iconBg="bg-green-50"
                          iconColor="text-green-500" valueColor="text-green-600"/>
                <StatCard icon={Award} value={loading ? '—' : completedCount} label="Completed" iconBg="bg-blue-50"
                          iconColor="text-blue-500" valueColor="text-blue-600"/>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="relative">
                    <Search size={16} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                    <input
                        type="text"
                        placeholder="Search by name, code, department, or instructor…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition"
                    />
                </div>
            </div>

            {/* Active Courses */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"/>
                    <h2 className="text-sm font-bold text-gray-800">Active Courses</h2>
                    {!loading && (
                        <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                            {activeCourses.length}
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {loading ? (
                        [1, 2, 3].map(i => <SkeletonCard key={i}/>)
                    ) : activeCourses.length === 0 ? (
                        <EmptyState message="No active courses found."/>
                    ) : (
                        activeCourses.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                navigate={navigate}
                                onFilesClick={c => {
                                    setActiveCourse(c);
                                    setDrawerOpen(true);
                                }}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>
            <span className="graphik text-xl font-medium cursor-default">Recent Courses</span>


            {/* Completed Courses */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    {/*<div className="flex items-center gap-2">*/}
                    {/*    <div className="w-2 h-2 rounded-full bg-blue-500" />*/}
                    {/*    <h2 className="text-sm font-bold text-gray-800">Completed Courses</h2>*/}
                    {/*    {!loading && (*/}
                    {/*        <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">*/}
                    {/*            {completedCount}*/}
                    {/*        </span>*/}
                    {/*    )}*/}
                    {/*</div>*/}
                    {!loading && completedCount > 10 && (
                        <NavLink
                            to="/dashboard/student/courses/completed"
                            className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                        >
                            See all
                            <ChevronRight size={13} strokeWidth={2.5}/>
                        </NavLink>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {loading ? (
                        [1, 2, 3].map(i => <SkeletonCard key={i}/>)
                    ) : recentCompleted.length === 0 ? (
                        <EmptyState message="No completed courses yet."/>
                    ) : (
                        recentCompleted.map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                navigate={navigate}
                                onFilesClick={c => {
                                    setActiveCourse(c);
                                    setDrawerOpen(true);
                                }}
                            />
                        ))
                    )}
                </div>
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