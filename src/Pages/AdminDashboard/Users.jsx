import {toast} from "sonner";
import axiosSecure from "../../utils/axiosSecure.js";
import {useContext, useState} from "react";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";

const Users = () => {
    const [users, setUsers] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const {userData} = useContext(AuthContext);

    const fetchUsers = async () => {
        try {
            // Fetch all users
            const usersRes = await axiosSecure.get(`/admin/users`);
            console.log("Users data (Users.jsx): ", usersRes);
        } catch {
            toast.error('Error fetching users');
        }
    }

    fetchUsers();

    const handleDelete = async (email) => {
        if (userData?._id == null) return;
        setDeleting(true);

        try {
            const deleteRes = await axiosSecure.delete(`/admin/users/${email}`);
            console.log(deleteRes);

            if (deleteRes.status === 200) {
                toast.success("User deleted successfully.");

                // Update the users list so that the deleted user is there no more
                setUsers(users.filter(user => user.email !== email));
            }
        } catch {
            toast.error('Error deleting user');
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="gilroy space-y-6">
            <div>
                Stats
                <p>Total Users</p>
                <p>Total Students</p>
                <p>Total Faculties</p>
            </div>

            <div>
                Bar chart (all years)
                Student Trend
                Faculty Trend
            </div>

            <div>
                Pie chart
                Pending
                Approved
                Suspended
            </div>

            <div>
                Users List
            </div>
        </div>
    );
};

export default Users;