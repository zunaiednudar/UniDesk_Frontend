import { createBrowserRouter } from "react-router";
import RootLayout from "../Layouts/RootLayout/RootLayout.jsx";
import Home from "../Pages/Home/Home.jsx";
import Login from "../Pages/Login/Login.jsx";
import SignUp from "../Pages/SignUp/SignUp.jsx";
import Repository from "../Pages/Repository/Repository.jsx";
import NotFound from "../Pages/NotFound.jsx/NotFound.jsx";

import DashboardLayout from "../Layouts/DashboardLayout/DashboardLayout.jsx";
import StudentDashboard from "../Pages/StudentDashboard/StudentDashboard.jsx";
import MyActivity from "../Pages/StudentDashboard/MyActivity.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: RootLayout,
        children:[
            {
                index: true,
                Component: Home
            },
            {
                path: "/home",
                Component: Home
            },
            {
                path: "/login",
                Component: Login
            },
            {
                path: "/signup",
                Component: SignUp
            },
            {
                path: "/repository",
                Component: Repository
            },
        ]
    },
    {
        path: "/dashboard/student",
        Component: StudentDashboard,
        children: [
            {
                index: true,
                Component: MyActivity
            },
            {
                path: "activity",
                Component: MyActivity
            }
        ]
    },
    {
        path:"*",
        Component:NotFound
    }
]);