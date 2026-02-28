export const formatErrorMessage = (error) => {

    // Axios backend error
    if (error?.response?.data?.message)
        return error.response.data.message;

    // Firebase auth errors
    if (error?.code) {
        switch (error.code) {
            case "auth/popup-closed-by-user":
                return "Google sign-in cancelled.";

            case "auth/network-request-failed":
                return "Network error. Check your internet connection.";

            case "auth/invalid-credential":
                return "Invalid email or password.";

            case "auth/user-not-found":
                return "No account found with this email.";

            case "auth/wrong-password":
                return "Incorrect password.";

            case "auth/too-many-requests":
                return "Too many attempts. Try again later.";

            case "auth/email-already-in-use":
                return "Account already exists. Please login using Google or Email.";

            default:
                return "Something went wrong. Please try again.";
        }
    }

    if (error?.message)
        return error.message;

    return "Unexpected error occurred.";
};