import React from "react";
import {NavLink} from "react-router";
import {Bell,
    GraduationCap,
    Menu,
    MessageSquare,
    Moon,
    Settings,
    User,
    X
} from "lucide-react";

const NavbarDashboard = ({ isSidebarOpen, toggleSidebar }) => {
    return (
        <div className="sticky top-0 z-50 shadow-lg">
            <div className="w-full mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Button */}

                    <button onClick={toggleSidebar} className="lg:hidden hover:bg-gray-800 p-2 rounded-lg transition">
                        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Logo */}

                <NavLink to="/" className='flex items-center gap-2'>
                    <div className='w-10 h-10 bg-[#1E40AF] rounded-lg flex justify-center items-center'>
                        <GraduationCap className='w-6 h-6 text-white' />
                    </div>
                    <span className='playfair text-2xl font-extrabold'>UniDesk</span>
                </NavLink>

                {/* Desktop Navigation */}

                <div className="hidden md:flex items-center gap-6 ml-8">
                    <NavLink to="/dashboard" className={({ isActive }) => `text-xl font-semibold transition ${isActive ? 'text-[#1E40AF]' : 'text-black hover:text-[#1E40AF]'}`}>
                        Dashboard
                    </NavLink>

                    <NavLink to="/repository" className={({ isActive }) => `text-xl font-semibold transition ${isActive ? 'text-[#1E40AF]' : 'text-black hover:text-[#1E40AF]'}`}>
                        Repository
                    </NavLink>
                </div>

                {/* Right Side Icons */}

                <div className="flex items-center gap-2 md:gap-4">
                    <button className="relative hover:bg-gray-200 p-2 rounded-lg transition">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    <button className="hover:bg-gray-200 p-2 rounded-lg transition">
                        <MessageSquare className="w-5 h-5" />
                    </button>

                    <button className="hover:bg-gray-200 p-2 rounded-lg transition">
                        <Settings className="w-5 h-5" />
                    </button>

                    <button className="hover:bg-gray-200 p-2 rounded-lg transition">
                        <Moon className="w-5 h-5" />
                    </button>

                    <button className="hover:bg-gray-200 p-2 rounded-lg transition">
                        <User className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NavbarDashboard;