import { startTransition, useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Providers/AuthProvider/AuthProvider";
import timeAgo from "../timeAgo.js";
import axiosSecure from "../axiosSecure.js";
import socket from "../socket.js";
import { formatNotificationType } from "../formatNotification.js";

// Notification from today or not

const isToday = (dateString) => {
    const created = new Date(dateString);
    const today = new Date();
    return (
        created.getFullYear() === today.getFullYear() &&
        created.getMonth() === today.getMonth() &&
        created.getDate() === today.getDate()
    );
};

export const useNotifications = () => {
    const { userData } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading,setLoading]=useState(true);

    // Fetch notifications function by Zunaied Nudar

    const fetchNotifications = useCallback(async (showLoading=true) => {
        try {
            if(showLoading)
                setLoading(true);
            const res = await axiosSecure.get("/notifications");
            // console.log("Notifications: ", res);

            const formattedNotifications = (res.data.notifications || []).map((notification, index) => ({
                id: index + 1,
                _id: notification._id,
                title: formatNotificationType(notification.type),
                message: notification.message,
                time: timeAgo(notification.createdAt),
                read: notification.isRead,
                today: isToday(notification.createdAt)
            }));

            startTransition(() => {
                setNotifications(formattedNotifications);
            });

        } catch (error) {
            // console.log(error);
        }finally{
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications(true);
    }, [fetchNotifications]);

    useEffect(() => {
        if (!userData?._id)
            return;

        const handleNewNotification=()=>fetchNotifications(false);

        socket.on("new_notification", handleNewNotification);

        return () => socket.off("new_notification", handleNewNotification);
    }, [userData?._id, fetchNotifications]);

    // Mark all as read function by Zunaied Nudar

    const markAllRead = async () => {
        try {
            await axiosSecure.patch("/notifications/all");
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            // console.log(error);
        }
    }

    // Mark as read function by Zunaied Nudar

    const markRead = async (id, _id) => {
        try {
            await axiosSecure.patch(`/notifications/${_id}`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            // console.log(error);
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length;
    const todayNotifs = notifications.filter(n => n.today).slice(0, 10);
    const historyNotifs = notifications.filter(n => !n.today).slice(0, 10);

    return {
        notifications,
        loading,
        unreadCount,
        todayNotifs,
        historyNotifs,
        markAllRead,
        markRead
    }
};