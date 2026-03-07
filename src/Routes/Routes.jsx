import { createBrowserRouter, Navigate } from "react-router";
import RootLayout from "../Layouts/RootLayout/RootLayout.jsx";
import Home from "../Pages/Home/Home.jsx";
import Login from "../Pages/Login/Login.jsx";
import SignUp from "../Pages/SignUp/SignUp.jsx";
import Repository from "../Pages/Repository/Repository.jsx";
import NotFound from "../Pages/NotFound.jsx/NotFound.jsx";

import DashboardLayout from "../Layouts/DashboardLayout/DashboardLayout.jsx";
import FacultyDashboardLayout from "../Layouts/FacultyDashboardLayout/FacultyDashboardLayout.jsx"
import StudentDashboard from "../Pages/StudentDashboard/StudentDashboard.jsx";
import MyActivity from "../Pages/StudentDashboard/MyActivity.jsx";
import MyCourses from "../Pages/StudentDashboard/MyCourses.jsx";
import MyProjects from "../Pages/StudentDashboard/MyProjects.jsx";
import MyAssessments from "../Pages/StudentDashboard/MyAssessments.jsx";
import AskMentor from "../Pages/StudentDashboard/AskMentor.jsx";
import PublicRoute from "../Providers/PublicRoute/PublicRoute.jsx";
import StudentRoute from "../Providers/RoleWiseRoutes/StudentRoute/StudentRoute.jsx";
import FacultyRoute from "../Providers/RoleWiseRoutes/FacultyRoute/FacultyRoute.jsx";
import FacultyDashboard from "../Pages/FacultyDashboard/FacultyDashboard.jsx";
import FacultyMyProfile from "../Pages/FacultyMyProfile/FacultyMyProfile.jsx";
import FacultyMyCourses from "../Pages/FacultyMyCourses/FacultyMyCourses.jsx";
import FacultyMySupervises from "../Pages/FacultyMySupervises/FacultyMySupervises.jsx";
import FacultyMyAppointments from "../Pages/FacultyMyAppointments/FacultyMyAppointments.jsx";
import FacultyMySchedule from "../Pages/FacultyMySchedule/FacultyMySchedule.jsx";
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
                path: "assessments",
                Component: MyAssessments
            },
            // {
            //     path: "projects",
            //     Component: MyProjects
            // },
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
        path:"/dashboard/faculty",
        element:<FacultyRoute>
            <FacultyDashboardLayout></FacultyDashboardLayout>
        </FacultyRoute>,
        children:[
            {
                index:true,
                element:<Navigate to="my-dashboard"/>
            },
            {
                path:"my-dashboard",
                Component:FacultyDashboard
            },
            {
                path:"my-profile",
                Component:FacultyMyProfile
            },
            {
                path:"my-courses",
                Component:FacultyMyCourses
            },
            {
                path:"my-supervises",
                Component:FacultyMySupervises
            },
            {
                path:"my-appointments",
                Component:FacultyMyAppointments
            },
            {
                path:"my-schedule",
                Component:FacultyMySchedule
            }
        ]
    },
    {
        path: "*",
        Component: NotFound
    }
]);