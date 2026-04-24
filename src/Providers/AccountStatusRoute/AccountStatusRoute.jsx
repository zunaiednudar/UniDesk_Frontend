import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../AuthProvider/AuthProvider.jsx";
import Loading from "../../Components/Loading/Loading.jsx";

const AccountStatusRoute = ({ children, allowedStatus }) => {
    const { user, userData, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading || (user && !userData))
        return <Loading />;

    if (!user)
        return <Navigate to="/login" state={{ from: location }} replace />;

    if (!userData)
        return <Navigate to="/login" replace />;

    if (userData.status === "verified") {
        if (userData.role === "student")
            return <Navigate to="/dashboard/student" replace />;
        if (userData.role === "faculty")
            return <Navigate to="/dashboard/faculty" replace />;
        if (userData.role === "admin")
            return <Navigate to="/dashboard/admin" replace />;
    }

    if (userData.status !== allowedStatus)
        return <Navigate to="/login" replace />;

    return children;
};

export default AccountStatusRoute;
