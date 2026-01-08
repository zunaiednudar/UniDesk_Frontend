import { createBrowserRouter } from "react-router";
import RootLayout from "../Layouts/RootLayout/RootLayout.jsx";
import Home from "../Pages/Home/Home.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        Component:RootLayout,
        children:[
            {
                index:true,
                Component: Home
            }
        ]
    },
]);