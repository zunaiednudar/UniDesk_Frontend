import axiosSecure from "./axiosSecure.js";

export const fetchAssignmentSubmissions = async (assignmentId) => {
    if (!assignmentId)
        return;
    const res = await axiosSecure.get(`/assignment/${assignmentId}/submissions`);
    return (res?.data?.submissions || []);
};