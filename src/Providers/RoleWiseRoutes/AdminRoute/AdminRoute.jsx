import React, { useContext } from 'react';
import Loading from '../../../Components/Loading/Loading';
import NotFound from '../../../Pages/NotFound.jsx/NotFound';
import { AuthContext } from '../../AuthProvider/AuthProvider.jsx';

const AdminRoute = ({children}) => {
    const { loading, userData } = useContext(AuthContext);

    if (loading)
        return <Loading></Loading>;

    if (userData?.role !== "admin")
        return <NotFound></NotFound>;

    return children;
};

export default AdminRoute;