import { toast } from "sonner";
import axiosSecure from "./axiosSecure.js";

// Fetching user data from database

export const fetchUserData = async (currentUser) => {
    try {
        if (!currentUser)
            return null;
        const res = await axiosSecure.get(`/users/${currentUser.email}`);

        const result = res.data;

        if (result.success)
            return result.user;
        else {
            toast.error(result.message);
            return null;
        }
    } catch (error) {
        if (error?.response?.status === 403)
            return null;

        toast.error(error.response?.data?.message ||
            "Failed to fetch user data");
        return null;
    }
};