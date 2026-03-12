import {toast} from "sonner";
import axiosSecure from "../../utils/axiosSecure.js";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";
import {AlertCircle, BookOpen, TrendingUp, Award, Search, ChevronUp, ChevronDown, Building2, Users} from "lucide-react";
import {Pagination} from '@mui/material';
import DefaultProfile from "../../assets/default-profile.png";

// Design helpers representing status

const statusBadgeConfig = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
};

const statusBgConfig = {
    active: 'bg-green-50',
    completed: 'bg-blue-50',
};

// Design template for showing stats
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

// Shown during loading until data is fetched successfully
const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-50">
        {[200, 160, 100, 120, 80, 80, 60].map((w, i) => (
            <td key={i} className="px-5 py-4">
                <div className={`h-3 bg-gray-100 rounded`} style={{ width: w }} />
            </td>
        ))}
    </tr>
);

// Shown when there is no data
const EmptyState = ({ message }) => (
    <tr>
        <td colSpan={7}>
            <div className="flex flex-col items-center py-14 text-gray-400 text-sm gap-2">
                <AlertCircle size={32} className="text-gray-200" />
                {message}
            </div>
        </td>
    </tr>
);

// Sort option
const SortHeader = ({ label, field, sortField, sortDir, onSort }) => {
    const active = sortField === field;
    return (
        <th
            className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap group"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-1.5">
                {label}
                <span className={`flex flex-col transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                    <ChevronUp size={10} className={active && sortDir === 'asc' ? 'text-blue-500' : 'text-gray-400'} />
                    <ChevronDown size={10} className={active && sortDir === 'desc' ? 'text-blue-500' : 'text-gray-400'} />
                </span>
            </div>
        </th>
    );
};

// Faculty avatars to show
const FacultyAvatars = ({faculties}) => {
    if (!faculties?.length) return <span className="text-gray-400 text-xs italic">—</span>;
    const visible = faculties.slice(0, 3);
    const extra = faculties.length - visible.length;
    return (
        <div className="flex justify-center items-center gap-1.5">
            <div className="flex -space-x-2">
                {visible.map((f, i) => (
                    <img
                        key={i}
                        src={f?.photoURL || DefaultProfile}
                        alt={f?.name || 'Faculty'}
                        title={f?.name || ''}
                        className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                    />
                ))}
            </div>
            {extra > 0 && (
                <span className="text-xs text-gray-400 font-medium">+{extra}</span>
            )}
        </div>
    );
};

const Overview = () => {
    const {userData} = useContext(AuthContext);

    const [courses, setCourses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortField, setSortField] = useState('courseCode');
    const [sortDir, setSortDir] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchCourses = async () => {
            if (userData?._id == null) return;
            setLoading(true);

            try {
                // Fetch all courses
                const coursesRes = await axiosSecure.get(`/admin/courses`);

                const allCourses = coursesRes.data.courses.map((course) => {
                    return {
                        id: course._id,
                        courseCode: course.courseCode,
                        courseName: course.courseName,
                        department: course.department?.toUpperCase() ?? '—',
                        year: course.year,
                        semester: course.semester,
                        session: course.session,
                        status: course.status,
                        faculties: Array.isArray(course.faculties)
                            ? course.faculties.map(f => ({
                                name: f?.name ?? '',
                                email: f?.email ?? '',
                                photoURL: f?.photoURL ?? null,
                            }))
                            : [],
                        studentCount: Array.isArray(course.students) ? course.students.length : 0,
                        createdAt: course.createdAt,
                    }
                });

                setCourses(allCourses);
            } catch {
                toast.error("Error fetching courses");
            } finally {
                setLoading(false);
            }
        }

        fetchCourses();
    }, [userData]);

    // Derive course related stats
    const totalCourses = courses.length;
    const activeCount = courses.filter(c => c.status === 'active').length;
    const completedCount = courses.filter(c => c.status === 'completed').length;

    // Handle sort
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
        setCurrentPage(1);
    };

    // Filter + Sort
    const q = searchQuery.toLowerCase();
    const filtered = courses
        .filter(c => {
            if (statusFilter !== 'all' && c.status !== statusFilter) return false;
            return (
                c.courseCode?.toLowerCase().includes(q) ||
                c.courseName?.toLowerCase().includes(q) ||
                c.department?.toLowerCase().includes(q) ||
                c.faculties?.some(f => f.name?.toLowerCase().includes(q))
            );
        })
        .sort((a, b) => {
            const valA = (a[sortField] ?? '').toString().toLowerCase();
            const valB = (b[sortField] ?? '').toString().toLowerCase();
            const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
            return sortDir === 'asc' ? cmp : -cmp;
        });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div>
            {/* Courses */}
            <div className="gilroy space-y-6">
                {/* Page title */}
                <div>
                    <h1 className="graphik text-3xl font-semibold text-gray-900">Courses</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Browse and inspect all courses across departments
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                    <StatCard icon={BookOpen} value={loading ? '—' : totalCourses} label="Total Courses" iconBg="bg-blue-50" iconColor="text-blue-500" />
                    <StatCard icon={TrendingUp} value={loading ? '—' : activeCount} label="Active" iconBg="bg-green-50" iconColor="text-green-500" valueColor="text-green-600" />
                    <StatCard icon={Award} value={loading ? '—' : completedCount} label="Completed" iconBg="bg-blue-50" iconColor="text-blue-500" valueColor="text-blue-600" />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search size={15} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by code, name, department or instructor…"
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>

                    {/* Status filter */}
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'active', 'completed'].map(s => (
                            <button
                                key={s}
                                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                                    statusFilter === s
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            >
                                {s === 'all' ? 'All Status' : s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <SortHeader label="Course Code"  field="courseCode"  sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                <SortHeader label="Course Name"  field="courseName"  sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                <SortHeader label="Department"   field="department"  sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                                    Year · Sem · Session
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Instructors
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Students
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Status
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)
                            ) : paginated.length === 0 ? (
                                <EmptyState message="No courses match your search." />
                            ) : (
                                paginated.map(course => (
                                    <tr
                                        key={course.id}
                                            className={`hover:bg-gray-50/60 transition-colors duration-100 group ${statusBgConfig[course.status]}`}
                                    >
                                        {/* Code */}
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {course.courseCode}
                                            </span>
                                        </td>

                                        {/* Name */}
                                        <td className="px-5 py-4 max-w-[220px]">
                                            <span className="text-sm text-gray-700 truncate block" title={course.courseName}>
                                                {course.courseName}
                                            </span>
                                        </td>

                                        {/* Department */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Building2 size={13} className="text-gray-400 flex-shrink-0" />
                                                <span>{course.department || '—'}</span>
                                            </div>
                                        </td>

                                        {/* Year · Sem · Session */}
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-gray-500">
                                                {[course.year, course.semester, course.session].filter(Boolean).join(' · ') || '—'}
                                            </span>
                                        </td>

                                        {/* Faculty avatars */}
                                        <td className="px-5 py-4">
                                            <FacultyAvatars faculties={course.faculties} />
                                        </td>

                                        {/* Students */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Users size={13} className="text-gray-400" />
                                                {course.studentCount}
                                            </div>
                                        </td>

                                        {/* Status badge */}
                                        <td className="px-5 py-4 text-end">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusBadgeConfig[course.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {course.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination + count footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            {!loading && (
                                filtered.length > 0
                                    ? `Showing ${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–${Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of ${filtered.length} course${filtered.length !== 1 ? 's' : ''}`
                                    : 'No results'
                            )}
                        </p>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={(_, value) => setCurrentPage(value)}
                            color="primary"
                            siblingCount={1}
                            boundaryCount={1}
                            size="small"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;