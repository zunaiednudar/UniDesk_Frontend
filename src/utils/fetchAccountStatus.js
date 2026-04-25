import axiosSecure from "./axiosSecure.js"

export const fetchAccountStatus = async () => {
    try {
        const res = await axiosSecure.get("/users/account-status");

        return res.data?.user || null;
    } catch (error) {
        return null;
    }
};