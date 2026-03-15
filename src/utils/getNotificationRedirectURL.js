export const getNotificationRedirectURL = (redirectURL, role, userID) => {
    if (!redirectURL)
        return null;

    if (redirectURL.startsWith("/chat/")) {
        const id = redirectURL.split("/chat/")[1];
        return `/dashboard/${role}/chat/${id}`;
    }

    if (redirectURL === "/supervisor")
        return role === "student"
            ? `/dashboard/student/ask-mentor`
            : `/dashboard/faculty/supervises`;

    if (redirectURL.startsWith("/appointments"))
        return role === "student"
            ? `/dashboard/student/ask-mentor`
            : `/dashboard/faculty/appointments`;

    if (redirectURL === "/repository")
        return `/dashboard/${role}/${userID}/repository`;

    if (redirectURL.startsWith("/courses"))
        return `/dashboard/${role}${redirectURL}`;

    return `/dashboard/${role}${redirectURL}`;
};