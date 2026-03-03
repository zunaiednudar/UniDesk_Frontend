import { NavLink } from "react-router";
import React, {useContext, useEffect} from "react";
import { Bell, GraduationCap, Moon, UserRound, PanelLeft, PanelRight, LogOut, LayoutDashboard, LibraryBig } from "lucide-react";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";

const SidebarDashboard = ({ menuItems, isSidebarOpen, setIsSidebarOpen, toggleSidebar, isMobile }) => {
    const { userData } = useContext(AuthContext);

    const activeClass = "bg-gray-300 p-2 rounded-lg";
    const normalClass = "hover:bg-gray-200 p-2 rounded-lg transition";
    const iconBtnClass = "hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer";

    return (
        <aside className={`gilroy fixed lg:sticky top-0 flex flex-col justify-between z-40 w-72 lg:w-96 h-screen bg-gray-100 transition duration-300 ease-in-out 
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full hidden'}`}>
            <div className="w-full flex items-center justify-between gap-4 border-b-2 border-gray-200 px-2">
                {/* Logo */}
                <NavLink to="/" className='flex items-center gap-2 px-2 py-3'>
                    <div className='w-9 h-9 bg-[#1E40AF] rounded-lg flex justify-center items-center'>
                        <GraduationCap className='w-6 h-6 text-white' />
                    </div>
                    <span className='graphik text-lg font-medium'>UniDesk</span>
                </NavLink>

                <button onClick={toggleSidebar} className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer">
                    {isSidebarOpen ? <PanelRight className="w-6 h-6 text-gray-500" /> : <PanelLeft className="w-6 h-6 text-gray-500" />}
                </button>
            </div>

            <div className="grid grid-cols-[auto_1px_1fr] p-4 h-full overflow-y-auto">
                <nav className="flex flex-col justify-between pr-4">
                    {/* Desktop Navigation */}
                    <div className="flex flex-col items-center gap-2">
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? activeClass : normalClass}>
                            <LayoutDashboard className="w-5 h-5" />
                        </NavLink>
                        <NavLink to="/repository" className={({ isActive }) => isActive ? activeClass : normalClass}>
                            <LibraryBig className="w-5 h-5" />
                        </NavLink>
                    </div>

                    <div className="flex flex-col items-center">
                        <button className={`relative ${iconBtnClass}`}>
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <button className={iconBtnClass}><Moon className="w-5 h-5" /></button>
                        <div className="dropdown dropdown-top">
                            <button tabIndex={0} className={iconBtnClass}><UserRound className="w-5 h-5" /></button>

                            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48">
                                <li className="px-2 py-1 text-sm font-semibold text-gray-700 pointer-events-none capitalize">
                                    {userData?.name.toLowerCase() ?? '...'}
                                </li>
                                <li className="px-2 pb-1 text-xs text-gray-400 pointer-events-none">
                                    {userData?.email ?? ''}
                                </li>
                                <div className="divider my-0" />
                                <li><a>Settings</a></li>
                                <li><a>Switch account</a></li>
                            </ul>
                        </div>
                        <button className={iconBtnClass}><LogOut className="w-5 h-5" /></button>
                    </div>
                </nav>

                <div className="w-px bg-gray-300"></div>

                <nav className="pl-4 space-y-1">
                    {menuItems.map((menuItem) => (
                        <NavLink
                            key={menuItem.id}
                            to={menuItem.path}
                            onClick={() => { if (isMobile) setIsSidebarOpen(false); }}
                            className={({ isActive }) => `w-full flex items-center gap-2 px-4 py-2 rounded-lg
                                    ${isActive ? 'bg-gray-300 text-black font-semibold' : 'text-gray-500 hover:bg-gray-100 font-medium'}`}>
                            {menuItem.icon}
                            <span className="text-sm">{menuItem.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default SidebarDashboard;