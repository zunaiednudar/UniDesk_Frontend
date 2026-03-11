import React, { useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider.jsx';
import axiosSecure from '../../utils/axiosSecure.js';
import CardSkeleton from '../../Components/CardSkeleton/CardSkeleton.jsx';
import PaginationTemplate from '../../Components/PaginationTemplate/PaginationTemplate.jsx';
import { IoMdAdd } from 'react-icons/io';
import { BookOpen, Briefcase, Check, MessageCircle, Search, Settings, Trash2 } from 'lucide-react';
import formatName from '../../utils/formatName.js';

const FacultyMySupervises = () => {
    const { userData } = useContext(AuthContext);

    // Filtering
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [relationshipType,setRelationshipType]=useState("");

    // All supervisee data and loading state

    const [activeSupervises, setActiveSupervises] = useState([]);
    const [completedSupervises, setCompletedSupervises] = useState([]);
    const [loadingSupervises, setLoadingSupervises] = useState(true);

    // Modal ref

    const detailsModalRef = useRef(null);
    const confirmRemoveModalRef = useRef(null);

    const [selectedSupervisee, setSelectedSupervisee] = useState(null);
    const [manageActions, setManageActions] = useState(false);
    const [superviseeStatus, setSuperviseeStatus] = useState("active");
    const [loadingStatusUpdate, setLoadingStatusUpdate] = useState(false);
    const [loadingRemoveSupervisee, setLoadingRemoveSupervisee] = useState(false);

    // Open details modal function

    const handleOpenDetailsModal = (supervisee) => {
        setSelectedSupervisee(supervisee);
        setSuperviseeStatus(supervisee?.status || "active");
        setManageActions(false);
        detailsModalRef.current?.showModal();
    };

    // Close details modal function

    const handleCloseDetailsModal = () => {
        detailsModalRef.current?.close();

        setTimeout(() => {
            setSelectedSupervisee(null);
            setManageActions(false);
            setSuperviseeStatus("active");
        }, 200);
    };

    // Remove confirmation modal opening function

    const handleOpenRemoveConfirmModal = () => confirmRemoveModalRef.current?.showModal();

    // Remove confirmation modal closing function

    const handleCloseRemoveConfirmModal = () => confirmRemoveModalRef.current?.close();

    // Helper function to update UI instantly

    const updateSuperviseeInLists = (updatedSupervisee) => {
        setActiveSupervises((prev) => {
            const filtered = prev.filter(item =>
                !(item?.student?._id === updatedSupervisee?.student?._id &&
                    item?.relationshipType === updatedSupervisee?.relationshipType)
            );

            return updatedSupervisee?.status === "active" ? [updatedSupervisee, ...filtered] : filtered;
        });

        setCompletedSupervises((prev) => {
            const filtered = prev.filter(item =>
                !(item?.student?._id === updatedSupervisee?.student?._id &&
                    item?.relationshipType === updatedSupervisee?.relationshipType)
            );

            return updatedSupervisee?.status === "completed" ? [updatedSupervisee, ...filtered] : filtered;
        });

        setSelectedSupervisee(updatedSupervisee);
    };


    // Update status function

    const handleUpdateSuperviseeStatus = async () => {
        if (!selectedSupervisee?.student?._id || !userData?._id)
            return;

        try {
            setLoadingStatusUpdate(true);

            const payload = {
                studentID: selectedSupervisee?.student?._id,
                relationshipType: selectedSupervisee?.relationshipType,
                status: superviseeStatus
            };

            const res = await axiosSecure.patch(`/supervisor/${userData?._id}`, payload);

            if (!res?.data?.success) {
                toast.error(res?.data?.message || "Failed to update supervisee status");
                return;
            }

            const updatedSupervisee = {
                ...selectedSupervisee,
                status: superviseeStatus
            };

            setSelectedSupervisee(updatedSupervisee);
            updateSuperviseeInLists(updatedSupervisee);

            handleCloseDetailsModal();

            toast.success("Supervisee status updated successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update supervisee status");
        } finally {
            setLoadingStatusUpdate(false);
        }
    };

    // Supervisee removal function

    const handleRemoveSupervisee = async () => {
        if (!selectedSupervisee?.student?._id || !selectedSupervisee?.relationshipType || !userData?._id)
            return;

        try {
            setLoadingRemoveSupervisee(true);

            const payload = {
                studentID: selectedSupervisee?.student?._id,
                relationshipType: selectedSupervisee?.relationshipType
            };

            const res = await axiosSecure.delete(`/supervisor/${userData?._id}`, {
                data: payload
            });

            if (!res?.data?.success) {
                toast.error(res?.data?.message || "Failed to remove supervisee");
                return;
            }

            setActiveSupervises((prev) => prev.filter((supervisee) => !(supervisee.student._id.toString() === selectedSupervisee.student._id.toString() && supervisee.relationshipType === selectedSupervisee.relationshipType)));

            handleCloseRemoveConfirmModal();
            handleCloseDetailsModal();

            toast.success("Supervisee removed successfully");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to remove supervisee");
        } finally {
            setLoadingRemoveSupervisee(false);
        }
    };

    // Supervisee data fetch

    useEffect(() => {
        const fetchSupervises = async () => {
            try {
                setLoadingSupervises(true);
                const res = await axiosSecure.get(`/supervisor/${userData?._id}`, {
                    params: {
                        page,
                        search,
                        relationshipType
                    }
                });

                if (!res?.data?.success) {
                    toast.error(res?.data?.success);
                    return;
                }

                setActiveSupervises(res?.data?.activeSupervises || []);

                setCompletedSupervises(res?.data?.completedSupervises || []);

                setTotalPages(res?.data?.completedPagination?.totalPages || 1)

            } catch (error) {
                toast.error("Supervises fetch failed");
            } finally {
                setLoadingSupervises(false);
            }
        };

        if (userData?._id)
            fetchSupervises();
    }, [userData?._id, page, search,relationshipType]);

    // console.log(activeSupervises, completedSupervises);

    return (
        <>

            {/* Page UI */}

            <div className='w-full max-w-full p-5 flex flex-col gap-10 gilroy'>
                <div className='w-full max-w-full'>
                    <p className='text-3xl graphik font-bold text-black'>My Supervises</p>
                    <p className='text-gray-500'>Manage and track supervises activities</p>
                </div>

                {/* Search bar */}

                <div className='w-full flex flex-col items-start md:items-center md:flex-row gap-5'>
                    <div className="w-full flex flex-2 items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search supervisee"
                            className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    <select
                        value={relationshipType}
                        onChange={(e) => {
                            setRelationshipType(e.target.value);
                            setPage(1);
                        }}
                        className="select select-bordered w-25 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All</option>
                        <option value="thesis">Thesis</option>
                        <option value="project">Project</option>
                    </select>
                </div>

                {/* Supervises block */}

                <div className='w-full max-w-full flex flex-col justify-items-center gap-10 shadow-xl p-5'>

                    {/* Active supervises block */}

                    <div className='w-full flex flex-col gap-5'>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <p className="graphik text-xl font-bold text-gray-800">Active Supervises</p>
                            <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">{activeSupervises.length}</span>
                        </div>
                        <hr className='border-gray-200' />
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                            {
                                loadingSupervises ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <CardSkeleton key={i} variant="courseCard" />
                                    )
                                    )
                                ) : activeSupervises.length === 0 ?
                                    (
                                        <p className='col-span-full text-gray-500 md:text-xl lg:text-2xl text-center py-10'>
                                            No supervisee found
                                        </p>
                                    ) :
                                    (
                                        activeSupervises.map(supervisee =>
                                            <div className={`w-full flex flex-col gap-3 p-6 rounded-xl box-border shadow-md  hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${supervisee.relationshipType === "thesis" ?
                                                "bg-purple-100"
                                                :
                                                "bg-blue-100"
                                                } cursor-pointer`} onClick={() => handleOpenDetailsModal(supervisee)}>

                                                {/* Relationship type and status */}
                                                <div className='flex justify-between items-center'>
                                                    {
                                                        supervisee?.relationshipType === "thesis" ?
                                                            <span className="badge bg-purple-100 border-purple-300 text-xs text-purple-600 font-bold rounded-xl">
                                                                <BookOpen className='text-purple-600 w-3 h-3'></BookOpen>
                                                                Thesis
                                                            </span>
                                                            :
                                                            <span className="badge bg-blue-100 border-blue-300 text-xs text-blue-600 font-bold rounded-xl">
                                                                <Briefcase className='text-blue-600 w-3 h-3'></Briefcase>
                                                                Project
                                                            </span>
                                                    }
                                                    <span className="badge bg-green-100 border-green-200 text-xs text-green-600 font-bold rounded-xl">
                                                        <div className='bg-green-600 w-2 h-2 rounded-full'></div>
                                                        Active
                                                    </span>
                                                </div>

                                                {/* Supervisee Topic */}

                                                <p className='graphik text-sm font-semibold'>{supervisee?.topic}</p>

                                                {/* Supervisee Topic Description */}

                                                <p className='text-xs line-clamp-2 text-gray-500 text-justify'>{supervisee?.description}</p>

                                                {/* Supervisee Information */}

                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                    <img src={supervisee?.student?.photoURL} alt={formatName(supervisee?.student?.name)} className="w-10 h-10 rounded-full object-cover mr-2"
                                                    />
                                                    <div className="flex flex-col items-start min-w-0">
                                                        <p className="text-sm text-black truncate font-bold">{formatName(supervisee?.student?.name)}</p>
                                                        <p className="text-xs text-gray-400 break-all">{supervisee?.student?.studentID}</p>
                                                    </div>
                                                </div>

                                                {/* Meeting informations */}

                                                <div className='flex justify-between items-center'>
                                                    <div className='flex flex-col gap-1'>
                                                        <p className='text-xs font-semibold text-gray-600'>Last Meeting</p>
                                                        <p className='text-xs text-gray-500'>{supervisee?.lastMeetingAt === null
                                                            ?
                                                            "None yet"
                                                            :
                                                            supervisee?.lastMeetingAt
                                                        }
                                                        </p>
                                                    </div>
                                                    <div className='flex flex-col gap-1'>
                                                        <p className='text-xs font-semibold text-gray-600'>Next Meeting</p>
                                                        <p className='text-xs text-gray-500'>{supervisee?.nextMeetingAt === null
                                                            ?
                                                            "Not scheduled"
                                                            :
                                                            supervisee?.nextMeetingAt
                                                        }</p></div>
                                                </div>
                                            </div>
                                        )
                                    )
                            }
                        </div>
                    </div>

                    {/* Completed supervises block */}

                    <div className='w-full md:flex-2  flex flex-col gap-5'>
                        <p className="graphik text-xl font-bold text-gray-800">Completed Supervisions</p>
                        <hr className='border-gray-200' />
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                            {
                                loadingSupervises ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <CardSkeleton key={i} variant="courseCard" />
                                    )
                                    )
                                ) : completedSupervises.length === 0 ?
                                    (
                                        <p className='col-span-full text-gray-500 md:text-xl lg:text-2xl text-center py-10'>
                                            No supervisee found
                                        </p>
                                    ) :
                                    (
                                        completedSupervises.map(supervisee => <div className={`w-full flex flex-col gap-3 p-6 rounded-xl box-border shadow-md  hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${supervisee.relationshipType === "thesis" ?
                                            "bg-purple-100"
                                            :
                                            "bg-blue-100"
                                            } cursor-pointer`} onClick={() => handleOpenDetailsModal(supervisee)}>

                                            {/* Relationship type and status */}
                                            <div className='flex justify-between items-center'>
                                                {
                                                    supervisee?.relationshipType === "thesis" ?
                                                        <span className="badge bg-purple-100 border-purple-300 text-xs text-purple-600 font-bold rounded-xl">
                                                            <BookOpen className='text-purple-600 w-3 h-3'></BookOpen>
                                                            Thesis
                                                        </span>
                                                        :
                                                        <span className="badge bg-blue-100 border-blue-300 text-xs text-blue-600 font-bold rounded-xl">
                                                            <Briefcase className='text-blue-600 w-3 h-3'></Briefcase>
                                                            Project
                                                        </span>
                                                }
                                                <span className="badge bg-blue-100 border-blue-200 text-xs text-blue-600 font-bold rounded-xl">
                                                    <Check className='text-blue-600 w-3 h-3'></Check>
                                                    Completed
                                                </span>

                                            </div>

                                            {/* Supervisee Topic */}

                                            <p className='graphik text-sm font-semibold'>{supervisee?.topic}</p>

                                            {/* Supervisee Topic Description */}

                                            <p className='text-xs line-clamp-2 text-gray-500 text-justify'>{supervisee?.description}</p>

                                            {/* Supervisee Information */}

                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                <img src={supervisee?.student?.photoURL} alt={formatName(supervisee?.student?.name)} className="w-10 h-10 rounded-full object-cover mr-2"
                                                />
                                                <div className="flex flex-col items-start min-w-0">
                                                    <p className="text-sm text-black truncate font-bold">{formatName(supervisee?.student?.name)}</p>
                                                    <p className="text-xs text-gray-400 break-all">{supervisee?.student?.email}</p>
                                                </div>
                                            </div>

                                            {/* Meeting informations */}

                                            <div className='flex justify-between items-center'>
                                                <div className='flex flex-col gap-1'>
                                                    <p className='text-xs font-semibold text-gray-600'>Last Meeting</p>
                                                    <p className='text-xs text-gray-500'>{supervisee?.lastMeetingAt === null
                                                        ?
                                                        "None yet"
                                                        :
                                                        supervisee?.lastMeetingAt
                                                    }
                                                    </p>
                                                </div>
                                                <div className='flex flex-col gap-1'>
                                                    <p className='text-xs font-semibold text-gray-600'>Next Meeting</p>
                                                    <p className='text-xs text-gray-500'>{supervisee?.nextMeetingAt === null
                                                        ?
                                                        "Not scheduled"
                                                        :
                                                        supervisee?.nextMeetingAt
                                                    }</p></div>
                                            </div>
                                        </div>)

                                    )
                            }
                        </div>
                        <div className='mx-auto'>
                            <PaginationTemplate
                                page={page}
                                totalPages={totalPages}
                                onChange={setPage}></PaginationTemplate>
                        </div>
                    </div>
                </div>
            </div>

            {/* View and update supervisee modal */}

            <dialog ref={detailsModalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box max-w-2xl p-6">
                    {
                        selectedSupervisee && (
                            <div className="flex flex-col gap-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xl font-bold graphik">Supervisee Details</p>
                                    <button
                                        className="btn btn-sm btn-circle btn-ghost"
                                        onClick={handleCloseDetailsModal}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <img
                                        src={selectedSupervisee?.student?.photoURL}
                                        alt={formatName(selectedSupervisee?.student?.name)}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold text-lg text-black">
                                            {formatName(selectedSupervisee?.student?.name)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {selectedSupervisee?.student?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    {
                                        selectedSupervisee?.relationshipType === "thesis" ? (
                                            <span className="badge bg-purple-100 border-purple-300 text-xs text-purple-600 font-bold rounded-xl">
                                                <BookOpen className="text-purple-600 w-3 h-3" />
                                                Thesis
                                            </span>
                                        ) : (
                                            <span className="badge bg-blue-100 border-blue-300 text-xs text-blue-600 font-bold rounded-xl">
                                                <Briefcase className="text-blue-600 w-3 h-3" />
                                                Project
                                            </span>
                                        )
                                    }

                                    {
                                        selectedSupervisee?.status === "completed" ? (
                                            <span className="badge bg-blue-100 border-blue-200 text-xs text-blue-600 font-bold rounded-xl">
                                                <Check className="text-blue-600 w-3 h-3" />
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="badge bg-green-100 border-green-200 text-xs text-green-600 font-bold rounded-xl">
                                                <div className="bg-green-600 w-2 h-2 rounded-full"></div>
                                                Active
                                            </span>
                                        )
                                    }
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-500 font-medium">Topic</span>
                                        <span className="font-semibold text-gray-900">
                                            {selectedSupervisee?.topic}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-500 font-medium">Relationship Type</span>
                                        <span className="font-semibold text-gray-900 capitalize">
                                            {selectedSupervisee?.relationshipType}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-500 font-medium">Last Meeting</span>
                                        <span className="font-semibold text-gray-900">
                                            {selectedSupervisee?.lastMeetingAt || "None yet"}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-500 font-medium">Next Meeting</span>
                                        <span className="font-semibold text-gray-900">
                                            {selectedSupervisee?.nextMeetingAt || "Not scheduled"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-700">Description</span>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {selectedSupervisee?.description || "No description available"}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        className="flex-1 btn bg-[#1E40AF] text-white hover:bg-blue-600 border-none"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Message
                                    </button>
                                    {
                                        selectedSupervisee?.status === "active" && <button
                                            className="flex-1 btn btn-soft"
                                            onClick={() => setManageActions(prev => !prev)}
                                        >
                                            <Settings className="w-4 h-4" />
                                            Manage
                                        </button>
                                    }
                                </div>

                                {
                                    manageActions && (
                                        <div className="border-t border-gray-300 pt-4 flex flex-col gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-sm font-semibold text-gray-700">
                                                    Status
                                                </label>

                                                <select
                                                    value={superviseeStatus}
                                                    onChange={(e) => setSuperviseeStatus(e.target.value)}
                                                    className="select select-bordered w-full outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>

                                            <button
                                                onClick={handleUpdateSuperviseeStatus}
                                                disabled={loadingStatusUpdate}
                                                className="bg-[#1E40AF] text-white rounded-lg py-2 transition-colors hover:bg-blue-600 duration-500 cursor-pointer"
                                            >
                                                {
                                                    loadingStatusUpdate ? (
                                                        <span className="loading loading-dots loading-md"></span>
                                                    ) : (
                                                        "Update Status"
                                                    )
                                                }
                                            </button>

                                            <button
                                                onClick={handleOpenRemoveConfirmModal}
                                                className="btn btn-error text-white"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }
                </div>
            </dialog>

            {/* Removal confirmation modal */}
f
            <dialog ref={confirmRemoveModalRef} className="modal modal-middle">
                <div className="modal-box max-w-md">
                    <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-lg">Remove Supervisee</p>
                        <button
                            className="btn btn-sm btn-circle btn-ghost"
                            onClick={handleCloseRemoveConfirmModal}
                        >
                            ✕
                        </button>
                    </div>

                    <p className="py-3 text-sm text-gray-600">
                        Are you sure you want to remove this supervisee?
                    </p>

                    <div className="flex justify-end gap-2 mt-2">
                        <button className="btn btn-soft" onClick={handleCloseRemoveConfirmModal}>
                            Cancel
                        </button>

                        <button
                            className="w-25 btn bg-[#1E40AF] text-white transition-colors hover:bg-blue-600 duration-500 cursor-pointer"
                            disabled={loadingRemoveSupervisee}
                            onClick={handleRemoveSupervisee}
                        >
                            {
                                loadingRemoveSupervisee ? (
                                    <span className="loading loading-dots loading-md"></span>
                                ) : (
                                    "Remove"
                                )
                            }
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
};

export default FacultyMySupervises;