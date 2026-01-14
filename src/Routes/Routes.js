import { createBrowserRouter } from "react-router";
import RootLayout from "../Layouts/RootLayout/RootLayout.jsx";
import Home from "../Pages/Home/Home.jsx";
import Login from "../Pages/Login/Login.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        Component:RootLayout,
        children:[
            {
                index:true,
                Component: Home
            },
            {
                path:"/",
                Component:Home
            },
            {
                path:"/login",
                Component:Login
            }
        ]
    },
]);