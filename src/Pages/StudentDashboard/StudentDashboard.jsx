import React, { useContext } from 'react';
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider';

const StudentDashboard = () => {
    const {user}=useContext(AuthContext);
    return (
        <div>
        </div>
    );
};

export default StudentDashboard;
