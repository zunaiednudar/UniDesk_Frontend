import React, {useEffect, useState} from 'react';
import { NavLink, Outlet } from 'react-router';
import Footer from "../../Components/Footer/Footer.jsx";
import NavbarDashboard from "../../Components/NavbarDashboard/NavbarDashboard.jsx";
import SidebarDashboard from "../../Components/SidebarDashboard/SidebarDashboard.jsx";
import { PanelLeft } from "lucide-react";

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

    return (
        <div className="flex h-dvh">
            {/* Sidebar */}
             <SidebarDashboard menuItems={menuItems} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />

            {/* Main Content */}
            <main className="flex flex-col md:flex-row flex-1 items-start gap-2 p-2.5 w-full overflow-y-scroll">
                {/* Mobile Overlay */}
                {(isMobile || (!isMobile && !isSidebarOpen)) && (
                    <button onClick={toggleSidebar} className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer">
                        <PanelLeft className="w-6 h-6 text-gray-500" />
                    </button>
                )}

                <div className="md:flex-1 p-2 md:p-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;