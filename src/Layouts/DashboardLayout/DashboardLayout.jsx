import React, {useEffect, useState} from 'react';
import { NavLink, Outlet } from 'react-router';
import Footer from "../../Components/Footer/Footer.jsx";
import NavbarDashboard from "../../Components/NavbarDashboard/NavbarDashboard.jsx";
import SidebarDashboard from "../../Components/SidebarDashboard/SidebarDashboard.jsx";
import {Bell, PanelLeft } from "lucide-react";

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
                    <button className={`relative ${iconBtnClass} ml-auto`}>
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                </div>

                <div className="w-full flex-1 p-2">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;