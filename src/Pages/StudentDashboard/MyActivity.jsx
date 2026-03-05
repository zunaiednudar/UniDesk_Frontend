import { useContext, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
    BookOpen,
    ClipboardCheck,
    Calendar,
    Clock,
    AlertCircle,
    Megaphone
} from 'lucide-react';
import axiosSecure from "../../utils/axiosSecure.js";
import { AuthContext } from "../../Providers/AuthProvider/AuthProvider.jsx";
import RecentNotices from "../../Components/RecentNotices/RecentNotices.jsx";
import CalendarF from "../../Components/Calendar/Calendar.jsx"

const getDueDateClasses = (dateStr, isCompleted) => {
    if (isCompleted) return 'text-gray-400';
    if (!dateStr) return 'text-gray-400';
    const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff < 0)  return 'text-red-500';
    if (diff <= 2) return 'text-orange-500';
    if (diff <= 5) return 'text-yellow-500';
    return 'text-gray-500';
};

const getCheckboxClasses = (status) => {
    switch (status) {
        case 'completed': return 'border-green-500 bg-green-500';
        case 'late':      return 'border-orange-400 bg-transparent';
        case 'missed':    return 'border-red-400 bg-transparent';
        default:          return 'border-yellow-400 bg-transparent'; // pending / in-progress
    }
};

const appointmentStatusConfig = {
    approved:  { badge: 'bg-green-50 border border-green-200',   dot: 'bg-green-500',  label: 'Approved'  },
    pending:   { badge: 'bg-yellow-50 border border-yellow-200', dot: 'bg-yellow-400', label: 'Pending'   },
    cancelled: { badge: 'bg-red-50 border border-red-200',       dot: 'bg-red-500',    label: 'Cancelled' },
};

const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const StatCard = ({ icon: Icon, value, label, iconBg, iconColor }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow duration-200">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon size={22} className={iconColor} strokeWidth={1.75} />
        </div>
        <div>
            <div className="text-3xl font-bold text-gray-900 leading-tight">{value ?? '—'}</div>
            <div className="text-sm text-gray-400 mt-0.5 font-medium">{label}</div>
        </div>
    </div>
);

const SectionHeader = ({ icon: Icon, title, iconBg, iconColor, count }) => (
    <div className="flex items-center gap-2.5 mb-5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon size={16} className={iconColor} strokeWidth={2} />
        </div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {count !== undefined && (
            <span className="ml-1 text-xs font-semibold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                {count}
            </span>
        )}
    </div>
);

