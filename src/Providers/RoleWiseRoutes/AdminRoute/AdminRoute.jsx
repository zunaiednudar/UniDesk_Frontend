import React, { useContext } from 'react';
import Loading from '../../../Components/Loading/Loading';
import NotFound from '../../../Pages/NotFound.jsx/NotFound';
import { AuthContext } from '../../AuthProvider/AuthProvider.jsx';
import { Navigate } from 'react-router';

const AdminRoute = ({ children }) => {
    const { loading, user, userData } = useContext(AuthContext);

    if (loading || (user && !userData))
        return <Loading></Loading>;

    if (!user)
        return <Navigate to="/login" replace></Navigate>

    if (userData?.status === "pending")
        return <Navigate to="/pending-verification" replace />;

    if (userData?.status === "suspended")
        return <Navigate to="/suspended" replace />;

    if (userData?.role !== "admin")
        return <NotFound></NotFound>;

    return children;
};

export default AdminRoute;