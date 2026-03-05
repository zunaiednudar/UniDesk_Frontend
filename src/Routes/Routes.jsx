import {createBrowserRouter, Navigate} from "react-router";
import RootLayout from "../Layouts/RootLayout/RootLayout.jsx";
import Home from "../Pages/Home/Home.jsx";
import Login from "../Pages/Login/Login.jsx";
import SignUp from "../Pages/SignUp/SignUp.jsx";
import Repository from "../Pages/Repository/Repository.jsx";
import NotFound from "../Pages/NotFound.jsx/NotFound.jsx";

import DashboardLayout from "../Layouts/DashboardLayout/DashboardLayout.jsx";
import StudentDashboard from "../Pages/StudentDashboard/StudentDashboard.jsx";
import MyActivity from "../Pages/StudentDashboard/MyActivity.jsx";
import MyCourses from "../Pages/StudentDashboard/MyCourses.jsx";
import MyProjects from "../Pages/StudentDashboard/MyProjects.jsx";
import MyAssignments from "../Pages/StudentDashboard/MyAssignments.jsx";
import AskMentor from "../Pages/StudentDashboard/AskMentor.jsx";
import PublicRoute from "../Providers/PublicRoute/PublicRoute.jsx";
import StudentRoute from "../Providers/RoleWiseRoutes/StudentRoute/StudentRoute.jsx";
import Profile from "../Pages/Profile/Profile.jsx";
import Notification from "../Pages/Notification/Notification.jsx";
import CourseDetails from "../Components/Course/CourseDetails.jsx";
import {Component} from "react";
import * as path from "node:path";

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
        Component: StudentDashboard,
        children: [
            {
                index: true,
                element: <Navigate to="activity" replace />
            },
            {
                path: "activity",
                Component: MyActivity
            },
            {
                path: "courses",
                Component: MyCourses
            },
            {
                path: "projects",
                Component: MyProjects
            },
            {
                path: "assignments",
                Component: MyAssignments
            },
            {
                path: "ask-mentor",
                Component: AskMentor
            },
            {
                path: "profile",
                Component: Profile
            },
            {
                path: "notifications",
                Component: Notification
            },
            {
                path: "courses/:id/details",
                Component: CourseDetails
            },
        ]
    },
    {
        path: "*",
        Component: NotFound
    }
]);