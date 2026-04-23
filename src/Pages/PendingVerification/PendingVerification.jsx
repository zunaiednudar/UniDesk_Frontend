import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../Providers/AuthProvider/AuthProvider.jsx";
import axiosSecure from "../../utils/axiosSecure.js";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const PendingVerification = () => {
    const { logout, setUserData, sendVerificationEmailToUser, reloadCurrentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const hasSentVerification = useRef(false);
    const isVerifying = useRef(false);

    // After login verification mail sending
    
    useEffect(() => {
        const sendInitialVerification = async () => {
            const alreadySent = sessionStorage.getItem("pending-verification-mail-sent");

            if (alreadySent || hasSentVerification.current)
                return;

            hasSentVerification.current = true;

            try {
                sessionStorage.setItem("pending-verification-mail-sent", "true");
                await sendVerificationEmailToUser();
                toast.success("Verification email sent to your email.");
            } catch (error) {
                hasSentVerification.current = false;
                sessionStorage.removeItem("pending-verification-mail-sent");
                toast.error(error.message);
            }
        };

        sendInitialVerification();
    }, [sendVerificationEmailToUser]);

    // To check verified or not

    useEffect(() => {
        const interval = setInterval(async () => {
            if (isVerifying.current)
                return;

            try {
                const currentUser = await reloadCurrentUser();

                if (!currentUser?.emailVerified)
                    return;

                isVerifying.current = true;

                const freshToken = await currentUser.getIdToken(true);
                localStorage.setItem("access-token", freshToken);

                await axiosSecure.patch("/users/account-status/verify");
                const statusRes = await axiosSecure.get("/users/account-status");

                const account = statusRes.data.user;
                setUserData(account);

                sessionStorage.removeItem("pending-verification-mail-sent");
                toast.success("Account verified successfully");

                if (account.role === "student")
                    navigate("/dashboard/student", { replace: true });
                else if (account.role === "faculty")
                    navigate("/dashboard/faculty", { replace: true });
                else
                    navigate("/dashboard/admin", { replace: true });
            } catch (error) {
                isVerifying.current = false;
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [reloadCurrentUser, setUserData, navigate]);

    const handleResend = async () => {
        try {
            sessionStorage.setItem("pending-verification-mail-sent", "true");
            await sendVerificationEmailToUser();
            toast.success("Verification email sent. Check your inbox");
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleLogout = async () => {
        sessionStorage.removeItem("pending-verification-mail-sent");
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 gilroy">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 text-center">
                <p className="text-3xl font-semibold mb-4">Verify Your Email</p>
                <p className="text-gray-600 mb-6">
                    Verification email sent to your email. Please verify your account to continue.
                </p>

                <div className="flex flex-col gap-3">
                    <button onClick={handleResend} className="btn bg-[#1E40AF] text-white hover:bg-blue-600">
                        Resend Verification Email
                    </button>
                    <button onClick={handleLogout} className="btn btn-error text-white">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingVerification;
