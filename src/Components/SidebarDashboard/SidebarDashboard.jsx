import {NavLink, useLocation, useNavigate} from "react-router";
import React, { useContext } from "react";
import {
    Bell,
    GraduationCap,
    Moon,
    UserRound,
    PanelLeft,
    PanelRight,
    LayoutDashboard,
    LibraryBig,
    UserStar
} from "lucide-react";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";
import DefaultProfile from "../../assets/default-profile.png";
import {toast} from "sonner";

const SidebarDashboard = ({ menuItems, isSidebarOpen, setIsSidebarOpen, toggleSidebar, isMobile, role }) => {
    const { userData, logout } = useContext(AuthContext);

    const activeClass = "bg-gray-300 p-2 rounded-lg";
    const normalClass = "hover:bg-gray-200 p-2 rounded-lg transition";
    const iconBtnClass = "hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer";

    const location = useLocation();
    const isProfilePage = location.pathname.includes("profile");

    const navigate = useNavigate();

    const handleOpenModal = () => document.getElementById("logout_modal").showModal();
    const handleCloseModal = () => document.getElementById("logout_modal").close();

    const handleLogout = async () => {
        handleCloseModal();
        try {
            await logout();
            navigate("/", { replace: true });
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <>
            {/* Mobile backdrop */}
            {isMobile && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300
                            ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                />
            )}

            {/* Logout confirmation modal */}
            <dialog id="logout_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Log out</h3>
                    <p className="py-4 text-sm text-gray-500">Are you sure you want to log out of UniDesk?</p>

                    <div className="modal-action">
                        <button className="btn btn-ghost btn-sm" onClick={handleCloseModal}>Cancel</button>
                        <button className="btn btn-error btn-sm text-white" onClick={handleLogout}>Log out</button>
                    </div>
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            <aside className={`gilroy fixed lg:sticky top-0 flex flex-col justify-between z-41 h-screen bg-gray-100 transition-all duration-200 ease-in-out overflow-hidden
                    ${isSidebarOpen ? 'w-72 lg:w-96 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0'}`}>
                <div className="w-full flex items-center justify-between gap-4 border-b-2 border-gray-200 px-2">
                    {/* Logo */}
                    <NavLink to="/" className='flex items-center gap-2 px-2 py-3'>
                        <div className='w-9 h-9 bg-[#1E40AF] rounded-lg flex justify-center items-center'>
                            <GraduationCap className='w-6 h-6 text-white' />
                        </div>
                        <span className='graphik text-lg font-regular'>UniDesk</span>
                    </NavLink>

                    <button onClick={toggleSidebar} className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer">
                        {isSidebarOpen ? <PanelRight className="w-6 h-6 text-gray-500" /> : <PanelLeft className="w-6 h-6 text-gray-500" />}
                    </button>
                </div>

                <div className="grid grid-cols-[auto_1px_1fr] p-4 h-full overflow-y-auto">
                    <nav className="flex flex-col justify-between pr-4">
                        {/* Desktop Navigation */}
                        <div className="flex flex-col items-center gap-2">
                            <NavLink to={`/dashboard/${role}`} className={({ isActive }) => isActive ? activeClass : normalClass} end>
                                <LayoutDashboard className="w-5 h-5" />
                            </NavLink>

                            {userData && (
                                <NavLink to={`/dashboard/${role}/${userData._id}/repository`} className={({ isActive }) => isActive ? activeClass : normalClass}>
                                    <LibraryBig className="w-5 h-5" />
                                </NavLink>
                            )}
                        </div>

                        <div className="flex flex-col items-center">
                            <button className={iconBtnClass}><Moon className="w-5 h-5" /></button>
                            <div className="dropdown dropdown-top">
                                <button tabIndex={0} className={`${iconBtnClass} ${isProfilePage ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>
                                    {role === "admin" ? (
                                        <UserStar className="w-5 h-5" />
                                    ) : (
                                        <img
                                            src={userData?.photoURL || DefaultProfile}
                                            alt={userData?.name || "Profile"}
                                            className="w-5 h-5 rounded-full object-cover"
                                        />
                                    )}
                                </button>

                                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-60">
                                    <li className="px-2 py-1 text-sm font-semibold text-gray-700 pointer-events-none capitalize">
                                        {userData?.name.toLowerCase() ?? '...'}
                                    </li>
                                    <li className="px-2 pb-1 text-xs text-gray-400 pointer-events-none">
                                        {userData?.email ?? ''}
                                    </li>
                                    <div className="divider my-0" />
                                    {role !== "admin" && (
                                        <li><NavLink to="./profile" className={({ isActive }) => isActive ? activeClass : normalClass}>Settings</NavLink></li>
                                    )}
                                    <li><a className="p-2 cursor-pointer" onClick={handleOpenModal}>Logout</a></li>
                                </ul>
                            </div>
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
                                    ${isActive ? 'bg-gray-300 text-black font-semibold' : 'text-gray-500 hover:bg-gray-200 font-medium'}`}>
                                {menuItem.icon}
                                <span className="text-sm">{menuItem.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default SidebarDashboard;