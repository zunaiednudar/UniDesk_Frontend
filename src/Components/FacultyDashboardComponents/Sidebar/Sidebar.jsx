import { GraduationCap, LibraryBig, Moon, PanelLeft, PanelRight } from "lucide-react";
import React, { useRef } from "react";
import { HiOutlineBookOpen } from "react-icons/hi";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { MdOutlineCalendarMonth, MdOutlineCalendarToday, MdOutlineDashboard, MdPeopleOutline } from "react-icons/md";
import { FiActivity } from "react-icons/fi";
import { NavLink, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import DefaultProfile from "../../../assets/default-profile.png";

const Sidebar = ({ logout, userData, isSidebarOpen, setIsSidebarOpen, toggleSidebar, isMobile }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const logoutRef = useRef(null);

    const activeClass = "bg-gray-300 p-2 rounded-lg";
    const normalClass = "hover:bg-gray-200 p-2 rounded-lg transition";
    const iconBtnClass = "hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer";

    const isProfilePage = location.pathname.includes("profile");

    // Logout model opening function

    const handleOpenModal = () => logoutRef.current.showModal();

    // Logout model closing function

    const handleCloseModal = () => logoutRef.current.close();

    // Logout function

    const handleLogout = () => {
        handleCloseModal();
        logout()
            .then(() => {
                navigate("/", { replace: true });
                toast.success("Logged out successfully!");
            })
            .catch((error) => {
                toast.error(error.message);
            });
    };

    // Sidebar routes

    const routes = [
        {
            title: "Activity",
            route: "/dashboard/faculty/activity",
            logo: FiActivity
        },
        {
            title: "Courses",
            route: "/dashboard/faculty/courses",
            logo: HiOutlineBookOpen
        },
        {
            title: "Supervises",
            route: "/dashboard/faculty/supervises",
            logo: MdPeopleOutline
        },
        {
            title: "Appointments",
            route: "/dashboard/faculty/appointments",
            logo: MdOutlineCalendarToday
        },
        {
            title: "Schedule",
            route: "/dashboard/faculty/schedule",
            logo: MdOutlineCalendarMonth
        },
    ]

    return (
        <>
            {
                isMobile && (
                    <div
                        onClick={() => setIsSidebarOpen(false)}
                        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 
                            ${isSidebarOpen
                                ? "opacity-100 pointer-events-auto"
                                : "opacity-0 pointer-events-none"
                            }
                        `}
                    />
                )
            }

            <aside
                className={`gilroy fixed lg:sticky top-0 flex flex-col justify-between z-51 h-screen bg-gray-100 transition-all duration-200 ease-in-out overflow-hidden
                    ${isSidebarOpen
                        ? "w-72 lg:w-96 translate-x-0"
                        : "w-0 -translate-x-full lg:translate-x-0"
                    }`
                }
            >
                <div className="w-full h-[60px] flex items-center justify-between gap-4 border-b border-gray-200 px-2.5 shrink-0">
                    <NavLink to="/" className="flex items-center gap-2 px-2 py-3">
                        <div className="w-9 h-9 bg-[#1E40AF] rounded-lg flex justify-center items-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="graphik text-lg font-regular">UniDesk</span>
                    </NavLink>

                    <button
                        onClick={toggleSidebar}
                        className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                    >
                        {
                            isSidebarOpen ? (
                                <PanelRight className="w-6 h-6 text-gray-500" />
                            ) : (
                                <PanelLeft className="w-6 h-6 text-gray-500" />
                            )
                        }
                    </button>
                </div>

                <div className="grid grid-cols-[auto_1px_1fr] p-4 h-full overflow-y-auto">

                    {/* Navbar component */}

                    <nav className="flex flex-col justify-between pr-4">
                        <div className="flex flex-col items-center gap-2">
                            <NavLink
                                to="/dashboard/faculty/activity"
                                className={({ isActive }) => (isActive ? activeClass : normalClass)}
                                end
                            >
                                <MdOutlineDashboard className="w-5 h-5" />
                            </NavLink>

                            <NavLink
                                to="/dashboard/faculty/chat"
                                className={({ isActive }) => (isActive ? activeClass : normalClass)}
                            >
                                <IoChatboxEllipsesOutline  className="w-5 h-5" />
                            </NavLink>

                            <NavLink
                                to={`/dashboard/faculty/${userData._id}/repository`}
                                className={({ isActive }) => (isActive ? activeClass : normalClass)}
                            >
                                <LibraryBig className="w-5 h-5" />
                            </NavLink>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className={iconBtnClass}>
                                <label className="swap swap-rotate">
                                    <input type="checkbox" className="theme-controller" value="synthwave" />

                                    {/* sun icon */}
                                    <svg
                                        className="swap-off h-5 w-5 fill-current"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24">
                                        <path
                                            d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                                    </svg>

                                    {/* moon icon */}
                                    <svg
                                        className="swap-on h-5 w-5 fill-current"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24">
                                        <path
                                            d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                                    </svg>
                                </label>
                            </div>

                            <div className="dropdown dropdown-top">
                                <button
                                    tabIndex={0}
                                    className={`${iconBtnClass} ${isProfilePage ? "bg-gray-300" : "hover:bg-gray-200"
                                        }`}
                                >
                                    <img
                                        src={userData?.photoURL || DefaultProfile}
                                        alt={userData?.name || "Profile"}
                                        className="w-5 h-5 rounded-full object-cover"
                                    />
                                </button>

                                <ul
                                    tabIndex={0}
                                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-60"
                                >
                                    <li className="px-2 py-1 text-sm font-semibold text-gray-700 pointer-events-none capitalize">
                                        {userData?.name?.toLowerCase() ?? "..."}
                                    </li>
                                    <li className="px-2 pb-1 text-xs text-gray-400 pointer-events-none">
                                        {userData?.email ?? ""}
                                    </li>
                                    <div className="divider my-0" />
                                    <li>
                                        <NavLink to="/dashboard/faculty/profile">Settings</NavLink>
                                    </li>
                                    <li>
                                        <a className="cursor-pointer" onClick={handleOpenModal}>
                                            Logout
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>

                    <div className="w-px bg-gray-300"></div>

                    {/* Sidebar content */}

                    <nav className="pl-4 space-y-1">
                        {
                            routes.map(route =>
                                <NavLink
                                    to={route.route}
                                    className={({ isActive }) =>
                                        `w-full flex items-center gap-2 px-4 py-2 rounded-lg ${isActive
                                            ? "bg-gray-300 text-black font-semibold"
                                            : "text-gray-500 hover:bg-gray-200 font-medium"
                                        }`
                                    }
                                >
                                    <route.logo className="w-5 h-5" />
                                    <span className="text-sm">{route.title}</span>
                                </NavLink>
                            )
                        }
                    </nav>
                </div>
            </aside>

            {/* Logout modal */}

            <dialog ref={logoutRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Logout</h3>
                    <p className="py-4 text-sm text-gray-500">
                        Are you sure you want to logout from UniDesk?
                    </p>

                    <div className="modal-action">
                        <button className="btn btn-ghost btn-sm" onClick={handleCloseModal}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-error btn-sm text-white"
                            onClick={handleLogout}
                        >
                            Log out
                        </button>
                    </div>
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
};

export default Sidebar;
