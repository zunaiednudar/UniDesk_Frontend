import { toast } from "sonner";
import axiosSecure from "./axiosSecure.js";

export const handleGoogleLogin = async (signInWithGoogle, removeUser, logout,navigate,setUserData) => {
    try {
        const res = await signInWithGoogle();

        if (!res)
            return;

        const user = res.user;
        const email = user.email;
        const isNewUser = res._tokenResponse?.isNewUser;

        if (!email.endsWith(".kuet.ac.bd")) {
            toast.error("Please use a valid KUET email.");
            if (isNewUser) 
                await removeUser();
            else 
                await logout();
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

            setUserData(res.data.user); 

            toast.success("Logged in with Google");

            toast.info("You can now use Google to login anytime. Password login may require password reset once.");

            if (userRole === "student")
                navigate("/dashboard/student");
            else if (userRole === "faculty")
                navigate("/dashboard/faculty");
            else
                navigate("/dashboard/admin");

        } catch (dbError) {
            if (isNewUser) 
                await removeUser();
            else 
                await logout();

            toast.error(dbError.response?.data?.message || "Login failed");
        }
    } catch (error) {
        toast.error(formatErrorMessage(error));
    }
};