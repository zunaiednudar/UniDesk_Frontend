import { createBrowserRouter } from "react-router";
import RootLayout from "../Layouts/RootLayout/RootLayout.jsx";
import Home from "../Pages/Home/Home.jsx";
import Login from "../Pages/Login/Login.jsx";
import SignUp from "../Pages/SignUp/SignUp.jsx";
import Repository from "../Pages/Repository/Repository.jsx";
import NotFound from "../Pages/NotFound.jsx/NotFound.jsx";

import DashboardLayout from "../Layouts/DashboardLayout/DashboardLayout.jsx";
import StudentDashboard from "../Pages/StudentDashboard/StudentDashboard.jsx";
import PublicRoute from "../Providers/PublicRoute/PublicRoute.jsx";
import StudentRoute from "../Providers/RoleWiseRoutes/StudentRoute/StudentRoute.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: RootLayout,
        children: [
            {
                index: true,
                element: <PublicRoute>
                    <Home></Home>
                </PublicRoute>
            },
            {
                path: "/home",
                element: <PublicRoute>
                    <Home></Home>
                </PublicRoute>
            },
            {
                path: "/login",
                element: <PublicRoute>
                    <Login></Login>
                </PublicRoute>
            },
            {
                path: "/signup",
                element: <PublicRoute>
                    <SignUp></SignUp>
                </PublicRoute>
            },
            {
                path: "/repository",
                Component: Repository
            },
        ]
    },
    {
        path: "/dashboard/student",
        element:<StudentRoute>
            <DashboardLayout></DashboardLayout>
        </StudentRoute>,
        children: [
            {
                index:true,
                Component:StudentDashboard
            },
            {
                path:"my-activity",
                Component:StudentDashboard
            }
        ]
    },
    {
        path: "*",
        Component: NotFound
    }
]);