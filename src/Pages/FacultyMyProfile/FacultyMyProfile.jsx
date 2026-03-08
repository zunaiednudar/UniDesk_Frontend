import React, { useContext, useRef, useState } from 'react';
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider';
import { MdOutlineEmail, MdOutlinePhone } from 'react-icons/md';
import { IoCameraOutline, IoLocationOutline } from 'react-icons/io5';
import { toast } from 'sonner';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import axiosSecure from '../../utils/axiosSecure';
import { FaRegEdit } from 'react-icons/fa';
import { FiLock } from "react-icons/fi";

const FacultyMyProfile = () => {
    const { userData, setUserData, passwordReset,updateUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    const modalRef = useRef(null);
    const resetPasswordRef = useRef(null);

    const [interests, setInterests] = useState(userData?.researchInterests || []);
    const [interestInput, setInterestInput] = useState("");

    const handleAddInterest = (e) => {
        if (e.key === "Enter" && interestInput.trim() !== "") {
            e.preventDefault();

            if (!interests.includes(interestInput.trim()))
                setInterests([...interests, interestInput.trim()]);

            setInterestInput("");
        }
    };

    const handleRemoveInterest = (tag) => {
        setInterests(interests.filter(i => i !== tag));
    };

    // Image update related

    const fileInputRef = useRef(null);

    const handleInput = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = async (e) => {
        const image = e.target.files[0];

        if (!image)
            return;

        try {
            setImageLoading(true);

            const uploadedData = await uploadToCloudinary(image);

            if (!uploadedData) {
                toast.error("Profile image update failed");
                return;
            }

            const res = await axiosSecure.patch(`/users/profile/${userData?.email}`, {
                photoURL: uploadedData.url,
                photoId: uploadedData.public_id
            });

            if (!res.data.success) {
                toast.error("Profile image update failed");
                return;
            }

            await updateUser({ photoURL: uploadedData.url });

            setUserData(prev => ({
                ...prev,
                photoURL: uploadedData.url,
                photoId: uploadedData.public_id
            }));
            e.target.value = "";
            toast.success("Profile image updated successfully");
        } catch (error) {
            console.log(error.message);
            toast.error("Profile image update failed");
        } finally {
            setImageLoading(false);
        }
    };

    // Profile update

    const handleOpenUpdateModal = () => {
        setInterests(userData?.researchInterests || []);
        modalRef.current.showModal();
    }
    const handleCloseUpdateModal = () => modalRef.current.close();

    const handleOpenResetPasswordModal = () => resetPasswordRef.current.showModal();

    const handleCloseResetPasswordModal = () => resetPasswordRef.current.close();

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const form = e.target;

        const name = form.name.value;
        const room = form.room.value || null;
        const biography = form.biography.value.trim();

        let updatedFields = {}

        if (name !== userData?.name)
            updatedFields.name = name;

        if (room !== userData?.room)
            updatedFields.room = room;

        if (biography !== userData?.biography)
            updatedFields.biography = biography;

        if (JSON.stringify(interests) !== JSON.stringify(userData?.researchInterests))
            updatedFields.researchInterests = interests;

        if (Object.keys(updatedFields).length === 0) {
            toast.info("No changes detected");
            return;
        };

        try {
            setLoading(true);
            const res = await axiosSecure.patch(`/users/profile/${userData?.email}`, updatedFields);

            if (!res.data.success) {
                toast.error("Profile update failed");
                return;
            }
            
            if(updatedFields.name)
                await updateUser({displayName:updatedFields.name});

            setUserData(prev => ({
                ...prev,
                ...updatedFields
            }));

            handleCloseUpdateModal();
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log(error.message);
            handleCloseUpdateModal();
            toast.error("Profile update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = () => {
        passwordReset(userData.email).then(() => {
            handleCloseResetPasswordModal();
            toast.success("Password reset email sent. Check your inbox");
        })
            .catch((error) => {
                handleCloseResetPasswordModal();
                toast.error("Password reset link cannot be sent");
            })
    };

    return (
        <div className='w-full max-w-full p-5 flex flex-col gap-10 gilroy'>

            <div className='w-full max-w-full'>
                <p className='text-3xl graphik font-bold text-black'>My Profile</p>
                <p className='text-gray-500'>View and manage your profile information</p>
            </div>

            <div className='w-full flex flex-col p-5 shadow-lg rounded-lg gap-5'>
                <div className='flex flex-col items-center md:flex-row gap-5 flex-wrap'>

                    {/* Profile Image */}

                    <div className="relative w-32 h-32 rounded-full group cursor-pointer overflow-hidden shadow-md">

                        <img className='w-32 h-32 rounded-full object-cover' src={userData?.photoURL} alt={userData?.name} />

                        {/* Image Change overlay */}

                        {
                            imageLoading ?
                                (<div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <span className="loading loading-dots loading-md"></span>
                                </div>)
                                :
                                (<div
                                    onClick={handleInput}
                                    className="absolute bottom-0 left-0 w-full h-1/4 rounded-b-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                >
                                    <span className="text-white text-lg"><IoCameraOutline /></span>
                                </div>)
                        }
                    </div>

                    {/* Image file input */}

                    <input
                        type="file"
                        disabled={imageLoading}
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                    />

                    <div className='flex flex-col items-center md:items-start gap-2'>
                        <p className='graphik text-xl md:text-2xl font-bold'>{userData?.name.split(" ")
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </p>
                        <p className='text-md text-gray-500 font-semibold'>{userData?.designation.split(" ")
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}, {userData?.department.toUpperCase()}
                        </p>
                        <div className='flex gap-10'>
                            <div className='flex items-center gap-1 text-gray-500 text-sm'><MdOutlineEmail /> {userData?.email}</div>
                            <div className='flex items-center gap-1 text-gray-500 text-sm'><IoLocationOutline />{userData?.room}</div>
                        </div>
                        <div className='flex items-center gap-1 text-gray-500 text-sm'><MdOutlinePhone /> {userData?.phone ? userData?.phone : "No phone number found"}</div>
                    </div>
                    <div className='flex flex-col gap-5 md:ml-auto'>
                        <button className="w-full flex gap-2 items-center justify-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500 md:ml-auto" onClick={handleOpenUpdateModal}><FaRegEdit /> Edit Profile</button>
                        <button className="w-full flex gap-2 items-center justify-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500 md:ml-auto" onClick={handleOpenResetPasswordModal}><FiLock /> Reset Password</button>
                    </div>

                </div>
                <hr className='text-gray-500' />
                <div className='flex flex-col items-start gap-2'>
                    <p className='text-xl graphik font-bold'>Biography</p>
                    <p className='text-justify text-sm text-gray-500'>{
                        userData?.biography ? userData?.biography : "No biography found"
                    }</p>
                </div>
                <div className='flex flex-col items-start gap-2'>
                    <p className='text-xl graphik font-bold'>Research Interests</p>
                    <div className='flex flex-wrap gap-2'>
                        {
                            userData?.researchInterests.length > 0 ? (userData?.researchInterests.map(interest => <span
                                key={interest}
                                className="px-3 py-1 rounded-full text-sm font-medium bg-[#1E40AF]/10 text-[#1E40AF]"
                            >
                                {interest.trim()}
                            </span>)) : <p className='text-justify text-sm text-gray-500'>No research interests found</p>
                        }
                    </div>
                </div>
            </div>

            {/* Modal for update */}

            <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-xl p-8">

                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold graphik">Update Profile</h3>
                        <button
                            onClick={handleCloseUpdateModal}
                            className="btn btn-sm btn-circle btn-ghost"
                        >
                            ✕
                        </button>
                    </div>

                    <p className="text-sm text-gray-500 mb-6">
                        Update your basic profile information below.
                    </p>

                    <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">

                        {/* Name */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                defaultValue={userData?.name}
                                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Room */}

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Room Number</label>
                            <input
                                type="text"
                                name="room"
                                defaultValue={userData?.room ?? ""}
                                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Biography */}

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">Biography</label>
                            <textarea
                                type="text"
                                name="biography"
                                defaultValue={userData?.biography ?? ""}
                                className="textarea textarea-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"

                            ></textarea>
                        </div>

                        {/* Research Interests */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-semibold text-gray-700">
                                Research Interests
                            </label>

                            <div className="flex flex-wrap items-center gap-2 border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                                {
                                    interests.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveInterest(tag)}
                                                className="text-red-500"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))
                                }
                                <input
                                    type="text"
                                    value={interestInput}
                                    onChange={(e) => setInterestInput(e.target.value)}
                                    onKeyDown={handleAddInterest}
                                    placeholder={interests.length === 0 ? "Type interest and press Enter" : ""}
                                    className="flex-1 min-w-30 outline-none text-sm"
                                />

                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={handleCloseUpdateModal}
                                className="btn btn-soft px-5 py-2 rounded-lg w-40"
                            >
                                Cancel
                            </button>

                            <button disabled={loading} type="submit" className="w-40 bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500">
                                {
                                    loading ?
                                        <span className="loading loading-dots loading-md"></span>
                                        :
                                        "Save Changes"
                                }
                            </button>
                        </div>
                    </form>
                    <div className="mt-5 text-center">
                        <p className="text-xs text-red-500">
                            You can only update your name, biography, research interests and room number.
                        </p>
                    </div>
                </div>
            </dialog>

            {/* Modal for reset password */}

            <dialog ref={resetPasswordRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">

                    <h3 className="font-bold text-lg">Reset Password</h3>

                    <p className="py-4 text-gray-600">
                        A password reset link will be sent to your email address.
                        Are you sure you want to continue?
                    </p>

                    <div className="modal-action">

                        <button
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500"
                        >
                            {
                                loading
                                    ? <span className="loading loading-dots loading-sm"></span>
                                    : "Yes, Send Link"
                            }
                        </button>

                        <button
                            onClick={handleCloseResetPasswordModal}
                            className="btn"
                        >
                            Cancel
                        </button>

                    </div>
                </div>
            </dialog>
        </div >
    );
};

export default FacultyMyProfile;