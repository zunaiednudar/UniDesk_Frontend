import React, { useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { Bell, PanelLeft } from "lucide-react";
import Sidebar from "../../Components/FacultyDashboardComponents/Sidebar/Sidebar";
import { AuthContext } from "../../Providers/AuthProvider/AuthProvider";

const FacultyDashboardLayout = () => {
  const { userData, logout } = useContext(AuthContext);

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

            <div className="ml-auto">
              <button className="hover:bg-gray-200 p-2 rounded-lg transition cursor-pointer">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

        <div className="w-full flex-1 p-2.5">
          <div className="w-full px-12">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboardLayout;
