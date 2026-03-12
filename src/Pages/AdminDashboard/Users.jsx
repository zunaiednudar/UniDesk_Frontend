import {toast} from "sonner";
import axiosSecure from "../../utils/axiosSecure.js";
import React, {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";
import {
    AlertCircle, CalendarCheck, GraduationCap, School, SquarePen,
    UsersRound, Trash2
} from "lucide-react";
import {useNavigate} from "react-router";

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
        icon: School, badge: 'bg-blue-50 border border-blue-200'
    },
    faculty: {
        icon: GraduationCap, badge: 'bg-orange-50 border border-orange-200'
    }
};

const userStatusConfig = {
    approved: {
        badge: 'bg-green-50 border border-green-200', dot: 'bg-green-500', label: 'Approved',
    }, suspended: {
        badge: 'bg-red-50 border border-red-200', dot: 'bg-red-500', label: 'Suspended',
    }, pending: {
        badge: 'bg-gray-50 border border-gray-200', dot: 'bg-gray-400', label: 'Pending',
    },
};

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
            console.log(deleteRes);

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
        <div className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border mb-1.5 ${roleConfig[user.role]?.badge ?? 'bg-gray-50 border-gray-200'}`}>
            {/* Role Icon */}
            <div className="flex-shrink-0">
                <RoleIcon size={14} className="text-gray-400"/>
            </div>

            {/* Profile Picture */}
            {/*<div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center overflow-hidden">*/}
            {/*    {user.photoURL ? (*/}
            {/*        <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover"/>*/}
            {/*    ) : (*/}
            {/*        <span className="text-xs font-bold text-purple-600">*/}
            {/*        {user.name?.[0]?.toUpperCase() || '?'}*/}
            {/*    </span>*/}
            {/*    )}*/}
            {/*</div>*/}

            {/* Name + Email */}
            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-gray-800 truncate">{user.name}</span>
                <span className="text-xs text-gray-400 truncate">{user.email}</span>
            </div>

            {/* Status */}
            <div className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 ${cfg.badge}`}>
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
                    onClick={() => navigate(`dashboard/admin/user/${user.id}/details`)}
                    className="p-1.5 rounded-lg hover:bg-white/80 text-gray-400 hover:text-blue-500 transition">
                    <SquarePen size={13}/>
                </button>
                {deleting ? (
                    <svg className="animate-spin w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                ) : (
                    <button
                        onClick={() => handleDelete(user.email)}
                        className="p-1.5 rounded-lg hover:bg-white/80 text-gray-400 hover:text-red-500 transition">
                        <Trash2 size={13}/>
                    </button>
                )}
            </div>
        </div>
    );
}

const Users = () => {
    const [userList, setUserList] = useState([]);
    const [userCount, setUserCount] = useState(0);

    // Design helper states representing loading
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const {userData} = useContext(AuthContext);

    useEffect(() => {
        const fetchUsers = async () => {
            if (userData?._id == null) return;
            setLoading(true);

            try {
                // Fetch all users
                const usersRes = await axiosSecure.get(`/admin/users`);
                console.log("Users data (Users.jsx): ", usersRes);

                const users = usersRes.data.users.map((user) => {
                    return {
                        batch: user.batch,
                        biography: user.biography,
                        createdAt: new Date(user.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        }),
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

                setUserList(users);
                setUserCount(users.length);
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
            <div>
                Stats
                <p>Total Users</p>
                <p>Total Students</p>
                <p>Total Faculties</p>
            </div>

            <div>
                Bar chart (all years)
                Student Trend
                Faculty Trend
            </div>

            <div>
                Pie chart
                Pending
                Approved
                Suspended
            </div>

            {/* Users List */}
            <div
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
                <SectionHeader
                    icon={UsersRound}
                    title="All Users"
                    iconBg="bg-blue-50"
                    iconColor="text-blue-500"
                    count={loading ? undefined : userCount}
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

export default Users;