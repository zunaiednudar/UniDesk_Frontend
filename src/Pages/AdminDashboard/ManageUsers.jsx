import {toast} from "sonner";
import axiosSecure from "../../utils/axiosSecure.js";
import React, {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";
import {
    AlertCircle, CalendarCheck, GraduationCap, School, SquarePen,
    UsersRound, Trash2, ShieldCheck, TrendingUp, ShieldUser
} from "lucide-react";
import {useNavigate} from "react-router";

import {
    PieChart,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend, ResponsiveContainer, Pie, Cell,
} from 'recharts';

// Helper for month mapping
const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Design helper that represents loading
const SkeletonBlock = ({className}) => (
    <div className={`rounded-xl bg-gray-100 animate-pulse ${className}`}/>
);

// General stat template
const StatCard = ({icon: Icon, value, label, iconBg, iconColor}) => (
    <div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow duration-200">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon size={22} className={iconColor} strokeWidth={1.75}/>
        </div>
        <div>
            <div className="text-3xl font-bold text-gray-900 leading-tight">{value ?? '—'}</div>
            <div className="text-sm text-gray-400 mt-0.5 font-medium">{label}</div>
        </div>
    </div>
);

// General section header template
const SectionHeader = ({icon: Icon, title, iconBg, iconColor, count}) => (
    <div className="flex items-center gap-2.5 mb-5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon size={16} className={iconColor} strokeWidth={2}/>
        </div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {count !== undefined && (
            <span className="ml-1 text-xs font-semibold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                {count}
            </span>)
        }
    </div>
);

// General section body template
// Invoke if there is no item to show
const EmptyState = ({message}) => (
    <div className="flex flex-col items-center py-8 text-gray-400 text-sm">
        <AlertCircle size={28} className="text-gray-200 mb-2"/>
        {message}
    </div>
);

const roleConfig = {
    student: {
        icon: School, badge: 'bg-blue-50', tag: 'bg-blue-200', roleIconTag: 'text-blue-400'
    },
    faculty: {
        icon: GraduationCap, badge: 'bg-orange-50', tag: 'bg-orange-200', roleIconTag: 'text-orange-400'
    }
};

const userStatusConfig = {
    verified: {
        badge: 'bg-green-50 border border-green-200', dot: 'bg-green-500', label: 'Verified',
    }, suspended: {
        badge: 'bg-red-50 border border-red-200', dot: 'bg-red-500', label: 'Suspended',
    }, pending: {
        badge: 'bg-gray-50 border border-gray-200', dot: 'bg-gray-400', label: 'Pending',
    },
};

// Design helpers for pie chart
const PIE_COLORS = ['#6366f1', '#22c55e', '#ef4444'];

const UserStatusChart = ({data, loading}) => (
    <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <SectionHeader
            icon={ShieldCheck}
            title="Status Overview"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-500"
        />
        {loading ? (
            <SkeletonBlock className="h-48"/>
        ) : (
            <>
                <ResponsiveContainer width="100%" height={360}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                            label={({ percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                            labelLine={false}
                        >
                            {data.map((_, idx) => (
                                <Cell key={idx} fill={PIE_COLORS[idx]}/>
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]}/>
                    </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="flex justify-around mt-4">
                    {data.map((entry, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }}/>
                                <span className="text-xs text-gray-500">{entry.name}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{entry.value}</span>
                        </div>
                    ))}
                </div>
            </>
        )}
    </div>
);

const UserGrowthChart = ({data, loading}) => (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col overflow-x-auto">
        <SectionHeader
            icon={TrendingUp}
            title="Growth Overview"
            iconBg="bg-purple-50"
            iconColor="text-purple-500"
        />

        {loading ? <SkeletonBlock className="h-72"/> : (
            <BarChart
                width={600}
                height={400}
                data={data}
                margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="student" fill="#8884d8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="faculty" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            </BarChart>
        )}
    </div>
);

// Design for a single user item
// Each item consists of - ID, Profile Picture, Name, Email, Role, Status, Created At, Actions (Edit - Delete)
const UserItem = ({user, navigate, setUserList}) => {
    const cfg = userStatusConfig[user.status] || userStatusConfig.pending;
    const RoleIcon = roleConfig[user.role]?.icon ?? School;

    const [deleting, setDeleting] = useState(false);

    // User deletion logic
    const handleDelete = async (email) => {
        setDeleting(true);

        try {
            const deleteRes = await axiosSecure.delete(`/admin/users/${email}`);

            if (deleteRes.status === 200) {
                toast.success("User deleted successfully.");

                // Update the users list so that the deleted user is there no more
                setUserList(prev => prev.filter(user => user.email !== email));
            }
        } catch {
            toast.error('Error deleting user');
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className={`w-full flex items-center gap-3 px-3 py-2.5 ${roleConfig[user.role]?.badge ?? 'bg-gray-50 border-gray-200'} overflow-x-auto`}>
            {/* Role Icon */}
            <div className="flex-shrink-0">
                <RoleIcon size={20} className={`${roleConfig[user.role]?.roleIconTag ?? 'text-gray-400'}`}/>
            </div>

            {/* Profile Picture */}
            <div
                className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden"
                style={user.photoURL ? {
                    backgroundImage: `url(${user.photoURL})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                } : undefined}
            >
                {!user.photoURL && (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-600">
                        {user.name?.[0]?.toUpperCase() || '?'}
                    </span>
                    </div>
                )}
            </div>

            {/* Name + Email */}
            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-gray-800 truncate">{user.name}</span>
                <span className="text-xs text-gray-400 truncate">{user.email}</span>
            </div>

            {/* ID */}
            <span className="flex-1 hidden md:block text-xs text-gray-400">ID: {user.id}</span>

            {/* Role */}
            <span className={`flex-shrink-0 text-xs font-semibold text-gray-500 capitalize px-2 py-1 rounded-xl ${roleConfig[user.role]?.tag ?? 'bg-gray-50 border-gray-200'}`}>{user.role}</span>

            {/* Status */}
            <div className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-2 py-1 ${cfg.badge}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
                <span className="text-xs font-semibold text-gray-600">{cfg.label}</span>
            </div>

            {/* Created At */}
            <div className="flex-shrink-0 hidden md:flex items-center gap-1 text-xs text-gray-400">
                <CalendarCheck size={11} strokeWidth={2}/>
                <span>{user.createdAt}</span>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-1.5">
                <button
                    onClick={() => navigate(`/dashboard/admin/users/${user.email}/details`)}
                    className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:text-blue-500 transition">
                    <SquarePen size={18}/>
                </button>
                {deleting ? (
                    <svg className="animate-spin w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                ) : (
                    <button
                        onClick={() => document.getElementById(`delete_modal_${user.id}`).showModal()}
                        className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition">
                        <Trash2 size={18}/>
                    </button>
                )}
            </div>

            {/* Logout confirmation modal */}
            <dialog id={`delete_modal_${user.id}`} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <p className="text-sm text-gray-500">Are you sure you want to delete this user permanently?</p>

                    <div className="modal-action">
                        <button className="btn btn-ghost btn-sm" onClick={() => document.getElementById(`delete_modal_${user.id}`).close()}>Keep User</button>
                        <button className="btn btn-error btn-sm text-white" onClick={() => handleDelete(user.email)}>Delete User</button>
                    </div>
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
}

const ManageUsers = () => {
    const [userList, setUserList] = useState([]);

    // Design helper states representing loading
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const {userData} = useContext(AuthContext);

    const [stats, setStats] = useState({});

    const [barChartData, setBarChartData] = useState([]);
    const [pieChartData, setPieChartData] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (userData?._id == null) return;
            setLoading(true);

            try {
                // Fetch all users
                const usersRes = await axiosSecure.get(`/admin/users`);

                const users = usersRes.data.users.map((user) => {
                    return {
                        batch: user.batch,
                        biography: user.biography,
                        createdAt: new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        }),
                        createdAtRaw: user.createdAt,
                        department: user.department,
                        designation: user.designation,
                        email: user.email,
                        name: user.name,
                        photoURL: user.photoURL ?? null,
                        researchInterests: user.researchInterests || [],
                        role: user.role,
                        status: user.status,
                        studentID: user.studentID,
                        id: user._id
                    }
                });

                const students = users.filter(user => user.role === "student");
                const faculties = users.filter(user => user.role === "faculty");
                const admins = users.filter(user => user.role === "admin");

                // Filter out admins
                const usersWithoutAdmins = users.filter(user => user.role !== 'admin');

                // Set user list
                setUserList(usersWithoutAdmins);

                // Map stats

                const totalStudentCount = students.length;
                const totalFacultyCount = faculties.length;
                const totalAdminCount = admins.length;
                const totalUserCount = totalStudentCount + totalFacultyCount + totalAdminCount;

                setStats({
                    totalUsers: totalUserCount,
                    totalStudents: totalStudentCount,
                    totalFaculties: totalFacultyCount,
                    totalAdmins: totalAdminCount,
                });

                // Map bar chart data

                // Track student count
                const studentRawCount = students
                    .reduce((acc, user) => {
                        const month = new Date(user.createdAtRaw).getMonth();
                        if (new Date(user.createdAtRaw).getFullYear() === new Date().getFullYear())
                            acc[month] = (acc[month] || 0) + 1;
                        return acc;
                    }, Array(12).fill(0));

                // Track faculty count
                const facultyRawCount = faculties
                    .reduce((acc, user) => {
                        const month = new Date(user.createdAtRaw).getMonth();
                        if (new Date(user.createdAtRaw).getFullYear() === new Date().getFullYear())
                            acc[month] = (acc[month] || 0) + 1;
                        return acc;
                    }, Array(12).fill(0));

                const currentMonth = new Date().getMonth();

                const studentCount = [];
                const facultyCount = [];

                for (let m = 0; m <= currentMonth; m++) {
                    let sTotal = 0;
                    let fTotal = 0;
                    for (let i = 0; i <= m; i++) {
                        sTotal += studentRawCount[i];
                        fTotal += facultyRawCount[i];
                    }
                    studentCount.push(sTotal);
                    facultyCount.push(fTotal);
                }

                const barGraphData = months
                    .slice(0, currentMonth + 1)
                    .map((month, index) => ({
                    name: month,
                    student: studentCount[index],
                    faculty: facultyCount[index]
                }));

                // Map pie chart data

                const pendingCount = usersWithoutAdmins.filter(u => u.status === 'pending').length;
                const verifiedCount = usersWithoutAdmins.filter(u => u.status === 'verified').length;
                const suspendedCount = usersWithoutAdmins.filter(u => u.status === 'suspended').length;

                const pieGraphData = [
                    {name: 'Pending', value: pendingCount},
                    {name: 'Verified', value: verifiedCount},
                    {name: 'Suspended', value: suspendedCount},
                ];

                setBarChartData(barGraphData);
                setPieChartData(pieGraphData);
            } catch {
                toast.error('Error fetching users');
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, [userData]);

    return (
        <div className="gilroy space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="graphik text-3xl font-semibold text-gray-900">Manage ManageUsers</h1>
                <p className="text-sm text-gray-400 mt-1">Monitor your users, manage accounts efficiently, and keep your community organized with real-time insights</p>
            </div>

            {/* Stats */}
            <div className="flex flex-col lg:flex-row items-stretch gap-10">
                <UserGrowthChart data={barChartData} loading={loading}/>

                <div className="flex-1 flex flex-col justify-between gap-4">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
                        <StatCard
                            icon={UsersRound}
                            value={stats.totalUsers}
                            label="Total ManageUsers"
                            iconBg="bg-blue-50"
                            iconColor="text-blue-500"
                        />

                        <StatCard
                            icon={School}
                            value={stats.totalStudents}
                            label="Total Students"
                            iconBg="bg-emerald-50"
                            iconColor="text-emerald-500"
                        />

                        <StatCard
                            icon={GraduationCap}
                            value={stats.totalFaculties}
                            label="Total Faculties"
                            iconBg="bg-orange-50"
                            iconColor="text-orange-500"
                        />

                        <StatCard
                            icon={ShieldUser}
                            value={stats.totalAdmins}
                            label="Total Admins"
                            iconBg="bg-purple-50"
                            iconColor="text-purple-500"
                        />
                    </div>

                    <UserStatusChart data={pieChartData} loading={loading}/>
                </div>
            </div>

            {/* ManageUsers List */}
            <div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
                <SectionHeader
                    icon={UsersRound}
                    title="All ManageUsers"
                    iconBg="bg-blue-50"
                    iconColor="text-blue-500"
                    count={loading ? undefined : userList.length}
                />

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <SkeletonBlock key={i} className="h-6"/>)}
                    </div>
                ) : userList.length === 0 ? (
                    <EmptyState message="No users found."/>
                ) : (
                    <div>
                        {userList.map(user => (
                            <UserItem
                                key={user.id}
                                user={user}
                                navigate={navigate}
                                setUserList={setUserList}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;