import React, { useContext } from 'react';
import { Outlet } from 'react-router';
import Navbar from '../../Components/FacultyDashboardComponents/Navbar/Navbar';
import Sidebar from '../../Components/FacultyDashboardComponents/Sidebar/Sidebar';
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider';

const FacultyDashboardLayout = () => {
    const {userData,logout}=useContext(AuthContext);
    console.log(userData);
    return (
        <div className="drawer lg:drawer-open bg-white">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col min-h-screen">
                {/* Navbar */}
                <Navbar userData={userData}></Navbar>
                <div className='p-6'>
                    <Outlet></Outlet>
                </div>
                
            </div>
            <Sidebar></Sidebar>
            
        </div>
    );
};

export default FacultyDashboardLayout;