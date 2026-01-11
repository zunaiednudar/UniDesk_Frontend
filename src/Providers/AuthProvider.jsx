import React, {createContext, useState} from 'react';
import {auth} from "../Firebase/firebase.init.js";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword,signOut,GoogleAuthProvider,signInWithPopup } from "firebase/auth";

export const AuthContext = createContext();

const googleProvider=new GoogleAuthProvider();

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);

    // Sign Up

    const signUp = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    // Login

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    }

    const logout=()=>{
        return signOut(auth);
    }

    // Google Authentication

    const signInWithGoogle=async()=>{
        try{
            return await signInWithPopup(auth,googleProvider);
        } catch(error){
            throw error;
        }
    }

    // Authentication Data

    const authData={
        signUp,
        login,
        logout
    };

    return <AuthContext value={authData}>{children}</AuthContext>
};

export default AuthProvider;


