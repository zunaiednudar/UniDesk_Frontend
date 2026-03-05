import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import Footer from "../../Components/Footer/Footer.jsx";
import NavbarDashboard from "../../Components/NavbarDashboard/NavbarDashboard.jsx";
import SidebarDashboard from "../../Components/SidebarDashboard/SidebarDashboard.jsx";

const DashboardLayout = ({ menuItems, userRole = 'student' }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <>
            <div className="graphik text-xl min-h-screen bg-gray-50">
                {/* Top Navigation Bar */}

                <NavbarDashboard isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

                <div className="flex">
                    {/* Sidebar */}

                    {/* <SidebarDashboard menuItems={menuItems} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} toggleSidebar={toggleSidebar} /> */}

                    {/* Main Content */}

                    <main className="flex-1 p-8 w-full">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default DashboardLayout;