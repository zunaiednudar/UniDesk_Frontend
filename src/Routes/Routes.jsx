import {createBrowserRouter, Navigate} from "react-router";
import RootLayout from "../Layouts/RootLayout/RootLayout.jsx";
import Home from "../Pages/Home/Home.jsx";
import Login from "../Pages/Login/Login.jsx";
import SignUp from "../Pages/SignUp/SignUp.jsx";
import Repository from "../Pages/Repository/Repository.jsx";
import NotFound from "../Pages/NotFound.jsx/NotFound.jsx";

import StudentDashboard from "../Pages/StudentDashboard/StudentDashboard.jsx";
import MyActivity from "../Pages/StudentDashboard/MyActivity.jsx";
import MyCourses from "../Pages/StudentDashboard/MyCourses.jsx";
import MyAssessments from "../Pages/StudentDashboard/MyAssessments.jsx";
import AskMentor from "../Pages/StudentDashboard/AskMentor.jsx";
import PublicRoute from "../Providers/PublicRoute/PublicRoute.jsx";
import StudentRoute from "../Providers/RoleWiseRoutes/StudentRoute/StudentRoute.jsx";
import StudentProfile from "../Pages/Profile/StudentProfile.jsx";
import Notification from "../Pages/Notification/Notification.jsx";
import CourseDetails from "../Components/Course/CourseDetails.jsx";

import AdminDashboard from "../Pages/AdminDashboard/AdminDashboard.jsx";
import Overview from "../Pages/AdminDashboard/Overview.jsx";
import ManageUsers from "../Pages/AdminDashboard/ManageUsers.jsx";
import AdminRoute from "../Providers/RoleWiseRoutes/AdminRoute/AdminRoute.jsx";
import UserDetails from "../Components/User/UserDetails.jsx";

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
                element: <Home />
            },
            {
                path: "home",
                element: <Home />
            },
            {
                path: "login",
                element: <Login />
            },
            {
                path: "signup",
                element: <SignUp />
            },
            {
                path: "repository",
                element: <Repository />
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
                element: <MyActivity />
            },
            {
                path: "courses",
                element: <MyCourses />
            },
            {
                path: "assessments",
                element: <MyAssessments />
            },
            {
                path: "ask-mentor",
                element: <AskMentor />
            },
            {
                path: "profile",
                element: <StudentProfile />
            },
            {
                path: "notifications",
                element: <Notification />
            },
            {
                path: "courses/:id/details",
                element: <CourseDetails />
            },
            {
                path: ":id/repository",
                element: <Repository />
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
                element: <Overview />
            },
            {
                path: "users",
                element: <ManageUsers />
            },
            {
                path: "users/:email/details",
                element: <UserDetails />
            },
            {
                path: ":id/repository",
                element: <Repository />
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    }
]);