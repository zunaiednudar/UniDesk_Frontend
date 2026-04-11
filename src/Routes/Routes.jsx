import { createBrowserRouter, Navigate } from "react-router";
import RootLayout from "../Layouts/RootLayout/RootLayout.jsx";
import Home from "../Pages/Home/Home.jsx";
import Login from "../Pages/Login/Login.jsx";
import SignUp from "../Pages/SignUp/SignUp.jsx";
import Repository from "../Pages/Repository/Repository.jsx";
import NotFound from "../Pages/NotFound.jsx/NotFound.jsx";

import FacultyDashboardLayout from "../Layouts/FacultyDashboardLayout/FacultyDashboardLayout.jsx"
import StudentDashboard from "../Pages/StudentDashboard/StudentDashboard.jsx";
import MyActivity from "../Pages/StudentDashboard/MyActivity.jsx";
import MyCourses from "../Pages/StudentDashboard/MyCourses.jsx";
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
import Notification from "../Pages/Notification/Notification.jsx";
import CourseDetails from "../Components/Course/CourseDetails.jsx";
import FacultyCourseDetails from "../Pages/FacultyCourseDetails/FacultyCourseDetails.jsx";
import StudentProfile from "../Pages/Profile/StudentProfile.jsx";

import AdminDashboard from "../Pages/AdminDashboard/AdminDashboard.jsx";
import Overview from "../Pages/AdminDashboard/Overview.jsx";
import ManageUsers from "../Pages/AdminDashboard/ManageUsers.jsx";
import AdminRoute from "../Providers/RoleWiseRoutes/AdminRoute/AdminRoute.jsx";
import UserDetails from "../Components/User/UserDetails.jsx";
import ManageMentorship from "../Pages/AdminDashboard/ManageMentorship.jsx";
import FacultyDetails from "../Components/FacultyDetails/FacultyDetails.jsx";

import ChatPage from "../Pages/ChatPage.jsx/ChatPage.jsx";
import ConversationPage from "../Pages/ConversationPage/ConversationPage.jsx";
import {Activity} from "lucide-react";

export const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <PublicRoute>
                <RootLayout />
            </PublicRoute>
        ),
        children: [
            {
                index: true,
                Component: Home
            },
            {
                path: "home",
                Component: Home
            },
            {
                path: "login",
                Component: Login
            },
            {
                path: "signup",
                Component: SignUp
            },
            {
                path: "repository",
                Component: Repository
            },
        ]
    },
    {
        path: "/dashboard/student",
        element: (
            <StudentRoute>
                <StudentDashboard />
            </StudentRoute>
        ),
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
            {
                path: "ask-mentor",
                Component: AskMentor
            },
            {
                path: "profile",
                Component: StudentProfile
            },
            {
                path: "notifications",
                Component: Notification
            },
            {
                path: "courses/:id/details",
                Component: CourseDetails,
            },
            {
                path: ":id/repository",
                Component: Repository
            },
            {
                path:"chat",
                Component:ChatPage
            },
            {
                path:"chat/:id",
                Component:ConversationPage
            }
        ]
    },
    {
        path: "/dashboard/admin",
        element: (
            <AdminRoute>
                <AdminDashboard />
            </AdminRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="overview" replace />
            },
            {
                path: "overview",
                Component: Overview
            },
            {
                path: "users",
                Component: ManageUsers
            },
            {
                path: "mentorship",
                Component: ManageMentorship
            },
            {
                path: "notifications",
                Component: Notification
            },
            {
                path: "courses/:id/details",
                Component: CourseDetails
            },
            {
                path: "users/:email/details",
                Component: UserDetails
            },
            {
                path: "mentorship/faculties/:email/details",
                Component: FacultyDetails
            },
            {
                path: ":id/repository",
                Component: Repository
            }
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
                element:<Navigate to="activity"/>
            },
            {
                path:"activity",
                Component:FacultyDashboard
            },
            {
                path:"profile",
                Component:FacultyMyProfile
            },
            {
                path:"courses",
                Component:FacultyMyCourses
            },
            {
                path:"supervises",
                Component:FacultyMySupervises
            },
            {
                path:"appointments",
                Component:FacultyMyAppointments
            },
            {
                path:"schedule",
                Component:FacultyMySchedule
            },
            {
                path:"courses/:id",
                Component:FacultyCourseDetails
            },
            {
                path: ":id/repository",
                Component: Repository
            },
            {
                path:"chat",
                Component:ChatPage
            },
            {
                path:"chat/:id",
                Component:ConversationPage
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
]);
