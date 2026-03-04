import React, { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import axiosSecure from "../../utils/axiosSecure.js";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const isToday = (dateString) => {
        const created = new Date(dateString);
        const today = new Date();
        return (
            created.getFullYear() === today.getFullYear() &&
            created.getMonth() === today.getMonth() &&
            created.getDate() === today.getDate()
        );
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axiosSecure.get("/notifications");
                const formatted = (res.data.notifications || []).map((n, index) => ({
                    id: index + 1,
                    _id: n._id,
                    title: n.type,
                    message: n.message,
                    time: timeAgo(n.createdAt),
                    read: n.isRead,
                    today: isToday(n.createdAt)
                }));
                setNotifications(formatted);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;
    const todayNotifs = notifications.filter(n => n.today);
    const historyNotifs = notifications.filter(n => !n.today);

    const markAllRead = async () => {
        try {
            await axiosSecure.patch("/notifications/all");
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.log(error);
        }
    };

    const markRead = async (id, _id) => {
        try {
            await axiosSecure.patch(`/notifications/${_id}`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.log(error);
        }
    };

    const NotificationRow = ({ n }) => (
        <div
            onClick={() => !n.read && markRead(n.id, n._id)}
            className={`flex flex-col md:flex-row items-start gap-4 p-4 rounded-xl transition border cursor-pointer
                ${!n.read
                ? 'bg-blue-50/60 border-blue-100 hover:bg-blue-50'
                : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-gray-200'}`} />
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold capitalize ${!n.read ? 'text-gray-900' : 'text-gray-500'}`}>
                    {n.title}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">{n.message}</p>
            </div>
            <span className="text-xs text-gray-400 shrink-0 mt-0.5">{n.time}</span>
        </div>
    );

    return (
        <div className="gilroy min-h-screen py-8 px-4">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {loading
                                ? "Loading..."
                                : unreadCount > 0
                                    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                                    : "You're all caught up!"}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600 shadow-sm">
                            <Check className="w-4 h-4" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="p-3 space-y-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
                                        <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                                    </div>
                                    <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Today */}
                {!loading && todayNotifs.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Today</span>
                        </div>
                        <div className="p-3 space-y-2">
                            {todayNotifs.map(n => <NotificationRow key={n.id} n={n} />)}
                        </div>
                    </div>
                )}

                {/* History */}
                {!loading && historyNotifs.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">History</span>
                        </div>
                        <div className="p-3 space-y-2">
                            {historyNotifs.map(n => <NotificationRow key={n.id} n={n} />)}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <Bell className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm font-medium text-gray-500">No notifications yet</p>
                        <p className="text-xs mt-1">You're all caught up!</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Notifications;