const TaskItem = ({ task }) => {
    const isCompleted = task.status === 'completed';
    const isLate = task.status === 'late';
    const dateClasses = getDueDateClasses(task.dueDate, isCompleted);
    const checkboxClasses = getCheckboxClasses(task.status);

    const taskStatusConfig = {
        completed: {
            badge: 'bg-green-50 border border-green-200',
            dot: 'bg-green-500',
            label: 'Completed',
        },
        late: {
            badge: 'bg-red-50 border border-red-200',
            dot: 'bg-red-500',
            label: 'Late',
        },
        pending: {
            badge: 'bg-gray-50 border border-gray-200',
            dot: 'bg-gray-400',
            label: 'Pending',
        },
    };

    const cfg = taskStatusConfig[task.status] || taskStatusConfig.pending;

    return (
        <div className="flex flex-col justify-between py-3 px-2 border-b border-gray-100 last:border-b-0">
            {/* Top: Checkbox + Title */}
            <div className="flex items-center gap-3">
                <div
                    className={`w-[18px] h-[18px] rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all duration-150 ${checkboxClasses}`}
                >
                    {isCompleted && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path
                                d="M1 4L3.5 6.5L9 1"
                                stroke="white"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p
                        className={`text-sm font-medium truncate leading-snug ${
                            isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
                        }`}
                    >
                        {task.title}
                    </p>
                    {task.course && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{task.course}</p>
                    )}
                </div>
            </div>

            {/* Bottom: Status badge (left) + Due date (right) */}
            <div className="flex items-center justify-between mt-2">
                <div
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${cfg.badge}`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <span className="text-xs font-semibold text-gray-600 capitalize">
            {cfg.label}
          </span>
                </div>

                {task.dueDate && (
                    <div
                        className={`flex-shrink-0 flex items-center gap-1 text-xs font-medium ${dateClasses}`}
                    >
                        <Calendar size={11} strokeWidth={2} />
                        <span>{task.dueDate}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const AppointmentCard = ({ appointment }) => {
    const cfg = appointmentStatusConfig[appointment.status?.toLowerCase()] || appointmentStatusConfig.pending;

    return (
        <div className="p-4 rounded-xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-sm transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 capitalize">{appointment.faculty}</h3>
                    {appointment.room && (
                        <p className="text-xs text-gray-400 mt-0.5">Room {appointment.room}</p>
                    )}
                </div>
                <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${cfg.badge}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <span className="text-xs font-semibold text-gray-600 capitalize">{cfg.label}</span>
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                <Clock size={13} className="text-orange-400" strokeWidth={2} />
                <span>{appointment.startTime} – {appointment.endTime}</span>
            </div>
        </div>
    );
};

const SkeletonBlock = ({ className }) => (
    <div className={`rounded-xl bg-gray-100 animate-pulse ${className}`} />
);

const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center py-8 text-gray-400 text-sm">
        <AlertCircle size={28} className="text-gray-200 mb-2" />
        {message}
    </div>
);

const MyActivity = () => {
    const { userData } = useContext(AuthContext);
    console.log("User data: ", userData);

    const [stats, setStats] = useState({});
    const [appointments, setAppointments] = useState([]);
    const [taskList, setTaskList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submissionStats, setSubmissionStats] = useState({ onTime: 0, late: 0, missed: 0 });
    const [notices, setNotices] = useState([]);

    const [isLarge, setIsLarge] = useState(false);

    useEffect(() => {
        const handler = () => setIsLarge(window.innerWidth >= 1024); // lg breakpoint ~1024px
        handler(); // run once
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!userData?._id) return;
            setLoading(true);
            try {
                const appointmentsRes = await axiosSecure.get(`/appointment/student/${userData._id}`);
                console.log("Appointments data:", appointmentsRes);

                const upcomingAppointments = (appointmentsRes.data.appointments || []).map((appointment, index) => ({
                    id: index + 1,
                    faculty: appointment.faculty.name,
                    startTime: new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    endTime: new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    room: appointment.faculty.room,
                    status: appointment.status,
                }));
                setAppointments(upcomingAppointments);

                const coursesRes = await axiosSecure.get(`/courses/my-courses`);
                console.log("Courses data (MyActivity.jsx): ", coursesRes);
                const courses = [
                    ...(coursesRes.data.activeCourses || []),
                    ...(coursesRes.data.completedCourses || [])
                ];

                const activeCourses = [...(coursesRes.data.activeCourses || [])];
                console.log("Active courses: ", activeCourses);
                console.log("Active course IDs:", activeCourses.map(c => c._id));

                const noticeRequests = activeCourses.map(course => axiosSecure.get(`/course/${course._id}/announcements`));
                const noticeResponses = await Promise.all(noticeRequests);
                console.log("Raw notice responses:", noticeResponses.map(r => r.data));
                console.log("Status codes:", noticeResponses.map(r => r.status));

                const allNotices = noticeResponses.flatMap(res => res.data?.announcements || []);
                console.log("All notices:", allNotices);

                // const allUniqueNotices = Array.from(
                //     new Map(allNotices.map(n => [n._id, n])).values()
                // );

                const timeAgo = (dateString) => {
                    const now = new Date();
                    const past = new Date(dateString);
                    const diffInSeconds = Math.floor((now - past) / 1000);
                    if (diffInSeconds < 60) return "Just now";
                    const diffInMinutes = Math.floor(diffInSeconds / 60);
                    if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;
                    const diffInHours = Math.floor(diffInMinutes / 60);
                    if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;
                    const diffInDays = Math.floor(diffInHours / 24);
                    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
                    const diffInWeeks = Math.floor(diffInDays / 7);
                    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
                    const diffInMonths = Math.floor(diffInDays / 30);
                    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
                    const diffInYears = Math.floor(diffInDays / 365);
                    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
                };

                const recentNotices = [...allNotices]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 10)
                    .map(n => ({
                        title: n.title,
                        message: n.description,
                        date: timeAgo(n.createdAt),
                        faculty: n.faculty?.name || ""
                    }));

                console.log("Recent notices: ", recentNotices);
                setNotices(recentNotices);


                const assignmentRequests = courses.map(course => axiosSecure.get(`/course/${course._id}/assignments`));
                const assignmentResponses = await Promise.all(assignmentRequests);
                const allAssignments = assignmentResponses.flatMap(res => res.data.assignments);

                const userTasks = await Promise.all(
                    allAssignments.map(async (assignment, idx) => {
                        const courseRes = await axiosSecure.get(`/courses/${assignment.course}`);

                        const submissions = Array.isArray(assignment.submissions) ? assignment.submissions : [];
                        const userSubmission = submissions.find(s => s.student === userData._id);

                        let status = 'missed';
                        if (userSubmission) {
                            const diffHrs = (new Date(userSubmission.submittedAt) - new Date(assignment.dueDate)) / (1000 * 60 * 60);
                            status = diffHrs <= 0 ? 'completed' : 'late';
                        }

                        return {
                            id: idx + 1,
                            title: assignment.title,
                            description: assignment.description,
                            course: courseRes.data.name,
                            dueDate: new Date(assignment.dueDate).toLocaleDateString(),
                            status,
                        };
                    })
                );

                // Submission stats for pie chart
                const onTime = userTasks.filter(t => t.status === 'completed').length;
                const late   = userTasks.filter(t => t.status === 'late').length;
                const missed = userTasks.filter(t => t.status === 'missed').length;

                // setTaskList(userTasks);

                setTaskList(userTasks
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .slice(0, 12)
                );

                setSubmissionStats({ onTime, late, missed });

                setStats({
                    enrolledCourses: (coursesRes.data.activeCourses || []).length,
                    pendingAssignments: userTasks.filter(t => t.status !== 'completed').length,
                    upcomingAppointments: upcomingAppointments.length,
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userData]);

    const pendingCount = taskList.filter(t => t.status !== 'completed').length;

    const pieData = [
        { name: 'On-time', value: submissionStats.onTime },
        { name: 'Late',    value: submissionStats.late   },
        { name: 'Missed',  value: submissionStats.missed },
    ];

    return (
        <div className="gilroy space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="graphik text-3xl font-semibold text-gray-900">My Activity</h1>
                <p className="text-sm text-gray-400 mt-1">Visualize your academic performance, manage assignments, and stay ahead with real-time progress insights</p>
            </div>

            {/* Header Stats */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                <StatCard
                    icon={BookOpen}
                    value={stats.enrolledCourses}
                    label="Enrolled Courses"
                    iconBg="bg-blue-50"
                    iconColor="text-blue-500"
                />
                <StatCard
                    icon={ClipboardCheck}
                    value={stats.pendingAssignments}
                    label="Pending Assignments"
                    iconBg="bg-orange-50"
                    iconColor="text-orange-500"
                />
                <StatCard
                    icon={Calendar}
                    value={stats.upcomingAppointments}
                    label="Upcoming Appointments"
                    iconBg="bg-green-50"
                    iconColor="text-green-500"
                />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 lg:grid-rows-6 gap-6 items-start">
                {/* Recent Announcements */}
                <div className="w-full h-full lg:col-span-3 lg:row-span-2">
                    <RecentNotices notices={notices} loading={loading} />
                </div>

                {/* Task List */}
                <div className="w-full h-full lg:col-span-2 lg:row-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <SectionHeader
                        icon={ClipboardCheck}
                        title="Task List"
                        iconBg="bg-orange-50"
                        iconColor="text-orange-500"
                        count={loading ? undefined : pendingCount}
                    />
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <SkeletonBlock key={i} className="h-12" />)}
                        </div>
                    ) : taskList.length === 0 ? (
                        <EmptyState message="No assignments found." />
                    ) : (
                        <div>
                            {taskList.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Calendar */}
                <div className="w-full h-full lg:col-span-3 lg:row-span-4">
                    <CalendarF />
                </div>

                {/* Submission Overview */}
                <div className="w-full h-full lg:col-span-2 lg:row-span-2 flex flex-col gap-6">
                    <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <SectionHeader
                            icon={ClipboardCheck}
                            title="Performance Overview"
                            iconBg="bg-green-50"
                            iconColor="text-green-500"
                        />
                        {loading ? (
                            <SkeletonBlock className="h-48" />
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={360}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            outerRadius={isLarge ? 80 : 50}
                                            innerRadius={isLarge ? 60 : 30}
                                            paddingAngle={3}
                                            label={({ name, percent }) =>
                                                percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''
                                            }
                                            labelLine={false}
                                        >
                                            {pieData.map((_, idx) => (
                                                <Cell key={idx} fill={PIE_COLORS[idx]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [value, name]} />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Legend */}
                                <div className="flex justify-around mt-4">
                                    {pieData.map((entry, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                                                <span className="text-xs text-gray-500">{entry.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Appointments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <SectionHeader
                    icon={Calendar}
                    title="Appointments"
                    iconBg="bg-purple-50"
                    iconColor="text-purple-500"
                />
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => <SkeletonBlock key={i} className="h-20" />)}
                    </div>
                ) : appointments.length === 0 ? (
                    <EmptyState message="No upcoming appointments scheduled." />
                ) : (
                    <div className="space-y-3">
                        {appointments.map(appointment => (
                            <AppointmentCard key={appointment.id} appointment={appointment} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyActivity;