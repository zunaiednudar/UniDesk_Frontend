import React from 'react';
import {
    BookOpen,
    ClipboardCheck,
    Calendar,
    Award,
    Bell,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    Users
} from 'lucide-react';

const MyActivity = () => {
    const stats = {
        enrolledCourses: 8,
        pendingAssignments: 5,
        upcomingAppointments: 3,
        contributionPoints: 1247
    };

    const recentNotices = [
        {
            id: 1,
            title: 'Registration for Next Semester Starts Monday',
            time: '2 days ago',
            category: 'Registration',
            icon: <Calendar className="w-4 h-4" />
        },
        {
            id: 2,
            title: 'Campus WiFi Maintenance This Weekend',
            time: '3 days ago',
            category: 'IT',
            icon: <AlertCircle className="w-4 h-4" />
        },
        {
            id: 3,
            title: 'Project Submission Guidelines Updated',
            time: '3 days ago',
            category: 'Academic',
            icon: <BookOpen className="w-4 h-4" />
        },
        {
            id: 4,
            title: 'Career Fair - January 16th, 2026',
            time: '4 days ago',
            category: 'Event',
            icon: <Users className="w-4 h-4" />
        },
        {
            id: 5,
            title: 'Scholarship Applications Now Open',
            time: '5 days ago',
            category: 'Financial',
            icon: <Award className="w-4 h-4" />
        }
    ];

    const topContributors = [
        { id: 1, name: 'Sarah Ahmed', contributions: 2847, points: 2847, avatar: 'SA', rank: 1 },
        { id: 2, name: 'Karim Rahman', contributions: 2435, points: 2435, avatar: 'KR', rank: 2 },
        { id: 3, name: 'Nadia Khan', contributions: 2198, points: 2198, avatar: 'NK', rank: 3 },
        { id: 4, name: 'Ahmed Ali', contributions: 1876, points: 1876, avatar: 'AA', rank: 4 },
        { id: 5, name: 'Fatima Hasan', contributions: 1654, points: 1654, avatar: 'FH', rank: 5 },
        { id: 6, name: 'Rahim Islam', contributions: 1432, points: 1432, avatar: 'RI', rank: 6 },
        { id: 7, name: 'Ayesha Begum', contributions: 1247, points: 1247, avatar: 'AB', rank: 7 }
    ];

    const appointments = [
        {
            id: 1,
            faculty: 'Dr. Rahman',
            course: 'Software Engineering (CSE 3220)',
            date: 'Jan 8, 2026',
            time: '10:00 AM',
            room: '302',
            status: 'upcoming'
        },
        {
            id: 2,
            faculty: 'Prof. Ahmed',
            course: 'Database Systems (CSE 3210)',
            date: 'Jan 9, 2026',
            time: '2:00 PM',
            room: '205',
            status: 'upcoming'
        },
        {
            id: 3,
            faculty: 'Dr. Khan',
            course: 'Computer Networks (CSE 3230)',
            date: 'Jan 10, 2026',
            time: '11:30 AM',
            room: '401',
            status: 'upcoming'
        }
    ];

    const taskList = [
        {
            id: 1,
            title: 'Database Design Project',
            course: 'CSE 3210',
            dueDate: 'Jan 5, 2026',
            status: 'in-progress'
        },
        {
            id: 2,
            title: 'UML Diagram Assignment',
            course: 'CSE 3220',
            dueDate: 'Jan 10, 2026',
            status: 'pending'
        },
        {
            id: 3,
            title: 'Network Protocol Analysis',
            course: 'CSE 3230',
            dueDate: 'Jan 12, 2026',
            status: 'pending'
        },
        {
            id: 4,
            title: 'OS Scheduling Algorithm',
            course: 'CSE 3240',
            dueDate: 'Jan 15, 2026',
            status: 'pending'
        },
        {
            id: 5,
            title: 'Algorithm Complexity Report',
            course: 'CSE 3250',
            dueDate: 'Jan 18, 2026',
            status: 'completed'
        }
    ];

    const contributionData = {
        onTime: 45,
        late: 12,
        missed: 3
    };

    const plagiarismSummary = [
        { subject: 'Software Engineering', code: 'CSE 3220', detected: 4, total: 8, status: 'fair' },
        { subject: 'Database Systems', code: 'CSE 3210', detected: 0, total: 6, status: 'clean' },
        { subject: 'Computer Networks', code: 'CSE 3230', detected: 1, total: 7, status: 'fair' },
        { subject: 'Operating Systems', code: 'CSE 3240', detected: 0, total: 5, status: 'clean' },
        { subject: 'Algorithm Analysis', code: 'CSE 3250', detected: 1, total: 9, status: 'warning' }
    ];

    const getRankIcon = (rank) => {
        const icons = { 1: '🥇', 2: '🥈', 3: '🥉' };
        return icons[rank] || rank;
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            clean: 'bg-green-100 text-green-700',
            fair: 'bg-yellow-100 text-yellow-700',
            warning: 'bg-orange-100 text-orange-700'
        };
        return classes[status] || 'bg-gray-100 text-gray-700';
    };

    const getTaskStatusClass = (status) => {
        const classes = {
            completed: 'bg-green-100 text-green-700 border-l-4 border-green-500',
            'in-progress': 'bg-orange-100 text-orange-700 border-l-4 border-orange-500',
            pending: 'bg-yellow-100 text-yellow-700 border-l-4 border-yellow-500'
        };
        return classes[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.enrolledCourses}</div>
                    <div className="text-sm text-gray-600">Enrolled Courses</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <ClipboardCheck className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingAssignments}</div>
                    <div className="text-sm text-gray-600">Pending Assignments</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.upcomingAppointments}</div>
                    <div className="text-sm text-gray-600">Upcoming Appointments</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Award className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.contributionPoints}</div>
                    <div className="text-sm text-gray-600">Contribution Points</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Notices */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-600" />
                            Recent Notices
                        </h2>
                        <div className="space-y-3">
                            {recentNotices.map((notice) => (
                                <div
                                    key={notice.id}
                                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition cursor-pointer border border-gray-100"
                                >
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {notice.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 mb-1">{notice.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span>{notice.time}</span>
                                            <span className="px-2 py-1 bg-gray-100 rounded">{notice.category}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Overview */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Overview</h2>
                        <div className="flex items-center justify-center mb-8">
                            <div className="relative w-64 h-64">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="128" cy="128" r="100" stroke="#E5E7EB" strokeWidth="20" fill="none" />
                                    <circle
                                        cx="128" cy="128" r="100" stroke="#10B981" strokeWidth="20" fill="none"
                                        strokeDasharray={`${(contributionData.onTime / 60) * 628} 628`}
                                        strokeLinecap="round"
                                    />
                                    <circle
                                        cx="128" cy="128" r="100" stroke="#F59E0B" strokeWidth="20" fill="none"
                                        strokeDasharray={`${(contributionData.late / 60) * 628} 628`}
                                        strokeDashoffset={`-${(contributionData.onTime / 60) * 628}`}
                                        strokeLinecap="round"
                                    />
                                    <circle
                                        cx="128" cy="128" r="100" stroke="#EF4444" strokeWidth="20" fill="none"
                                        strokeDasharray={`${(contributionData.missed / 60) * 628} 628`}
                                        strokeDashoffset={`-${((contributionData.onTime + contributionData.late) / 60) * 628}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-4xl font-bold text-gray-900">75%</div>
                                    <div className="text-sm text-gray-600">On-time Submissions</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-8">
                            <div className="text-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">On-time</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{contributionData.onTime}</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Late</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{contributionData.late}</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Missed</span>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{contributionData.missed}</div>
                            </div>
                        </div>
                    </div>

                    {/* Plagiarism Detection Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                            Plagiarism Detection Summary
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Subject</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Code</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Detected</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {plagiarismSummary.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-900">{item.subject}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{item.code}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900 text-center">{item.detected}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900 text-center">{item.total}</td>
                                        <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-green-600" />
                            Task List
                        </h2>
                        <div className="space-y-3">
                            {taskList.map((task) => (
                                <div key={task.id} className={`p-4 rounded-lg ${getTaskStatusClass(task.status)}`}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                                            <p className="text-sm text-gray-600">{task.course}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600">{task.dueDate}</div>
                                            <div className="text-xs mt-1 capitalize">{task.status.replace('-', ' ')}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar Content */}
                <div className="space-y-6">
                    {/* Top Contributors */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-600" />
                            Top Contributors
                        </h2>
                        <div className="space-y-3">
                            {topContributors.map((contributor) => (
                                <div
                                    key={contributor.id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <div className="text-xl">{getRankIcon(contributor.rank)}</div>
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {contributor.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 text-sm">{contributor.name}</h3>
                                        <p className="text-xs text-gray-600">{contributor.contributions} contributions</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-900">{contributor.points}</div>
                                        <div className="text-xs text-gray-600">points</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Appointments */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            Appointments
                        </h2>
                        <div className="space-y-4">
                            {appointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{appointment.faculty}</h3>
                                            <p className="text-sm text-gray-600">{appointment.course}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {appointment.status}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {appointment.date}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {appointment.time}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600">
                                        Room: {appointment.room}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyActivity;
