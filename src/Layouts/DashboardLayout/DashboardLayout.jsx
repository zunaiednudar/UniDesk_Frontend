import React, {useEffect, useState} from 'react';
import { NavLink, Outlet } from 'react-router';
import Footer from "../../Components/Footer/Footer.jsx";
import NavbarDashboard from "../../Components/NavbarDashboard/NavbarDashboard.jsx";
import SidebarDashboard from "../../Components/SidebarDashboard/SidebarDashboard.jsx";
import {Bell, PanelLeft, Check } from "lucide-react";

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

    // Mock notifications — replace with real data from API
    const [notifications, setNotifications] = useState([
        { id: 1, title: "Assignment submitted", message: "John Doe submitted Assignment 3", time: "2 min ago", read: false, today: true },
        { id: 2, title: "New course enrolled", message: "You have been enrolled in CSE 401", time: "1 hr ago", read: false, today: true },
        { id: 3, title: "Mentor reply", message: "Your mentor replied to your question", time: "3 hr ago", read: false, today: true },
        { id: 4, title: "Project deadline", message: "Project submission deadline is tomorrow", time: "5 hr ago", read: true, today: true },
        { id: 5, title: "Grade published", message: "Mid-term grades have been published", time: "Yesterday", read: true, today: false },
        { id: 6, title: "Course update", message: "New lecture added to CSE 301", time: "2 days ago", read: true, today: false },
        { id: 7, title: "Assignment due", message: "Assignment 4 is due in 3 days", time: "3 days ago", read: true, today: false },
        { id: 8, title: "Announcement", message: "Campus will be closed on Friday", time: "4 days ago", read: true, today: false },
        { id: 9, title: "New message", message: "You have a new message from Admin", time: "5 days ago", read: true, today: false },
        { id: 10, title: "Profile updated", message: "Your profile was updated successfully", time: "1 week ago", read: true, today: false },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;
    const todayNotifs = notifications.filter(n => n.today).slice(0, 10);
    const historyNotifs = notifications.filter(n => !n.today).slice(0, 10);

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

    return (
        <div className="flex h-dvh">
            {/* Sidebar */}
             <SidebarDashboard menuItems={menuItems} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />

            {/* Main Content */}
            <main className="flex flex-col flex-1 items-start gap-2 p-2.5 w-full overflow-y-scroll">
                <div className="w-full flex justify-between items-center min-h-10">
                    {/* Mobile Overlay */}
                    {(isMobile || (!isMobile && !isSidebarOpen)) && (
                        <button onClick={toggleSidebar} className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer">
                            <PanelLeft className="w-6 h-6 text-gray-500" />
                        </button>
                    )}

                    {/* Notification icon */}
                    <div className="dropdown dropdown-end ml-auto">
                        <button tabIndex={0} className={`relative ${iconBtnClass} ml-auto`}>
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
                                                onClick={() => markRead(n.id)}
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
                                                onClick={() => markRead(n.id)}
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

                <div className="w-full flex-1 p-2">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;