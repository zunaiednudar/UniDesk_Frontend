import React, {useEffect, useState} from 'react';
import {NavLink, Outlet, useLocation} from 'react-router';
import SidebarDashboard from "../../Components/SidebarDashboard/SidebarDashboard.jsx";
import {Bell, PanelLeft, Check } from "lucide-react";
import axiosSecure from "../../utils/axiosSecure.js";

const DashboardLayout = ({ menuItems }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    const [isSidebarOpen, setIsSidebarOpen] = useState(
        window.matchMedia("(min-width: 1024px)").matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");

        const handleResize = (e) => {
            setIsMobile(!e.matches);
            setIsSidebarOpen(e.matches);
        };

        mediaQuery.addEventListener("change", handleResize);

        return () => {
            mediaQuery.removeEventListener("change", handleResize);
        }
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const iconBtnClass = "hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer";

    const [notifications, setNotifications] = useState([]);

    const timeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);

        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) return "Just now";

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60)
            return `${diffInMinutes} min${diffInMinutes > 1 ? "s" : ""} ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24)
            return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7)
            return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4)
            return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12)
            return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;

        const diffInYears = Math.floor(diffInDays / 365);
        return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axiosSecure.get("/notifications");
                console.log("Notifications: ", res);

                const isToday = (dateString) => {
                    const created = new Date(dateString);
                    const today = new Date();

                    return (
                        created.getFullYear() === today.getFullYear() &&
                        created.getMonth() === today.getMonth() &&
                        created.getDate() === today.getDate()
                    );
                };

                const formattedNotifications = (res.data.notifications || []).map((notification, index) => ({
                    id: index + 1,
                    _id: notification._id,
                    title: notification.type,
                    message: notification.message,
                    time: timeAgo(notification.createdAt),
                    read: notification.isRead,
                    today: isToday(notification.createdAt)
                }));
                setNotifications(formattedNotifications);
            } catch (error) {
                console.log(error);
            }
        }

        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;
    const todayNotifs = notifications.filter(n => n.today).slice(0, 10);
    const historyNotifs = notifications.filter(n => !n.today).slice(0, 10);

    const markAllRead = async () => {
        try {
            await axiosSecure.patch("/notifications/all");
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.log(error);
        }
    }

    const markRead = async (id, _id) => {
        try {
            await axiosSecure.patch(`/notifications/${_id}`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.log(error);
        }
    }

    const location = useLocation();
    const isNotificationsPage = location.pathname.includes("notifications");

    const pathSegments = location.pathname.split("/").filter(Boolean);
    const filteredSegments = pathSegments.filter(segment =>
        segment !== "student" &&
        !/^[a-f\d]{24}$/i.test(segment) // remove Mongo ObjectId
    );
    const formattedPath = filteredSegments.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(" / ");

    return (
        <div className="gilroy flex h-dvh">
            {/* Sidebar */}
             <SidebarDashboard menuItems={menuItems} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />

            {/* Main Content */}
            <main className="flex flex-col flex-1 gap-2 w-full overflow-y-auto">
                <div className="sticky top-0 z-40 w-full bg-white">
                    <div className="w-full h-full flex justify-between items-center min-h-10 px-2.5">
                        <div className="flex items-center">
                            {/* Mobile Overlay */}
                            {(isMobile || (!isMobile && !isSidebarOpen)) && (
                                <button onClick={toggleSidebar} className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer">
                                    <PanelLeft className="w-6 h-6 text-gray-500" />
                                </button>
                            )}

                            <span className={`pb-0.5 pl-2 graphik text-gray-500 text-md capitalize ${isSidebarOpen? "ml-10" : ""}`}>{formattedPath}</span>
                        </div>

                        {/* Notification icon */}
                        <div className="dropdown dropdown-end ml-auto">
                            <button tabIndex={0} className={`relative ${iconBtnClass} ml-auto ${isNotificationsPage ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>
                                <Bell className="w-5 h-5" />

                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                                )}
                            </button>

                            <div tabIndex={0} className="dropdown-content z-50 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                    <span className="text-sm font-semibold text-gray-800">Notifications</span>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition font-medium">
                                            <Check className="w-3 h-3" />
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-[420px] overflow-y-auto">
                                    {/* Today */}
                                    {todayNotifs.length > 0 && (
                                        <>
                                            <div className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                                                Today
                                            </div>
                                            {todayNotifs.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => markRead(n.id, n._id)}
                                                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-xs font-semibold truncate ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                                                        <p className="text-xs text-gray-400 truncate">{n.message}</p>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{n.time}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {/* History */}
                                    {historyNotifs.length > 0 && (
                                        <>
                                            <div className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                                                History
                                            </div>
                                            {historyNotifs.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => markRead(n.id, n._id)}
                                                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-xs font-semibold truncate ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                                                        <p className="text-xs text-gray-400 truncate">{n.message}</p>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{n.time}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {notifications.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                            <Bell className="w-8 h-8 mb-2 opacity-30" />
                                            <p className="text-xs">No notifications yet</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="border-t border-gray-100 px-4 py-3">
                                    <NavLink
                                        to="./notifications"
                                        className="w-full text-xs font-semibold text-blue-600 hover:text-blue-800 transition text-center">
                                        See all notifications
                                    </NavLink>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border border-gray-200 mt-0.5 mb-3.5 mx-2.5"></div>
                </div>

                <div className="w-full flex-1 p-2.5">
                    <div className="w-full px-12">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;