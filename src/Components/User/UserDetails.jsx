import {useNavigate, useParams} from "react-router";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";
import axiosSecure from "../../utils/axiosSecure.js";
import {toast} from "sonner";
import {uploadToCloudinary} from "../../utils/uploadToCloudinary.js";
import {AlertCircle, GraduationCap, School, ArrowLeft, Trash2, Camera} from "lucide-react";

const SkeletonBlock = ({className}) => (
    <div className={`rounded-xl bg-gray-100 animate-pulse ${className}`}/>
);

const roleConfig = {
    student: {icon: School},
    faculty: {icon: GraduationCap},
};

const UserDetails = () => {
    const {email} = useParams();
    const {userData} = useContext(AuthContext);

    const [user, setUser] = useState(null);

    // Design helper states representing loading
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Editable fields
    const [photoFile, setPhotoFile] = useState(null);

    const navigate = useNavigate();

    const readOnlyClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400";
    const inputClass = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

    useEffect(() => {
        const fetchUser = async () => {
            if (userData?._id == null) return;
            setLoading(true);

            try {
                // Getting the selected user details
                const userRes = await axiosSecure.get(`/users/${email}`);
                setUser(userRes.data.user);
            } catch {
                toast.error("Error fetching user data");
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, [userData, email]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setUser(prev => ({...prev, photoURL: URL.createObjectURL(file)}));
        }
    };

    // User deletion logic
    // Same as ManageUsers.jsx
    const handleDelete = async () => {
        setDeleting(true);

        try {
            const deleteRes = await axiosSecure.delete(`/admin/users/${email}`);

            if (deleteRes.status === 200) {
                toast.success("User deleted successfully.");
                navigate(`/dashboard/admin/users/`);
            }
        } catch {
            toast.error('Error deleting user');
        } finally {
            setDeleting(false);
        }
    };

    // User Update logic
    // Similar to Profile.jsx
    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const imageData = photoFile
                ? await uploadToCloudinary(photoFile)
                : {url: user?.photoURL, public_id: user?.photoId};

            const payload = {
                name: user.name,
                status: user.status,
                department: user.department,
                photoURL: imageData.url,
                photoId: imageData.public_id,
                ...(user.role === "student" && {studentID: user.studentID, batch: user.batch}),
                ...(user.role === "faculty" && {designation: user.designation, room: user.room}),
            };

            const updateRes = await axiosSecure.patch(`/admin/users/${email}`, payload);

            if (updateRes.status === 200) {
                setUser(prev => ({...prev, ...payload}));
                setPhotoFile(null);
                toast.success("User updated successfully.");
            }
        } catch {
            toast.error("Error updating user");
        } finally {
            setUpdating(false);
        }
    };

    const RoleIcon = roleConfig[user?.role]?.icon ?? School;

    return (
        <div className="gilroy min-h-screen py-8 px-4">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Back + Delete header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate("/dashboard/admin/users")}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
                    >
                        <ArrowLeft size={15}/>
                        Back to Users
                    </button>

                    {!loading && user && (
                        deleting ? (
                            <svg className="animate-spin w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                            </svg>
                        ) : (
                            <button
                                onClick={() => document.getElementById("delete_modal").showModal()}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
                            >
                                <Trash2 size={14}/>
                                Delete User
                            </button>
                        )
                    )}
                </div>

                {/* Delete confirmation modal */}
                <dialog id="delete_modal" className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
                        <p className="text-sm text-gray-500">Are you sure you want to delete this user permanently?</p>
                        <div className="modal-action">
                            <button className="btn btn-ghost btn-sm" onClick={() => document.getElementById("delete_modal").close()}>
                                Keep User
                            </button>
                            <button className="btn btn-error btn-sm text-white" onClick={handleDelete}>
                                Delete User
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>

                {loading ? (
                    <div className="space-y-4">
                        <SkeletonBlock className="h-32"/>
                        <SkeletonBlock className="h-24"/>
                        <SkeletonBlock className="h-40"/>
                    </div>
                ) : !user ? (
                    <div className="flex flex-col items-center py-16 text-gray-400 text-sm">
                        <AlertCircle size={28} className="text-gray-200 mb-2"/>
                        User not found.
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="space-y-6">

                        {/* Profile Picture */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-sm font-semibold text-gray-700 mb-1">Profile picture</h2>
                            <p className="text-xs text-gray-400 mb-4">PNG, JPEG under 2MB</p>
                            <div className="flex flex-col lg:flex-row items-center gap-5">
                                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden ring-2 ring-gray-100 shrink-0">
                                    {user.photoURL ? (
                                        <div
                                            className="w-full h-full"
                                            style={{
                                                backgroundImage: `url(${user.photoURL})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                                            {user.name?.[0]?.toUpperCase() || "?"}
                                        </div>
                                    )}
                                </div>
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-700">
                                    <Camera className="w-4 h-4"/>
                                    Change picture
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange}/>
                                </label>
                            </div>
                        </div>

                        {/* Full Name */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-sm font-semibold text-gray-700 mb-1">Full name</h2>
                            <p className="text-xs text-gray-400 mb-4">Display name across UniDesk</p>
                            <input
                                type="text"
                                value={user.name || ""}
                                onChange={(e) => setUser(prev => ({...prev, name: e.target.value}))}
                                className={`${inputClass} capitalize`}
                                placeholder="Full name"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-sm font-semibold text-gray-700 mb-1">University email</h2>
                            <p className="text-xs text-gray-400 mb-4">Institutional email address</p>
                            <div className={`${readOnlyClass} overflow-x-auto`}>{user.email || "—"}</div>
                        </div>

                        {/* Role & Department */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-700 mb-1">Role & Department</h2>
                                <p className="text-xs text-gray-400 mb-4">Core academic information</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Role</label>
                                    <div className="flex items-center gap-2">
                                        <RoleIcon size={14} className="text-gray-400 shrink-0"/>
                                        <div className={`${readOnlyClass} capitalize`}>{user.role || "—"}</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Department</label>
                                    <input
                                        type="text"
                                        value={user.department || ""}
                                        onChange={(e) => setUser(prev => ({...prev, department: e.target.value}))}
                                        className={`${inputClass} uppercase`}
                                        placeholder="CSE"
                                    />
                                </div>
                            </div>

                            {user.role === "student" && (
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Student ID</label>
                                        <input
                                            type="text"
                                            value={user.studentID || ""}
                                            onChange={(e) => setUser(prev => ({...prev, studentID: e.target.value}))}
                                            className={inputClass}
                                            placeholder="2001001"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Batch</label>
                                        <input
                                            type="text"
                                            value={user.batch || ""}
                                            onChange={(e) => setUser(prev => ({...prev, batch: e.target.value}))}
                                            className={inputClass}
                                            placeholder="20"
                                        />
                                    </div>
                                </div>
                            )}

                            {user.role === "faculty" && (
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Designation</label>
                                        <input
                                            type="text"
                                            value={user.designation || ""}
                                            onChange={(e) => setUser(prev => ({...prev, designation: e.target.value}))}
                                            className={`${inputClass} capitalize`}
                                            placeholder="Assistant Professor"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Room No</label>
                                        <input
                                            type="text"
                                            value={user.room || ""}
                                            onChange={(e) => setUser(prev => ({...prev, room: e.target.value}))}
                                            className={inputClass}
                                            placeholder="CSE 201, B-Block"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Account Status */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-sm font-semibold text-gray-700 mb-1">Account status</h2>
                            <p className="text-xs text-gray-400 mb-4">Control this user's access to UniDesk</p>
                            <select
                                value={user.status || "pending"}
                                onChange={(e) => setUser(prev => ({...prev, status: e.target.value}))}
                                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                            >
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pb-8">
                            <button
                                type="submit"
                                disabled={updating}
                                className="px-8 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {updating ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default UserDetails;