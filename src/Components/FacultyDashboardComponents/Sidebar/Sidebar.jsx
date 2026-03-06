import { GraduationCap } from 'lucide-react';
import React, { useRef } from 'react';
import { FaRegCircleUser } from 'react-icons/fa6';
import { HiOutlineBookOpen } from 'react-icons/hi';
import { IoLogOutOutline } from 'react-icons/io5';
import { MdOutlineCalendarMonth, MdOutlineCalendarToday, MdOutlineDashboard, MdPeopleOutline } from 'react-icons/md';
import { NavLink, useNavigate } from 'react-router';
import { toast } from 'sonner';

const Sidebar = ({ logout }) => {
    const navigate = useNavigate();
    const logoutRef = useRef(null);

    const menuItemStyle = "flex items-center gap-3 px-3 py-2 rounded-lg transition-all";

    const activeMenuItem = "bg-[#1E40AF] text-white";

    const inactiveMenuItem = "text-gray-900 hover:bg-[#1E40AF] hover:text-white";

    // Logout functions

    const handleOpenModal = () => logoutRef.current.showModal();
    const handleCloseModal = () => logoutRef.current.close();

    const handleLogout = () => {
        handleCloseModal();
        logout().then(() => {
            navigate("/", { replace: true });
            toast.success("Logged out successfully!");
        }).catch((error) => {
            toast.error(error.message);
            handleCloseModal();
        });

    };

    return (
        <div className="drawer-side shadow-2xl top-0 z-51 gilroy">
            <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
            {/* Sidebar content */}
            <ul className="menu flex flex-col gap-2 bg-white p-4 w-64 min-h-full">
                <li className='w-full flex flex-row items-center justify-between'>
                    <NavLink to="/dashboard/faculty" className='flex items-center gap-2'>
                        <div className='w-10 h-10 bg-[#1E40AF] rounded-lg flex justify-center items-center'>
                            <GraduationCap className='w-6 h-6 text-white' />
                        </div>
                        <span className='graphik text-xl font-extrabold'>UniDesk</span>
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
                    <NavLink to="/dashboard/faculty/my-profile" className={({ isActive }) => `${menuItemStyle} ${isActive ? activeMenuItem : inactiveMenuItem
                        }`}><FaRegCircleUser /> My Profile</NavLink>
                </li>
                <li className='text-[18px] font-medium'>
                    <NavLink to="/dashboard/faculty/my-courses" className={({ isActive }) => `${menuItemStyle} ${isActive ? activeMenuItem : inactiveMenuItem
                        }`}><HiOutlineBookOpen /> My Courses</NavLink>
                </li>
                <li className='text-[18px] font-medium'>
                    <NavLink to="/dashboard/faculty/my-supervises" className={({ isActive }) => `${menuItemStyle} ${isActive ? activeMenuItem : inactiveMenuItem
                        }`}><MdPeopleOutline /> My Supervises</NavLink>
                </li>
                <li className='text-[18px] font-medium'>
                    <NavLink to="/dashboard/faculty/my-appointments" className={({ isActive }) => `${menuItemStyle} ${isActive ? activeMenuItem : inactiveMenuItem
                        }`}><MdOutlineCalendarToday /> My Appointments</NavLink>
                </li>
                <li className='text-[18px] font-medium'>
                    <NavLink to="/dashboard/faculty/my-schedule" className={({ isActive }) => `${menuItemStyle} ${isActive ? activeMenuItem : inactiveMenuItem
                        }`}><MdOutlineCalendarMonth /> My Schedule</NavLink>
                </li>
                <li className='text-[18px] font-medium text-red-600 mt-auto'>
                    <button className='cursor-pointer' onClick={handleOpenModal}><IoLogOutOutline /> Logout</button>
                </li>
            </ul>

            {/* Modal for logout */}

            <dialog ref={logoutRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">

                    <h3 className="font-bold text-lg">Logout</h3>

                    <p className="py-4 text-gray-600">
                        Are you sure you want to logout from your account?
                    </p>

                    <div className="modal-action">

                        <button
                            onClick={handleLogout}
                            className="bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500"
                        >
                            Logout
                        </button>

                        <button
                            onClick={handleCloseModal}
                            className="btn"
                        >
                            Cancel
                        </button>

                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default Sidebar;