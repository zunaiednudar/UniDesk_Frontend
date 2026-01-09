import React, {createContext, useState} from 'react';
import {auth} from "../Firebase/firebase.init.js";
import {createUserWithEmailAndPassword} from "firebase/auth";

export const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);

    // Sign Up

    const signUp = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    }
};

export default AuthProvider;


