import React, {useContext, useEffect, useState} from 'react';
import {PieChart, Pie, Cell, Tooltip, ResponsiveContainer} from 'recharts';
import {
    BookOpen, ClipboardCheck, Calendar, Clock
} from 'lucide-react';
import axiosSecure from "../../utils/axiosSecure.js";
import timeAgo from "../../utils/timeAgo.js";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";
import RecentNotices from "../../Components/RecentNotices/RecentNotices.jsx";
import CalendarF from "../../Components/CalendarF/CalendarF.jsx"
import {toast} from "sonner";
import SectionHeader from "../../Components/SectionHeader/SectionHeader.jsx";
import StatCard from "../../Components/StatCard/StatCard.jsx";
import SkeletonBlock from "../../Components/SkeletonBlock/SkeletonBlock.jsx";
import EmptyState from "../../Components/EmptyState/EmptyState.jsx";

// Design helpers for due date
const getDueDateClasses = (dateStr, isCompleted) => {
    if (isCompleted) return 'text-gray-400';
    if (!dateStr) return 'text-gray-400';
    const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return 'text-red-500';
    if (diff <= 2) return 'text-orange-500';
    if (diff <= 5) return 'text-yellow-500';
    return 'text-gray-500';
};

// Design helper for check box
const getCheckboxClasses = (status) => {
    switch (status) {
        case 'completed':
            return 'border-green-500 bg-green-500';
        case 'late':
            return 'border-red-400 bg-red-400';
        case 'missed':
            return 'border-red-400 bg-transparent';
        default:
            return 'border-yellow-400 bg-transparent';
    }
};

// Design helper for appointment status
const appointmentStatusConfig = {
    approved: {badge: 'bg-green-50 border border-green-200', dot: 'bg-green-500', label: 'Approved'},
    pending: {badge: 'bg-yellow-50 border border-yellow-200', dot: 'bg-yellow-400', label: 'Pending'},
    cancelled: {badge: 'bg-red-50 border border-red-200', dot: 'bg-red-500', label: 'Cancelled'},
};

// Pie chart section colors
const PIE_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

