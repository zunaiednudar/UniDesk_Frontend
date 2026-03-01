import React, { useContext } from 'react';
import { AuthContext } from '../../AuthProvider/AuthProvider.jsx';
import Loading from '../../../Components/Loading/Loading';
import NotFound from '../../../Pages/NotFound.jsx/NotFound';

const StudentRoute = ({ children }) => {
    const { loading, userData } = useContext(AuthContext);

    if (loading)
        return <Loading></Loading>;

    if (userData?.role !== "student")
        return <NotFound></NotFound>;

    return children;
};

export default StudentRoute;