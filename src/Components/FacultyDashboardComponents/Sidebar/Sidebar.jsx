import { GraduationCap } from 'lucide-react';
import React from 'react';
import { CiCalendar } from 'react-icons/ci';
import { FaRegCircleUser } from 'react-icons/fa6';
import { MdOutlineCalendarMonth, MdOutlineDashboard, MdPeopleOutline } from 'react-icons/md';
import { PiBookOpenLight } from 'react-icons/pi';
import { NavLink } from 'react-router';

const Sidebar = () => {
    const menuItemStyle = "flex items-center gap-3 px-3 py-2 rounded-lg transition-all";

    const activeMenuItem = "bg-[#1E40AF] text-white";

    const inactiveMenuItem = "text-gray-900 hover:bg-[#1E40AF] hover:text-white";

    return (
        <div className="drawer-side shadow-2xl top-0 z-51 inter">
            <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
            {/* Sidebar content */}
            <ul className="menu flex flex-col gap-2 bg-white p-4 w-64 min-h-full">
                <li className='w-full flex flex-row items-center justify-between'>
                    <NavLink to="/dashboard/faculty" className='flex items-center gap-2'>
                        <div className='w-10 h-10 bg-[#1E40AF] rounded-lg flex justify-center items-center'>
                            <GraduationCap className='w-6 h-6 text-white' />
                        </div>
                        <span className='playfair text-xl font-extrabold'>UniDesk</span>
                    </NavLink>
                    <label
                        htmlFor="my-drawer-4"
                        className="btn btn-sm btn-circle btn-ghost lg:hidden"
                    >
                        ✕
                    </label>
                </li>
                <li className='mt-5 text-[18px] font-medium'>
                    <NavLink to="/dashboard/faculty/my-dashboard" className={({ isActive }) => `${menuItemStyle} ${isActive ? activeMenuItem : inactiveMenuItem
                        }`}><MdOutlineDashboard /> Dashboard</NavLink>
                </li>
                <li className='text-[18px] font-medium'>
                    <NavLink to="/dashboard/teacher/my-profile" className={({ isActive }) => `${menuItemStyle} ${isActive ? activeMenuItem : inactiveMenuItem
                        }`}><FaRegCircleUser /> My Profile</NavLink>
                </li>
                <li className='text-[18px] font-medium'>
                    <NavLink to="/dashboard/faculty/my-courses" className={({ isActive }) => `${menuItemStyle} ${isActive ? activeMenuItem : inactiveMenuItem
                        }`}><PiBookOpenLight /> My Courses</NavLink>
                </li>
                <li className='text-[18px] font-medium'>
                    <NavLink to="/dashboard/faculty/my-supervises" className={({ isActive }) => `${menuItemStyle} ${isActive ? activeMenuItem : inactiveMenuItem
                        }`}><MdPeopleOutline /> My Supervises</NavLink>
                </li>
                <li className='text-[18px] font-medium'>
                    <NavLink to="/dashboard/teacher/my-appointments" className={({ isActive }) => `${menuItemStyle} ${isActive ? activeMenuItem : inactiveMenuItem
                        }`}><CiCalendar /> My Appointments</NavLink>
                </li>
                <li className='text-[18px] font-medium'>
                    <NavLink to="/dashboard/teacher/my-dashboard" className={({ isActive }) => `${menuItemStyle} ${isActive ? activeMenuItem : inactiveMenuItem
                        }`}><MdOutlineCalendarMonth /> My Schedule</NavLink>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;