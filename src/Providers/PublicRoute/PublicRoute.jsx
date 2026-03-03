import React, { useContext } from 'react';
import { AuthContext } from '../AuthProvider/AuthProvider.jsx';
import Loading from '../../Components/Loading/Loading.jsx';
import { Navigate } from 'react-router';

const PublicRoute = ({ children }) => {
    const { user, loading, userData } = useContext(AuthContext);

    if (loading || (user && !userData))
        return <Loading></Loading>;

    if (user && user.email) {
        if (userData?.role === "student")
            return <Navigate to="/dashboard/student" replace></Navigate>;
        if (userData?.role === "faculty")
            return <Navigate to="/dashboard/faculty" replace></Navigate>;
        if (userData?.role === "admin")
            return <Navigate to="/dashboard/admin" replace></Navigate>;
    }
    return children;
};

export default PublicRoute;