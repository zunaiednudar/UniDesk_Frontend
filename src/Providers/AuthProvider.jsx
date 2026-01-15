import React, {createContext, useEffect, useState} from 'react';
import {auth} from "../Firebase/firebase.init.js";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword,signOut,GoogleAuthProvider,signInWithPopup,updateProfile,onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";

export const AuthContext = createContext();

const googleProvider=new GoogleAuthProvider();

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading,setLoading]=useState(false);

    // Sign Up

    const signUp = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // Login

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout=()=>{
        return signOut(auth);
    };

    // Google Authentication

    const signInWithGoogle=async ()=>{
        setLoading(true);
        try{
            return await signInWithPopup(auth,googleProvider);
        }catch(error){
            if (error.code === "auth/popup-closed-by-user") {
                setLoading(false);
                return null;
            }
            setLoading(false);
            throw error;
        }  
    };

    // Update User Profile

    const updateUser=(updatedData)=>{
        return updateProfile(auth.currentUser,updatedData);
    };

    // Password Reset

    const passwordReset=(email)=>{
        return sendPasswordResetEmail(auth,email);
    }

    // User Data

    useEffect(() => {
        const unsubscribe=onAuthStateChanged(auth,async (currentUser)=>{
            setUser(currentUser);
        });
        return ()=>unsubscribe();
    }, []);


    // Authentication Data

    const authData={
        signUp,
        login,
        logout,
        signInWithGoogle,
        updateUser,
        user,
        setUser,
        loading,
        setLoading,
        passwordReset
    };

    return <AuthContext value={authData}>{children}</AuthContext>
};

export default AuthProvider;


