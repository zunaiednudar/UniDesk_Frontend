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
import Users from "../Pages/AdminDashboard/Users.jsx";
import AdminRoute from "../Providers/RoleWiseRoutes/AdminRoute/AdminRoute.jsx";
import AdminProfile from "../Pages/Profile/AdminProfile.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <PublicRoute>
            <RootLayout></RootLayout>
        </PublicRoute>,
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
                element: <PublicRoute>
                    <Repository></Repository>
                </PublicRoute>
            },
        ]
    },
    {
        path: "/dashboard/student",
        element: <StudentRoute>
            <StudentDashboard></StudentDashboard>
        </StudentRoute>,
        children: [
            {
                index: true,
                element: <Navigate to="activity" replace />
            },
            {
                path: "activity",
                element: <StudentRoute>
                    <MyActivity></MyActivity>
                </StudentRoute>
            },
            {
                path: "courses",
                element: <StudentRoute>
                    <MyCourses></MyCourses>
                </StudentRoute>
            },
            {
                path: "assessments",
                element: <StudentRoute>
                    <MyAssessments></MyAssessments>
                </StudentRoute>
            },
            {
                path: "ask-mentor",
                element: <StudentRoute>
                    <AskMentor></AskMentor>
                </StudentRoute>
            },
            {
                path: "profile",
                element: <StudentRoute>
                    <StudentProfile></StudentProfile>
                </StudentRoute>
            },
            {
                path: "notifications",
                element: <StudentRoute>
                    <Notification></Notification>
                </StudentRoute>
            },
            {
                path: "courses/:id/details",
                element: <StudentRoute>
                    <CourseDetails></CourseDetails>
                </StudentRoute>
            },
            {
                path: ":id/repository",
                element: <StudentRoute>
                    <Repository></Repository>
                </StudentRoute>
            }
        ]
    },
    {
        path: "/dashboard/admin",
        element: <AdminRoute>
            <AdminDashboard></AdminDashboard>
        </AdminRoute>,
        children: [
            {
                index: true,
                element: <Navigate to="overview" replace />
            },
            {
                path: "overview",
                element: <AdminRoute>
                    <Overview></Overview>
                </AdminRoute>
            },
            {
                path: "users",
                element: <AdminRoute>
                    <Users></Users>
                </AdminRoute>
            },
            {
                path: "profile",
                element: <AdminRoute>
                    <AdminProfile></AdminProfile>
                </AdminRoute>
            },
            {
                path: ":id/repository",
                element: <AdminRoute>
                    <Repository></Repository>
                </AdminRoute>
            }
        ]
    },
    {
        path: "*",
        element: <PublicRoute>
            <NotFound></NotFound>
        </PublicRoute>
    }
]);