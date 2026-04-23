import React, { useContext } from "react";
import { AuthContext } from "../../Providers/AuthProvider/AuthProvider.jsx";
import { useNavigate } from "react-router";

const Suspended = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
                <h1 className="text-3xl font-semibold mb-4">Account Suspended</h1>
                <p className="text-gray-600 mb-6">
                    You are suspended. Contact with admin to remove restriction.
                </p>

                <button onClick={handleLogout} className="btn bg-red-600 text-white">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Suspended;
