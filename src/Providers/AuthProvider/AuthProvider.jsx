import React, { createContext, useEffect, useState } from 'react';
import { auth } from "../../Firebase/firebase.init.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, updateProfile, onAuthStateChanged, sendPasswordResetEmail, deleteUser, sendEmailVerification } from "firebase/auth";
import { fetchUserData } from '../../utils/fetchUserData.js';
import socket from '../../utils/socket.js';
import { fetchAccountStatus } from '../../utils/fetchAccountStatus.js';

export const AuthContext = createContext();

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [userData, setUserData] = useState(null);

    // Sign Up

    const signUp = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // Login

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        socket.disconnect();
        return signOut(auth);
    };

    // Google Authentication

    const signInWithGoogle = async () => {
        try {
            return await signInWithPopup(auth, googleProvider);
        } catch (error) {
            if (error.code === "auth/popup-closed-by-user") {
                setLoading(false);
                return null;
            }
            setLoading(false);
            throw error;
        }
    };

    // Update Users Profile

    const updateUser = (updatedData) => {
        return updateProfile(auth.currentUser, updatedData);
    };

    // Password Reset

    const passwordReset = (email) => {
        return sendPasswordResetEmail(auth, email);
    }

    // Email verification

    const sendVerificationEmailToUser = async (targetUser = auth.currentUser) => {
        if (!targetUser)
            throw new Error("No authenticated user found");

        return sendEmailVerification(targetUser);
    };

    const reloadCurrentUser = async () => {
        if (!auth.currentUser)
            throw new Error("No authenticated user found");

        await auth.currentUser.reload();
        return auth.currentUser;
    };


    // Delete user

    const removeUser = () => {
        return deleteUser(auth.currentUser);
    }

    // Users Data

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (!currentUser) {
                setUserData(null);
                setToken(null);
                localStorage.removeItem("access-token");
                setLoading(false);
                return;
            }

            if (currentUser) {
                const idToken = await currentUser.getIdToken();
                setToken(idToken);
                localStorage.setItem("access-token", idToken);

                const accountData = await fetchAccountStatus();
                setUserData(accountData);

                // const res = await fetchUserData(currentUser);
                // setUserData(res);
            }
            else {
                setUserData(null);
                setToken(null);
                localStorage.removeItem("access-token");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Socket io

    useEffect(() => {
        if (!userData?._id)
            return;

        const joinRoom = () => {
            socket.emit("join", userData._id.toString());
        };

        if (!socket.connected)
            socket.connect();
        if (socket.connected)
            joinRoom();

        socket.on("connect", joinRoom);

        return () => socket.off("connect", joinRoom);

    }, [userData?._id]);


    // Authentication Data

    const authData = {
        signUp,
        login,
        logout,
        signInWithGoogle,
        updateUser,
        user,
        setUser,
        loading,
        setLoading,
        passwordReset,
        removeUser,
        token,
        userData,
        setUserData,
        sendVerificationEmailToUser,
        reloadCurrentUser,
    };

    return <AuthContext value={authData}>{children}</AuthContext>
};

export default AuthProvider;


