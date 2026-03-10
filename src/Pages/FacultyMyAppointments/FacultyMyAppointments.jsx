import React, { useContext, useEffect, useState } from 'react';
import axiosSecure from '../../utils/axiosSecure.js';
import { AuthContext } from '../../Providers/AuthProvider/AuthProvider.jsx';
import { toast } from 'sonner';
import PaginationTemplate from '../../Components/PaginationTemplate/PaginationTemplate';

const FacultyMyAppointments = () => {
    const { userData } = useContext(AuthContext);

    // Filtering

    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages,setTotalPages]=useState(1);

    // Appointments data

    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [completedAppointments, setCompletedAppointments] = useState([]);

    // Loading states

    const [loadingAppointments, setLoadingAppointments] = useState(true);

    // Appointments fetch

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                setLoadingAppointments(true);
                const res = await axiosSecure.get(`/appointment/faculty/${userData?._id}`, {
                    params: {
                        page,
                        status
                    }
                });

                if (!res?.data?.success) {
                    toast.error(res?.data?.success);
                    return;
                }

                const appointments = res?.data?.appointments;

                setPendingAppointments(appointments.filter(appointment => appointment.status === "pending"));
                setCompletedAppointments(appointments.filter(appointment => appointment.status === "completed"));
                setUpcomingAppointments(appointments.filter(appointment => appointment.status === "approved"));

            } catch (error) {
                toast.error("Appointments fetch failed");
            } finally {
                setLoadingAppointments(false);
            }
        };

        if (userData?._id)
            fetchAppointments();
    }, [userData?._id, page, status])

    console.log(upcomingAppointments, pendingAppointments, completedAppointments);

    return (
        <div className='w-full max-w-full p-5 flex flex-col gap-10 gilroy'>
            <div className='w-full max-w-full'>
                <p className='text-3xl graphik font-bold text-black'>My Appointments</p>
                <p className='text-gray-500'>Manage your student appointments</p>
            </div>
            <select
                value={status}
                onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                }}
                className="select select-bordered w-25 outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Upcoming</option>
                <option value="completed">Completed</option>
            </select>

            <div className='w-full md:flex-2  flex flex-col gap-5'>
                <div className='mx-auto'>
                    <PaginationTemplate
                        page={page}
                        totalPages={totalPages}
                        onChange={setPage}></PaginationTemplate>
                </div>
            </div>
        </div>
    );
};

export default FacultyMyAppointments;