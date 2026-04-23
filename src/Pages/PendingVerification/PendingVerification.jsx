import React, { useContext, useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../Firebase/firebase.init.js";
import { AuthContext } from "../../Providers/AuthProvider/AuthProvider.jsx";
import axiosSecure from "../../utils/axiosSecure.js";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const PendingVerification = () => {
    const { logout, setUserData } = useContext(AuthContext);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleResend = async () => {
        try {
            if (!auth.currentUser) {
                toast.error("No authenticated user found");
                return;
            }

            await sendEmailVerification(auth.currentUser);
            toast.success("Verification email sent. Check your inbox");
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleVerified = async () => {
        try {
            setSubmitting(true);

            if (!auth.currentUser) {
                toast.error("No authenticated user found");
                return;
            }

            await auth.currentUser.reload();

            if (!auth.currentUser.emailVerified) {
                toast.error("Email is not verified yet");
                return;
            }

            const freshToken = await auth.currentUser.getIdToken(true);
            localStorage.setItem("access-token", freshToken);

            await axiosSecure.patch("/users/account-status/verify");
            const statusRes = await axiosSecure.get("/users/account-status");

            const account = statusRes.data.user;
            setUserData(account);

            toast.success("Account verified successfully");

            if (account.role === "student")
                navigate("/dashboard/student", { replace: true });
            else if (account.role === "faculty")
                navigate("/dashboard/faculty", { replace: true });
            else
                navigate("/dashboard/admin", { replace: true });

        } catch (error) {
            toast.error(error.response?.data?.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
                <p className="text-3xl font-semibold mb-4">Verify Your Email</p>
                <p className="text-gray-600 mb-6">
                    Verification email sent to your email. Please verify your account to continue.
                </p>

                <div className="flex flex-col gap-3">
                    <button onClick={handleResend} className="btn bg-blue-700 text-white">
                        Resend Verification Email
                    </button>

                    <button
                        onClick={handleVerified}
                        disabled={submitting}
                        className="btn bg-green-600 text-white"
                    >
                        {submitting ? "Checking..." : "I Have Verified"}
                    </button>

                    <button onClick={handleLogout} className="btn">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingVerification;
