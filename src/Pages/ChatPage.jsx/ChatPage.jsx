import React, { useContext, useState } from 'react'
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider.jsx'

const ChatPage = () => {
    const {userData}=useContext(AuthContext);
    console.log(userData);
    
    return (
        <div>ChatPage</div>
    )
}

export default ChatPage