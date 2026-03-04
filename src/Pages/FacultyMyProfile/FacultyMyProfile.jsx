import React, { useContext, useRef, useState } from 'react';
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider';
import { MdOutlineEmail, MdOutlinePhone } from 'react-icons/md';
import { IoCameraOutline, IoLocationOutline } from 'react-icons/io5';
import { toast } from 'sonner';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import axiosSecure from '../../utils/axiosSecure';
import { FaRegEdit } from 'react-icons/fa';

const FacultyMyProfile = () => {
    const { userData, setUserData } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const modalRef = useRef(null);

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

            setUserData(prev => ({
                ...prev,
                photoURL: uploadedData.url,
                photoId: uploadedData.public_id
            }));
            e.target.value = "";
            toast.success("Profile image updated successfully");
        } catch (error) {
            console.log(error);
            toast.error("Profile image update failed");
        } finally {
            setImageLoading(false);
        }
    };

    // Profile update

    const handleOpenUpdateModal = () => modalRef.current.showModal();;
    const handleCloseUpdateModal = () => modalRef.current.close();;

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const form = e.target;

        const name = form.name.value;
        const room = form.room.value || null;

        let updatedFields={}

        if (name !== userData?.name) 
            updatedFields.name = name;

        if (room !== userData?.room)
            updatedFields.room = room;

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

            setUserData(prev => ({
                ...prev,
                ...(name && { name }),
                ...(room && { room })
            }));

            handleCloseUpdateModal();
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log(error);
            handleCloseUpdateModal();
            toast.error("Profile update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full max-w-full p-10 flex flex-col gap-10 inter'>

            <div className='w-full max-w-full'>
                <p className='text-3xl playfair font-bold text-black'>My Profile</p>
                <p className='text-gray-500'>View and manage your profile information</p>
            </div>

            <div className='w-full flex flex-col p-5 shadow-lg rounded-lg gap-5'>
                <div className='flex flex-col items-center md:flex-row gap-5'>

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
                        <p className='playfair text-xl md:text-2xl font-extrabold'>{userData?.name.split(" ")
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
                    <button className="flex gap-2 items-center bg-[#1E40AF] text-white px-5 py-2 rounded-lg cursor-pointer text-center transition-colors hover:bg-blue-600 duration-500 md:ml-auto" onClick={handleOpenUpdateModal}><FaRegEdit /> Edit Profile</button>
                </div>
                <hr className='text-gray-500' />
                <div className='flex flex-col items-start gap-2'>
                    <p className='text-xl playfair font-bold'>Biography</p>
                    <p className='text-justify text-sm text-gray-500'>{
                        userData?.biography ? userData?.biography : "No biography found"
                    }</p>
                </div>
                <div className='flex flex-col items-start gap-2'>
                    <p className='text-xl playfair font-bold'>Research Interests</p>
                    <div className='flex flex-wrap gap-2'>
                        {
                            userData?.researchInterests ? (userData?.researchInterests.map(interest => <span
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
                        <h3 className="text-2xl font-bold playfair">Update Profile</h3>
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
                        {
                            userData?.role === "faculty" && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-semibold text-gray-700">Room Number</label>
                                    <input
                                        type="text"
                                        name="room"
                                        defaultValue={userData?.room ?? ""}
                                        className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )
                        }

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
                            You can only update your name {userData?.role === "faculty" && "and room number"}.
                        </p>
                    </div>
                </div>
            </dialog>
        </div >
    );
};

export default FacultyMyProfile;