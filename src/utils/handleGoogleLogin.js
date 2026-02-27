import { toast } from "sonner";
import axiosSecure from "./axiosSecure.js";

export const handleGoogleLogin = async (signInWithGoogle, removeUser, navigate) => {
    try {
        const res = await signInWithGoogle();

        if (!res)
            return;

        const user = res.user;
        const email = user.email;

        if (!email.endsWith(".kuet.ac.bd")) {
            toast.error("Please use a valid KUET email.");
            await removeUser();
            return;
        }

        const roleChecking = email.split("@")[1].split(".")[0];

        const userRole = roleChecking === "stud" ? "student" : "faculty";

        const data = {
            name: user.displayName,
            email,
            role: userRole,
            department: "",
            studentID: "",
            batch: "",
            designation: "",
            photoURL: user.photoURL,
            photoId: null,
            method: "google"
        };

        try {
            const res = await axiosSecure.post("/users", data);
            toast.success("Logged in with Google");
            navigate("/");
        } catch (dbError) {
            await removeUser();
            toast.error(dbError.response?.data?.message || "Login failed");
        }
    } catch (error) {
        toast.error(error.message);
    }
};