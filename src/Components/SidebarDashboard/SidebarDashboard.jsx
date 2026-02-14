import { NavLink } from "react-router";
import React from "react";

const SidebarDashboard = ({ menuItems, isSidebarOpen, setIsSidebarOpen, toggleSidebar }) => {
    return (
        <>
            <aside className={`fixed lg:sticky top-[73px] h-[calc(100vh-73px)] z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out 
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-6">
                    <nav className="space-y-2">
                        {menuItems.map((menuItem) => (
                            <NavLink
                                key={menuItem.id}
                                to={menuItem.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition
                                        ${isActive ? 'bg-blue-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                                {menuItem.icon}
                                <span className="font-semibold">{menuItem.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={toggleSidebar} />
            )}
        </>
    );
};

export default SidebarDashboard;