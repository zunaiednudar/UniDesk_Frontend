import React, {useContext, useState, useEffect} from "react";
import {AuthContext} from "../../Providers/AuthProvider/AuthProvider.jsx";
import {toast} from "sonner";
import {uploadToCloudinary} from "../../utils/uploadToCloudinary.js";
import axiosSecure from "../../utils/axiosSecure.js";
import {formatErrorMessage} from "../../utils/formatErrorMessages.js";
import {Camera} from "lucide-react";

const StudentProfile = () => {
    const {userData, setUserData, setUser, updateUser, passwordReset} = useContext(AuthContext);

    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [department, setDepartment] = useState("");
    const [studentID, setStudentID] = useState("");
    const [batch, setBatch] = useState("");
    const [designation, setDesignation] = useState("");
    const [room, setRoom] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    useEffect(() => {
        if (userData) {
            setName(userData.name || "");
            setRole(userData.role || "");
            setDepartment(userData.department || "");
            setStudentID(userData.studentID || "");
            setBatch(userData.batch || "");
            setDesignation(userData.designation || "");
            setRoom(userData.room || "");
            setPhotoPreview(userData.photoURL || null);
        }
    }, [userData]);

    const handlePasswordReset = async () => {
        setResetLoading(true);
        try {
            await passwordReset(userData.email);
            toast.success("Password reset email sent! Check your inbox.");
        } catch (err) {
            toast.error(formatErrorMessage(err));
        } finally {
            setResetLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const imageData = photoFile
                ? await uploadToCloudinary(photoFile)
                : {url: userData?.photoURL, public_id: userData?.photoId};

            const payload = {
                name,
                photoURL: imageData.url,
                photoId: imageData.public_id,
                ...(role === "faculty" && room && {room}),
            };

            await axiosSecure.patch(`/users/profile/${userData.email}`, payload);

            // Md. Zunaied Nudar - Error fix (patch response doesn't return any user)
            // Fix -> manually created the updated data object with form data & existing userData
            const updated = {
                ...userData,
                name,
                photoURL: imageData.url,
                photoId: imageData.public_id,
                ...(role === "faculty" && {room}),
            };

            setUserData(updated);

            // Sync local form state
            setName(updated.name || "");
            setRoom(updated.room || "");
            setPhotoPreview(updated.photoURL || null);
            setPhotoFile(null); // clear staged file

            await updateUser({
                displayName: updated.name || "",
                photoURL: updated.photoURL || null,
            });

            setUser(prev => ({
                ...prev,
                displayName: updated.name || "",
                photoURL: updated.photoURL || null,
            }));

            toast.success("Profile updated successfully");
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                formatErrorMessage(err) ||
                "Update failed. Please try again.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const readOnlyClass =
        "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400";

    return (
        <div className="gilroy min-h-screen py-8 px-4">
            <form onSubmit={handleProfileUpdate} className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your profile and account preferences</p>
                </div>

                {/* Profile Picture */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-1">Profile picture</h2>
                    <p className="text-xs text-gray-400 mb-4">PNG, JPEG under 2MB</p>
                    <div className="flex flex-col lg:flex-row items-center gap-5">
                        <div
                            className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden ring-2 ring-gray-100 shrink-0">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover"/>
                            ) : (
                                <div
                                    className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                                    {name?.[0]?.toUpperCase() || "?"}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <label
                                className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-700">
                                <Camera className="w-4 h-4"/>
                                Change picture
                                <input
                                    type="file"
                                    name="photo"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Full Name */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-1">Full name</h2>
                    <p className="text-xs text-gray-400 mb-4">Your display name across UniDesk</p>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition capitalize"
                        placeholder="Your full name"
                        required
                    />
                </div>

                {/* Email */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-1">University email</h2>
                    <p className="text-xs text-gray-400 mb-4">Your KUET institutional email address</p>
                    <div className={`${readOnlyClass} overflow-x-auto`}>{userData?.email || "—"}</div>
                </div>

                {/* Role & Department */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700 mb-1">Role & Department</h2>
                        <p className="text-xs text-gray-400 mb-4">Set during registration and cannot be changed</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Role</label>
                            <div className={`${readOnlyClass} overflow-x-auto capitalize`}>{role || "—"}</div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Department</label>
                            <div className={`${readOnlyClass} overflow-x-auto uppercase`}>{department || "—"}</div>
                        </div>
                    </div>

                    {role === "student" && (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Student ID</label>
                                <div className={`${readOnlyClass} overflow-x-auto`}>{studentID || "—"}</div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Batch</label>
                                <div className={`${readOnlyClass} overflow-x-auto`}>{batch || "—"}</div>
                            </div>
                        </div>
                    )}

                    {role === "faculty" && (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Designation</label>
                                <div className={`${readOnlyClass} capitalize`}>{designation || "—"}</div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Room No</label>
                                <input
                                    type="text"
                                    value={room}
                                    onChange={(e) => setRoom(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    placeholder="CSE 201, B-Block"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Reset */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex flex-col lg:flex-row items-end lg:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-700 mb-1">Password</h2>
                            <p className="text-xs text-gray-400">
                                We'll send a reset link to{" "}
                                <span className="text-gray-500 font-medium">{userData?.email}</span>
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handlePasswordReset}
                            disabled={resetLoading}
                            className="shrink-0 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resetLoading ? "Sending..." : "Send reset link"}
                        </button>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pb-8">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Save changes"}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default StudentProfile;