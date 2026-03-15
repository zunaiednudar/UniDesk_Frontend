import React, { useContext } from 'react';
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider.jsx';
import { useNavigate } from 'react-router';
import { getNotificationRedirectURL } from '../getNotificationRedirectURL.js';

export const useNotificationClick = (markRead) => {
    const { userData } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleNotificationClick = (notification) => {
        if (!notification.read)
            markRead(notification.id, notification._id);

        const url = getNotificationRedirectURL(notification.redirectURL, userData?.role, userData?._id);

        if (url)
            navigate(url);
    }
    return handleNotificationClick;
};

export default useNotificationClick;