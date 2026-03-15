import React, { useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { Bell, Check, PanelLeft } from "lucide-react";
import Sidebar from "../../Components/FacultyDashboardComponents/Sidebar/Sidebar";
import { AuthContext } from "../../Providers/AuthProvider/AuthProvider";
import { useNotifications } from "../../utils/hooks/useNotifications.js";
import useNotificationClick from "../../utils/hooks/useNotificationClick.js";

const FacultyDashboardLayout = () => {
  const { userData, logout } = useContext(AuthContext);
  const { notifications, unreadCount, todayNotifs, historyNotifs, markAllRead, markRead } = useNotifications();

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
    };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Path filtering and organizing

  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const filteredSegments = pathSegments.filter(
    (segment) =>
      segment !== "faculty" &&
      segment !== "dashboard" &&
      !/^[a-f\d]{24}$/i.test(segment)
  );

  const formattedSegments = filteredSegments.map((segment) =>
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );

  const formattedPath = ["Dashboard", ...formattedSegments].join(" / ");

  const iconBtnClass = "hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer";

  const isNotificationsPage = location.pathname.includes("notifications");

  const handleNotificationClick = useNotificationClick(markRead);

  return (
    <div className="gilroy flex h-dvh bg-white">
      <Sidebar
        logout={logout}
        userData={userData}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      <main className="flex flex-col flex-1 gap-2 w-full overflow-y-auto">
        <div className="sticky top-0 z-50 w-full bg-white shrink-0">
          <div className="w-full flex justify-between items-center h-[60px] px-2 border-b border-gray-200 box-border">
            <div className="flex items-center">
              {
                (isMobile || (!isMobile && !isSidebarOpen)) && (
                  <button
                    onClick={toggleSidebar}
                    className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer"
                  >
                    <PanelLeft className="w-6 h-6 text-gray-500" />
                  </button>
                )
              }

              <span
                className={`pb-0.5 pl-2 graphik text-gray-500 text-md capitalize ${isSidebarOpen ? "ml-10" : ""
                  }`}
              >
                {formattedPath}
              </span>
            </div>

            <div className="dropdown dropdown-end ml-auto">
              <button tabIndex={0} className={`relative ${iconBtnClass} ml-auto ${isNotificationsPage ? 'bg-gray-300' : 'hover:bg-gray-200'}`}>
                <Bell className="w-5 h-5" />

                {
                  unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )
                }
              </button>

              <div tabIndex={0} className="dropdown-content z-50 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                {/* Header */}

                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-800">Notifications</span>
                  {
                    unreadCount > 0 && (
                      <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition font-medium cursor-pointer">
                        <Check className="w-3 h-3" />
                        Mark all read
                      </button>
                    )
                  }
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {/* Today */}

                  {
                    todayNotifs.length > 0 && (
                      <>
                        <div className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                          Today
                        </div>
                        {
                          todayNotifs.map(n => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 cursor-pointer ${!n.read ? 'bg-blue-50/50' : ''}`}>
                              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold truncate ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                                <p className="text-xs text-gray-400 truncate">{n.message}</p>
                              </div>
                              <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{n.time}</span>
                            </div>
                          )
                          )
                        }
                      </>
                    )
                  }

                  {/* History */}

                  {
                    historyNotifs.length > 0 && (
                      <>
                        <div className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                          History
                        </div>
                        {
                          historyNotifs.map(n => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold truncate ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                                <p className="text-xs text-gray-400 truncate">{n.message}</p>
                              </div>
                              <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">{n.time}</span>
                            </div>
                          )
                          )
                        }
                      </>
                    )
                  }

                  {
                    notifications.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <Bell className="w-8 h-8 mb-2 opacity-30" />
                        <p className="text-xs">No notifications yet</p>
                      </div>
                    )
                  }
                </div>

                {/* Footer */}

                <div className="border-t border-gray-100 px-4 py-3">
                  <NavLink
                    to="./notifications"
                    className="w-full text-xs font-semibold text-blue-600 hover:text-blue-800 transition text-center">
                    See all notifications
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="w-full flex-1 p-2.5">
          <div className="w-full px-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboardLayout;
