import React, {createContext, useState} from 'react';
import {auth} from "../Firebase/firebase.init.js";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword,signOut } from "firebase/auth";

export const AuthContext = createContext();

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

    // Authentication Data

    const authData={};

    return <AuthContext value={authData}>{children}</AuthContext>
};

export default AuthProvider;


