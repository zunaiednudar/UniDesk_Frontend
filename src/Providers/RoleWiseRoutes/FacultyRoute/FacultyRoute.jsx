import React, { useContext } from 'react';
import { AuthContext } from '../../AuthProvider/AuthProvider.jsx';
import Loading from '../../../Components/Loading/Loading';
import NotFound from '../../../Pages/NotFound.jsx/NotFound';

const FacultyRoute = ({children}) => {
    const { loading, userData } = useContext(AuthContext);

    if (loading)
        return <Loading></Loading>;

    if (userData?.role !== "faculty")
        return <NotFound></NotFound>;

    return children;
};

export default FacultyRoute;