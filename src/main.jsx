import { createRoot } from 'react-dom/client'
import './index.css'
import {RouterProvider} from "react-router";
import {router} from "./Routes/Routes.js";
import AuthProvider from "./Providers/AuthProvider.jsx";

createRoot(document.getElementById('root')).render(
    <AuthProvider>
      <RouterProvider router={router}>
      </RouterProvider>
    </AuthProvider>

)