// Task item component which is used to represent each task in the task list used in the 'Tasks' section
const TaskItem = ({task}) => {
    const isCompleted = task.status === 'completed';
    const isLate = task.status === 'late';
    const dateClasses = getDueDateClasses(task.dueDateRaw, isCompleted);
    const checkboxClasses = getCheckboxClasses(task.status);

    // Design helper for task item
    const taskStatusConfig = {
        completed: {
            badge: 'bg-green-50 border border-green-200', dot: 'bg-green-500', label: 'Completed',
        }, late: {
            badge: 'bg-red-50 border border-red-200', dot: 'bg-red-500', label: 'Late',
        }, pending: {
            badge: 'bg-gray-50 border border-gray-200', dot: 'bg-gray-400', label: 'Pending',
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
                    {(isCompleted || isLate) && (
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
                        className={`text-sm font-medium truncate leading-snug ${isLate ? 'line-through text-red-400 decoration-red-400' : isCompleted ? 'line-through text-gray-400 decoration-gray-400' : 'text-gray-900'}`}
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
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
                    <span className="text-xs font-semibold text-gray-600 capitalize">{cfg.label}</span>
                </div>

                {task.dueDate && (
                    <div
                        className={`flex-shrink-0 flex items-center gap-1 text-xs font-medium ${dateClasses}`}
                    >
                        <Calendar size={11} strokeWidth={2}/>
                        <span>{task.dueDate}</span>
                    </div>)}
            </div>
        </div>
    );
};

const AppointmentCard = ({appointment}) => {
    const cfg = appointmentStatusConfig[appointment.status?.toLowerCase()] || appointmentStatusConfig.pending;

    return (
        <div
            className="p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 capitalize">{appointment.faculty}</h3>

                    {appointment.room && (
                        <p className="text-xs text-gray-400 mt-0.5">Room {appointment.room}</p>
                    )}
                </div>

                <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${cfg.badge}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
                    <span className="text-xs font-semibold text-gray-600 capitalize">{cfg.label}</span>
                </div>
            </div>

            <div
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                <Clock size={13} className="text-orange-400" strokeWidth={2}/>
                <span>{appointment.startTime} – {appointment.endTime}</span>
            </div>
        </div>);
};

// Main component
const MyActivity = () => {
    const {userData} = useContext(AuthContext);

    const [stats, setStats] = useState({});
    const [appointments, setAppointments] = useState([]);
    const [taskList, setTaskList] = useState([]);

    // Used to simulate pulsating item skeletons, as a representation of item loading
    const [loading, setLoading] = useState(true);

    const [submissionStats, setSubmissionStats] = useState({onTime: 0, late: 0, missed: 0});
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!userData?._id) return;

            try {
                setLoading(true);

                // Get all courses & appointments first with promise
                const [coursesRes, appointmentsRes] = await Promise.all([
                    axiosSecure.get(`/courses/my-courses`),
                    axiosSecure.get(`/appointment/student/${userData._id}`)
                ]);

                // List upcoming appointments
                const allAppointments = (appointmentsRes.data.appointments || []).map((appointment, index) => ({
                    id: index + 1,
                    faculty: appointment.faculty.name,
                    startTime: new Date(appointment.startTime).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit'
                    }),
                    endTime: new Date(appointment.endTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                    room: appointment.faculty.room,
                    status: appointment.status,
                }));

                const upcomingAppointments = allAppointments.filter(appointment => appointment.status === "approved");

                // Set appointments and stats immediately
                setAppointments(upcomingAppointments);

                // Get all active courses only
                const activeCourses = coursesRes.data.activeCourses || [];

                // Get course details with assignments & announcements
                const courseDataRes = await Promise.all(
                    activeCourses.map(async (course) => {
                        const [assignmentsRes, announcementsRes] = await Promise.all([
                            axiosSecure.get(`/course/${course._id}/assignments`),
                            axiosSecure.get(`/course/${course._id}/announcements`)
                        ]);

                        const assignments = assignmentsRes.data.assignments || [];

                        // Fetch each assignment's submission for the current student
                        const assignmentsWithSubmissions = await Promise.all(
                            assignments.map(async (assignment) => {
                                const { data } = await axiosSecure.get(`/course/${course._id}/assignment/${assignment._id}`);
                                return { assignment, submission: data.submission };
                            })
                        );

                        return {
                            course,
                            assignments: assignmentsWithSubmissions,
                            announcements: announcementsRes.data
                        };
                    })
                );

                // List all notices
                const allNotices = courseDataRes.flatMap(res => res?.announcements?.announcements || []);

                const recentNotices = allNotices
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 10)
                    .map(n => ({
                        title: n.title,
                        message: n.description,
                        date: timeAgo(n.createdAt),
                        faculty: n.faculty?.name || ""
                    }));

                setNotices(recentNotices);

                // Map all assignments to user tasks
                const userTasks = courseDataRes.flatMap(res =>
                    (res.assignments || []).map((item) => {
                        const { assignment, submission } = item;

                        let status = 'pending';

                        if (submission?.submittedAt) {
                            const diffHrs = (new Date(submission.submittedAt) - new Date(assignment.dueDate)) / (1000 * 60 * 60);
                            status = diffHrs <= 0 ? 'completed' : 'late';
                        } else if (new Date() > new Date(assignment.dueDate)) {
                            status = 'missed';
                        }

                        return {
                            id: `${res.course._id}_${assignment._id}`,
                            title: assignment.title,
                            description: assignment.description,
                            course: res.course.courseName,
                            dueDate: new Date(assignment.dueDate).toLocaleDateString(),
                            dueDateRaw: assignment.dueDate,
                            status,
                        };
                    })
                );

                // Submission stats for pie chart
                const { onTime, late, missed } = userTasks.reduce((acc, t) => {
                    if (t.status === 'completed') acc.onTime++;
                    else if (t.status === 'late') acc.late++;
                    else if (t.status === 'missed') acc.missed++;
                    return acc;
                }, { onTime: 0, late: 0, missed: 0 });

                setTaskList(userTasks
                    .sort((a, b) => new Date(a.dueDateRaw) - new Date(b.dueDateRaw))
                    .slice(0, 12));

                setSubmissionStats({onTime, late, missed});

                setStats({
                    enrolledCourses: (coursesRes.data.activeCourses || []).length,
                    pendingAssignments: userTasks.filter(t => t.status === 'pending').length,
                    upcomingAppointments: upcomingAppointments.length,
                });
            } catch {
                toast.error("Error fetching data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userData]);

    // Counts only pending tasks
    const pendingCount = taskList.filter(t => t.status === 'pending').length;

    // Setting up pie chart
    const pieData = [
        {
            name: 'On-time submissions',
            value: submissionStats.onTime
        },
        {
            name: 'Late submissions',
            value: submissionStats.late
        },
        {
            name: 'Missed submissions',
            value: submissionStats.missed
        }];

    return (
        <div className="gilroy space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="graphik text-3xl font-semibold text-gray-900">My Activity</h1>
                <p className="text-sm text-gray-400 mt-1">Visualize your academic performance, manage assignments, and
                    stay ahead with real-time progress insights</p>
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
            <div className="grid grid-cols-1 xl:grid-cols-5 xl:grid-rows-[auto_1fr] gap-6 items-start">
                {/* Recent Announcements */}
                <div className="w-full h-full xl:col-span-3 xl:row-span-2">
                    <RecentNotices notices={notices} loading={loading}/>
                </div>

                {/* Task List */}
                <div
                    className="w-full h-full xl:col-span-2 xl:row-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <SectionHeader
                        icon={ClipboardCheck}
                        title="Task List"
                        iconBg="bg-orange-50"
                        iconColor="text-orange-500"
                        count={loading ? undefined : pendingCount}
                        seeAllTo="../assessments"
                        navigate={true}
                    />
                    {loading ? (<div className="space-y-3">
                            {[1, 2, 3].map(i => <SkeletonBlock key={i} className="h-12"/>)}
                        </div>
                    ) : taskList.length === 0 ? (
                            <EmptyState message="No assignments found."/>
                    ) : (
                        <div>
                            {taskList.map(task => (<TaskItem
                                    key={task.id}
                                    task={task}
                                />))}
                        </div>
                    )}
                </div>

                {/* CalendarF */}
                <div className="w-full h-full xl:col-span-3 xl:row-span-4">
                    <CalendarF/>
                </div>

                {/* Submission Overview */}
                <div className="w-full xl:col-span-2 xl:row-span-2">
                    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <SectionHeader
                            icon={ClipboardCheck}
                            title="Performance Overview"
                            iconBg="bg-green-50"
                            iconColor="text-green-500"
                            navigate={false}
                        />
                        {loading ? (
                            <SkeletonBlock className="h-48"/>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            outerRadius={100}
                                            label={({percent}) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                                            labelLine={false}
                                        >
                                            {pieData.map((_, idx) => (
                                                <Cell key={idx} fill={PIE_COLORS[idx]}/>
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [value, name]}/>
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Legend */}
                                <div className="flex flex-col lg:flex-row justify-around mt-4">
                                    {pieData.map((entry, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-1">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{backgroundColor: PIE_COLORS[idx]}}
                                                />
                                                <span className="text-xs text-gray-500 text-center">{entry.name}</span>
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
                    seeAllTo="../ask-mentor"
                    navigate={true}
                />
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => <SkeletonBlock key={i} className="h-20"/>)}
                    </div>
                ) : appointments.length === 0 ? (
                    <EmptyState message="No upcoming appointments scheduled."/>
                ) : (
                    <div className="space-y-3">
                        {appointments.map(appointment => (
                            <AppointmentCard key={appointment.id} appointment={appointment}/>))}
                    </div>
                )}
            </div>
        </div>);
};

export default MyActivity;