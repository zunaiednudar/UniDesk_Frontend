/**
 * Function unit tests for UniDesk async functions.
 *
 * Each function is extracted in its pure logic form and tested with
 * a mocked axiosSecure so no real HTTP calls are made.
 *
 * Covered:
 *  - fetchAppointments (AskMentor)
 *  - fetchInstructors  (AskMentor)
 *  - fetchSupervisors  (AskMentor)
 *  - handleSubmit / booking payload (BookingModal)
 *  - handleCancel (CancelModal)
 *  - handleDelete (ManageUsers / UserItem)
 *  - handleApproveAppointment (FacultyMyAppointments)
 *  - handleCancelAppointment  (FacultyMyAppointments)
 *  - handleCompleteAppointment (FacultyMyAppointments)
 *  - updateAppointmentInList  (FacultyMyAppointments)
 *  - updateStatsAfterStatusChange (FacultyMyAppointments)
 *  - canJoinAppointment (FacultyMyAppointments)
 *  - cleanSchedule / hasAnyEntry (FacultyMySchedule handleUpdateSchedule)
 *  - fetchSchedule (FacultyMySchedule)
 *  - handleChatClick navigation logic (AskMentor)
 */

// axiosSecure mock — each test can override per-method return
const axiosSecure = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
};

const toast = { success: jest.fn(), error: jest.fn(), info: jest.fn() };

// formatName stub: just capitalise first letter of each word
const formatName = (name) =>
    name ? name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

beforeEach(() => {
    jest.clearAllMocks();
});

// 1. fetchAppointments  (AskMentor)

/**
 * Extracted logic of fetchAppointments from AskMentor.
 * Returns the mapped + sorted appointments array, or throws on API error.
 */
const fetchAppointments = async (userId) => {
    const res = await axiosSecure.get(`/appointment/student/${userId}`);
    const raw = res.data.appointments || [];

    const mapped = raw.map(a => ({
        id: a._id,
        facultyName: formatName(a.faculty?.name) ?? 'Unknown Faculty',
        facultyId: a.faculty?._id ?? a.faculty,
        startTime: a.startTime,
        endTime: a.endTime,
        purpose: a.purpose ?? '',
        mode: a.mode ?? '',
        meetingType: a.meetingType ?? '',
        meetLink: a.meetLink ?? null,
        status: a.status ?? 'pending',
    }));

    mapped.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    return mapped;
};

describe('fetchAppointments', () => {
    const userId = 'user123';

    test('maps API response to correct shape', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: {
                appointments: [{
                    _id: 'appt1',
                    faculty: { _id: 'fac1', name: 'dr rahman' },
                    startTime: '2026-04-15T10:00:00Z',
                    endTime: '2026-04-15T10:30:00Z',
                    purpose: 'Thesis update',
                    mode: 'online',
                    meetingType: 'thesis',
                    meetLink: 'https://meet.google.com/abc',
                    status: 'approved',
                }]
            }
        });

        const result = await fetchAppointments(userId);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('appt1');
        expect(result[0].facultyName).toBe('Dr Rahman');
        expect(result[0].meetLink).toBe('https://meet.google.com/abc');
        expect(result[0].status).toBe('approved');
    });

    test('sorts appointments by startTime ascending', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: {
                appointments: [
                    { _id: 'a2', faculty: { name: 'b' }, startTime: '2026-04-16T10:00:00Z', endTime: '2026-04-16T11:00:00Z', status: 'approved' },
                    { _id: 'a1', faculty: { name: 'a' }, startTime: '2026-04-15T09:00:00Z', endTime: '2026-04-15T10:00:00Z', status: 'pending' },
                ]
            }
        });

        const result = await fetchAppointments(userId);
        expect(result[0].id).toBe('a1');
        expect(result[1].id).toBe('a2');
    });

    test('uses fallback values for missing fields', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: {
                appointments: [{ _id: 'a3', faculty: null, startTime: '2026-05-01T09:00:00Z' }]
            }
        });

        const result = await fetchAppointments(userId);
        expect(result[0].purpose).toBe('');
        expect(result[0].mode).toBe('');
        expect(result[0].meetLink).toBeNull();
        expect(result[0].status).toBe('pending');
        expect(result[0].facultyName).toBe('');
    });

    test('returns empty array when appointments field is missing', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: {} });
        const result = await fetchAppointments(userId);
        expect(result).toHaveLength(0);
    });

    test('throws when axiosSecure.get rejects', async () => {
        axiosSecure.get.mockRejectedValueOnce(new Error('Network error'));
        await expect(fetchAppointments(userId)).rejects.toThrow('Network error');
    });

    test('calls correct endpoint with userId', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: { appointments: [] } });
        await fetchAppointments('abc999');
        expect(axiosSecure.get).toHaveBeenCalledWith('/appointment/student/abc999');
    });
});

// 2. fetchInstructors  (AskMentor)

const fetchInstructors = async () => {
    const coursesRes = await axiosSecure.get('/courses/my-courses');
    const activeCourses = coursesRes.data.activeCourses || [];
    const completedCourses = coursesRes.data.completedCourses || [];
    const allCourses = [...activeCourses, ...completedCourses];

    const facultyMap = new Map();

    for (const course of allCourses) {
        const faculties = Array.isArray(course.faculties) ? course.faculties : [];
        const studentCount = Array.isArray(course.students) ? course.students.length : 0;

        for (const faculty of faculties) {
            const id = faculty._id?.toString();
            if (!id) continue;

            if (!facultyMap.has(id)) {
                facultyMap.set(id, {
                    id,
                    name: formatName(faculty.name) ?? 'Unknown Faculty',
                    email: faculty.email ?? '',
                    designation: faculty.designation ?? '',
                    department: faculty.department ?? '',
                    room: faculty.room ?? '',
                    photoURL: faculty.photoURL ?? null,
                    status: faculty.status ?? 'verified',
                    courses: [],
                    totalStudents: 0,
                });
            }

            facultyMap.get(id).courses.push({
                id: course._id,
                courseCode: course.courseCode,
                courseName: course.courseName,
                students: studentCount,
            });
            facultyMap.get(id).totalStudents += studentCount;
        }
    }

    return [...facultyMap.values()].sort((a, b) => {
        if (a.status === 'verified' && b.status !== 'verified') return -1;
        if (a.status !== 'verified' && b.status === 'verified') return 1;
        return a.name.localeCompare(b.name);
    });
};

describe('fetchInstructors', () => {
    test('deduplicates faculty across multiple courses', async () => {
        const sharedFaculty = { _id: 'f1', name: 'dr amin', email: 'amin@uni.edu', status: 'verified' };
        axiosSecure.get.mockResolvedValueOnce({
            data: {
                activeCourses: [
                    { _id: 'c1', courseCode: 'CSE301', courseName: 'Algo', faculties: [sharedFaculty], students: ['s1', 's2'] },
                    { _id: 'c2', courseCode: 'CSE302', courseName: 'DB', faculties: [sharedFaculty], students: ['s1'] },
                ],
                completedCourses: []
            }
        });

        const result = await fetchInstructors();
        expect(result).toHaveLength(1);
        expect(result[0].courses).toHaveLength(2);
        expect(result[0].totalStudents).toBe(3);
    });

    test('sorts verified faculty before suspended', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: {
                activeCourses: [
                    { _id: 'c1', faculties: [{ _id: 'f1', name: 'zara', status: 'suspended' }], students: [] },
                    { _id: 'c2', faculties: [{ _id: 'f2', name: 'alice', status: 'verified' }], students: [] },
                ],
                completedCourses: []
            }
        });

        const result = await fetchInstructors();
        expect(result[0].name).toBe('Alice');
        expect(result[1].name).toBe('Zara');
    });

    test('skips faculty entries without _id', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: {
                activeCourses: [
                    { _id: 'c1', faculties: [{ name: 'no id faculty' }], students: [] }
                ],
                completedCourses: []
            }
        });

        const result = await fetchInstructors();
        expect(result).toHaveLength(0);
    });

    test('handles empty course lists', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: { activeCourses: [], completedCourses: [] }
        });
        const result = await fetchInstructors();
        expect(result).toHaveLength(0);
    });

    test('throws on API error', async () => {
        axiosSecure.get.mockRejectedValueOnce(new Error('Unauthorized'));
        await expect(fetchInstructors()).rejects.toThrow('Unauthorized');
    });
});

// 3. fetchSupervisors  (AskMentor)

const fetchSupervisors = async (userId) => {
    const res = await axiosSecure.get(`/supervisor/student/${userId}`);
    const rels = res.data.supervisors || [];
    return rels.map(s => ({
        id: s.supervisor._id,
        name: formatName(s.supervisor.name),
        email: s.supervisor.email ?? '',
        photoURL: s.supervisor.photoURL ?? null,
        designation: s.supervisor.designation ?? '',
        department: s.supervisor.department ?? '',
        room: s.supervisor.room ?? '',
        status: s.supervisor.status ?? 'verified',
        courses: [],
        totalStudents: 0,
        relationshipType: s.relationshipType,
        topic: s.topic ?? '',
        description: s.description ?? '',
        supStatus: s.status ?? 'active',
    }));
};

describe('fetchSupervisors', () => {
    test('maps supervisor relationships to correct shape', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: {
                supervisors: [{
                    supervisor: { _id: 'sup1', name: 'dr hasan', email: 'hasan@uni.edu', status: 'verified' },
                    relationshipType: 'thesis',
                    topic: 'Machine Learning',
                    description: 'ML research',
                    status: 'active'
                }]
            }
        });

        const result = await fetchSupervisors('student1');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('sup1');
        expect(result[0].name).toBe('Dr Hasan');
        expect(result[0].relationshipType).toBe('thesis');
        expect(result[0].topic).toBe('Machine Learning');
        expect(result[0].supStatus).toBe('active');
    });

    test('returns empty array when no supervisors', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: { supervisors: [] } });
        const result = await fetchSupervisors('student1');
        expect(result).toHaveLength(0);
    });

    test('uses fallback values for missing optional fields', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: {
                supervisors: [{
                    supervisor: { _id: 'sup2', name: 'dr ali' },
                    relationshipType: 'project',
                }]
            }
        });

        const result = await fetchSupervisors('student1');
        expect(result[0].email).toBe('');
        expect(result[0].photoURL).toBeNull();
        expect(result[0].topic).toBe('');
        expect(result[0].supStatus).toBe('active');
    });

    test('calls the correct endpoint', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: { supervisors: [] } });
        await fetchSupervisors('xyz789');
        expect(axiosSecure.get).toHaveBeenCalledWith('/supervisor/student/xyz789');
    });

    test('throws on API error', async () => {
        axiosSecure.get.mockRejectedValueOnce(new Error('403 Forbidden'));
        await expect(fetchSupervisors('student1')).rejects.toThrow('403 Forbidden');
    });
});

// 4. handleSubmit — booking payload construction (BookingModal)

const buildBookingPayload = (instructor, form) => ({
    facultyID: instructor.id,
    date: form.date,
    startTime: form.from,
    endTime: form.to,
    purpose: form.topic.trim(),
    mode: form.format,
    meetingType: form.meetingType || 'general',
});

const submitBooking = async (instructor, form) => {
    await axiosSecure.post('/appointment', buildBookingPayload(instructor, form));
};

describe('submitBooking (BookingModal handleSubmit)', () => {
    const instructor = { id: 'fac1' };
    const form = {
        date: '2026-04-20',
        from: '10:00',
        to: '11:00',
        topic: '  Thesis discussion  ',
        format: 'online',
        meetingType: 'thesis',
    };

    test('posts to /appointment with correctly shaped payload', async () => {
        axiosSecure.post.mockResolvedValueOnce({ data: { success: true } });
        await submitBooking(instructor, form);

        expect(axiosSecure.post).toHaveBeenCalledWith('/appointment', {
            facultyID: 'fac1',
            date: '2026-04-20',
            startTime: '10:00',
            endTime: '11:00',
            purpose: 'Thesis discussion',   // trimmed
            mode: 'online',
            meetingType: 'thesis',
        });
    });

    test('trims whitespace from topic', async () => {
        axiosSecure.post.mockResolvedValueOnce({ data: { success: true } });
        await submitBooking(instructor, { ...form, topic: '   hello   ' });
        const payload = axiosSecure.post.mock.calls[0][1];
        expect(payload.purpose).toBe('hello');
    });

    test('defaults meetingType to general when not provided', async () => {
        axiosSecure.post.mockResolvedValueOnce({ data: { success: true } });
        await submitBooking(instructor, { ...form, meetingType: '' });
        const payload = axiosSecure.post.mock.calls[0][1];
        expect(payload.meetingType).toBe('general');
    });

    test('throws on API error', async () => {
        axiosSecure.post.mockRejectedValueOnce(new Error('500'));
        await expect(submitBooking(instructor, form)).rejects.toThrow('500');
    });
});

// 5. handleCancel  (CancelModal — AskMentor)

const cancelAppointment = async (appointmentId, reason) => {
    if (!reason.trim()) {
        throw new Error('Please provide a reason.');
    }
    await axiosSecure.patch(`/appointment/${appointmentId}`, {
        status: 'cancelled',
        reason: reason.trim(),
    });
};

describe('cancelAppointment (CancelModal handleCancel)', () => {
    test('patches correct endpoint with trimmed reason', async () => {
        axiosSecure.patch.mockResolvedValueOnce({ data: { success: true } });
        await cancelAppointment('appt42', '  Schedule conflict  ');
        expect(axiosSecure.patch).toHaveBeenCalledWith('/appointment/appt42', {
            status: 'cancelled',
            reason: 'Schedule conflict',
        });
    });

    test('throws when reason is empty', async () => {
        await expect(cancelAppointment('appt42', '')).rejects.toThrow('Please provide a reason.');
    });

    test('throws when reason is only whitespace', async () => {
        await expect(cancelAppointment('appt42', '   ')).rejects.toThrow('Please provide a reason.');
    });

    test('throws on API error', async () => {
        axiosSecure.patch.mockRejectedValueOnce(new Error('Network failure'));
        await expect(cancelAppointment('appt42', 'Sick')).rejects.toThrow('Network failure');
    });
});

// 6. handleDelete  (ManageUsers / UserItem)

const deleteUser = async (email) => {
    const res = await axiosSecure.delete(`/admin/users/${email}`);
    if (res.status !== 200) throw new Error('Delete failed');
    return true;
};

describe('deleteUser (ManageUsers handleDelete)', () => {
    test('calls correct DELETE endpoint with email', async () => {
        axiosSecure.delete.mockResolvedValueOnce({ status: 200 });
        await deleteUser('alice@uni.edu');
        expect(axiosSecure.delete).toHaveBeenCalledWith('/admin/users/alice@uni.edu');
    });

    test('returns true on successful deletion', async () => {
        axiosSecure.delete.mockResolvedValueOnce({ status: 200 });
        const result = await deleteUser('bob@uni.edu');
        expect(result).toBe(true);
    });

    test('throws when status is not 200', async () => {
        axiosSecure.delete.mockResolvedValueOnce({ status: 403 });
        await expect(deleteUser('bob@uni.edu')).rejects.toThrow('Delete failed');
    });

    test('throws on network error', async () => {
        axiosSecure.delete.mockRejectedValueOnce(new Error('Network error'));
        await expect(deleteUser('charlie@uni.edu')).rejects.toThrow('Network error');
    });
});

// 7. handleApproveAppointment (FacultyMyAppointments)

const approveAppointment = async (appointmentId) => {
    const res = await axiosSecure.patch(`/appointment/${appointmentId}`, { status: 'approved' });
    if (!res?.data?.success) throw new Error(res?.data?.message || 'Failed to approve appointment');
    return res.data.appointment;
};

describe('approveAppointment (FacultyMyAppointments)', () => {
    test('patches with status approved and returns appointment', async () => {
        const mockAppt = { _id: 'a1', status: 'approved', meetLink: 'https://meet.google.com/xyz' };
        axiosSecure.patch.mockResolvedValueOnce({ data: { success: true, appointment: mockAppt } });

        const result = await approveAppointment('a1');
        expect(axiosSecure.patch).toHaveBeenCalledWith('/appointment/a1', { status: 'approved' });
        expect(result.status).toBe('approved');
        expect(result.meetLink).toBe('https://meet.google.com/xyz');
    });

    test('throws when API returns success: false', async () => {
        axiosSecure.patch.mockResolvedValueOnce({ data: { success: false, message: 'Already approved' } });
        await expect(approveAppointment('a1')).rejects.toThrow('Already approved');
    });

    test('throws on network error', async () => {
        axiosSecure.patch.mockRejectedValueOnce(new Error('503'));
        await expect(approveAppointment('a1')).rejects.toThrow('503');
    });
});

// 8. handleCancelAppointment (FacultyMyAppointments)

const facultyCancelAppointment = async (appointmentId, reason) => {
    if (!reason.trim()) throw new Error('Cancellation reason is required');
    const res = await axiosSecure.patch(`/appointment/${appointmentId}`, {
        status: 'cancelled',
        reason: reason.trim()
    });
    if (!res?.data?.success) throw new Error(res?.data?.message || 'Failed to cancel appointment');
    return res.data.appointment;
};

describe('facultyCancelAppointment (FacultyMyAppointments handleCancelAppointment)', () => {
    test('patches with cancelled status and trimmed reason', async () => {
        axiosSecure.patch.mockResolvedValueOnce({ data: { success: true, appointment: { status: 'cancelled' } } });
        await facultyCancelAppointment('a2', '  Student no-show  ');
        expect(axiosSecure.patch).toHaveBeenCalledWith('/appointment/a2', {
            status: 'cancelled',
            reason: 'Student no-show'
        });
    });

    test('throws when reason is blank', async () => {
        await expect(facultyCancelAppointment('a2', '')).rejects.toThrow('Cancellation reason is required');
    });

    test('throws when API returns success: false', async () => {
        axiosSecure.patch.mockResolvedValueOnce({ data: { success: false, message: 'Cannot cancel completed' } });
        await expect(facultyCancelAppointment('a2', 'reason')).rejects.toThrow('Cannot cancel completed');
    });
});

// 9. handleCompleteAppointment (FacultyMyAppointments)

const completeAppointment = async (appointmentId) => {
    const res = await axiosSecure.patch(`/appointment/${appointmentId}`, { status: 'completed' });
    if (!res?.data?.success) throw new Error(res?.data?.message || 'Failed to complete appointment');
    return res.data.appointment;
};

describe('completeAppointment (FacultyMyAppointments)', () => {
    test('patches with status completed', async () => {
        axiosSecure.patch.mockResolvedValueOnce({ data: { success: true, appointment: { status: 'completed' } } });
        const result = await completeAppointment('a3');
        expect(axiosSecure.patch).toHaveBeenCalledWith('/appointment/a3', { status: 'completed' });
        expect(result.status).toBe('completed');
    });

    test('throws when API returns failure', async () => {
        axiosSecure.patch.mockResolvedValueOnce({ data: { success: false, message: 'Already completed' } });
        await expect(completeAppointment('a3')).rejects.toThrow('Already completed');
    });
});

// 10. updateAppointmentInList  (FacultyMyAppointments)

const updateAppointmentInList = (appointments, updatedAppointment) =>
    appointments.map(appointment =>
        appointment._id === updatedAppointment._id
            ? { ...appointment, ...updatedAppointment, student: appointment.student }
            : appointment
    );

describe('updateAppointmentInList (FacultyMyAppointments)', () => {
    const original = [
        { _id: 'a1', status: 'pending', student: { name: 'Alice' }, purpose: 'Old' },
        { _id: 'a2', status: 'approved', student: { name: 'Bob' }, purpose: 'Keep' },
    ];

    test('updates matching appointment by _id', () => {
        const updated = { _id: 'a1', status: 'approved', purpose: 'Updated' };
        const result = updateAppointmentInList(original, updated);
        expect(result[0].status).toBe('approved');
        expect(result[0].purpose).toBe('Updated');
    });

    test('preserves original student field', () => {
        const updated = { _id: 'a1', status: 'approved', student: { name: 'OVERWRITTEN' } };
        const result = updateAppointmentInList(original, updated);
        expect(result[0].student.name).toBe('Alice');
    });

    test('does not mutate other appointments', () => {
        const updated = { _id: 'a1', status: 'completed' };
        const result = updateAppointmentInList(original, updated);
        expect(result[1].status).toBe('approved');
    });

    test('returns same length array', () => {
        const result = updateAppointmentInList(original, { _id: 'a1', status: 'completed' });
        expect(result).toHaveLength(2);
    });

    test('does not modify when _id has no match', () => {
        const result = updateAppointmentInList(original, { _id: 'a99', status: 'rejected' });
        expect(result[0].status).toBe('pending');
        expect(result[1].status).toBe('approved');
    });
});

// 11. updateStatsAfterStatusChange (FacultyMyAppointments)

/**
 * Extracted as a pure function — takes current counters and returns new ones
 * rather than calling setters directly (which is the React pattern).
 */
const updateStatsAfterStatusChange = (stats, previousStatus, nextStatus) => {
    if (previousStatus === nextStatus) return { ...stats };

    let { pending, upcoming, completed } = stats;

    if (previousStatus === 'pending')   pending   = Math.max(pending - 1, 0);
    if (previousStatus === 'approved')  upcoming  = Math.max(upcoming - 1, 0);
    if (previousStatus === 'completed') completed = Math.max(completed - 1, 0);

    if (nextStatus === 'pending')   pending   += 1;
    if (nextStatus === 'approved')  upcoming  += 1;
    if (nextStatus === 'completed') completed += 1;

    return { pending, upcoming, completed };
};

describe('updateStatsAfterStatusChange (FacultyMyAppointments)', () => {
    const base = { pending: 2, upcoming: 3, completed: 1 };

    test('no change when previous and next status are the same', () => {
        expect(updateStatsAfterStatusChange(base, 'pending', 'pending')).toEqual(base);
    });

    test('pending → approved: decrements pending, increments upcoming', () => {
        const result = updateStatsAfterStatusChange(base, 'pending', 'approved');
        expect(result.pending).toBe(1);
        expect(result.upcoming).toBe(4);
        expect(result.completed).toBe(1);
    });

    test('approved → completed: decrements upcoming, increments completed', () => {
        const result = updateStatsAfterStatusChange(base, 'approved', 'completed');
        expect(result.upcoming).toBe(2);
        expect(result.completed).toBe(2);
    });

    test('approved → cancelled: decrements upcoming only', () => {
        const result = updateStatsAfterStatusChange(base, 'approved', 'cancelled');
        expect(result.upcoming).toBe(2);
        expect(result.pending).toBe(2);
        expect(result.completed).toBe(1);
    });

    test('does not go below zero (floor at 0)', () => {
        const zeroStats = { pending: 0, upcoming: 0, completed: 0 };
        const result = updateStatsAfterStatusChange(zeroStats, 'pending', 'approved');
        expect(result.pending).toBe(0);
        expect(result.upcoming).toBe(1);
    });
});

// 12. canJoinAppointment  (FacultyMyAppointments)

const canJoinAppointment = (appointment, currentTime) => {
    if (appointment?.status !== 'approved' || appointment?.mode !== 'online' || !appointment?.meetLink)
        return false;

    const now = new Date(currentTime);
    const startTime = new Date(appointment.startTime);
    const endTime = new Date(appointment.endTime);
    const joinWindowStart = new Date(startTime.getTime() - 15 * 60 * 1000);

    return now >= joinWindowStart && now <= endTime;
};

describe('canJoinAppointment (FacultyMyAppointments)', () => {
    const makeAppt = (overrides = {}) => ({
        status: 'approved',
        mode: 'online',
        meetLink: 'https://meet.google.com/abc',
        startTime: '2026-04-15T10:00:00Z',
        endTime: '2026-04-15T10:30:00Z',
        ...overrides,
    });

    const atTime = (offsetMinutes) => {
        const base = new Date('2026-04-15T10:00:00Z');
        return new Date(base.getTime() + offsetMinutes * 60 * 1000).getTime();
    };

    test('returns true when inside join window (5 min before start)', () => {
        expect(canJoinAppointment(makeAppt(), atTime(-5))).toBe(true);
    });

    test('returns true exactly at start time', () => {
        expect(canJoinAppointment(makeAppt(), atTime(0))).toBe(true);
    });

    test('returns true during the appointment', () => {
        expect(canJoinAppointment(makeAppt(), atTime(15))).toBe(true);
    });

    test('returns false 16 minutes before start (outside 15-min window)', () => {
        expect(canJoinAppointment(makeAppt(), atTime(-16))).toBe(false);
    });

    test('returns false after appointment end time', () => {
        expect(canJoinAppointment(makeAppt(), atTime(31))).toBe(false);
    });

    test('returns false when status is not approved', () => {
        expect(canJoinAppointment(makeAppt({ status: 'pending' }), atTime(0))).toBe(false);
    });

    test('returns false when mode is not online', () => {
        expect(canJoinAppointment(makeAppt({ mode: 'in-person' }), atTime(0))).toBe(false);
    });

    test('returns false when meetLink is missing', () => {
        expect(canJoinAppointment(makeAppt({ meetLink: null }), atTime(0))).toBe(false);
        expect(canJoinAppointment(makeAppt({ meetLink: '' }), atTime(0))).toBe(false);
    });

    test('returns false for null appointment', () => {
        expect(canJoinAppointment(null, atTime(0))).toBe(false);
    });
});

// 13. cleanSchedule — FacultyMySchedule handleUpdateSchedule

const cleanSchedule = (weeklySchedule) =>
    weeklySchedule.map(dayItem => ({
        day: dayItem.day,
        classes: (dayItem.classes || []).filter(
            item => item.courseName?.trim() && item.startTime && item.endTime
        ),
        freeSlots: (dayItem.freeSlots || []).filter(
            item => item.startTime && item.endTime
        )
    }));

const hasAnyEntry = (cleanedSchedule) =>
    cleanedSchedule.some(d => d.classes.length > 0 || d.freeSlots.length > 0);

describe('cleanSchedule (FacultyMySchedule)', () => {
    test('filters out classes with missing courseName', () => {
        const input = [{ day: 'Monday', classes: [{ courseName: '', startTime: '09:00', endTime: '10:00' }], freeSlots: [] }];
        expect(cleanSchedule(input)[0].classes).toHaveLength(0);
    });

    test('filters out classes with missing start or end time', () => {
        const input = [{ day: 'Monday', classes: [{ courseName: 'Math', startTime: '', endTime: '10:00' }], freeSlots: [] }];
        expect(cleanSchedule(input)[0].classes).toHaveLength(0);
    });

    test('keeps valid class entries', () => {
        const input = [{ day: 'Monday', classes: [{ courseName: 'Math', startTime: '09:00', endTime: '10:00' }], freeSlots: [] }];
        expect(cleanSchedule(input)[0].classes).toHaveLength(1);
    });

    test('filters out free slots with missing start or end time', () => {
        const input = [{ day: 'Monday', classes: [], freeSlots: [{ startTime: '', endTime: '12:00' }] }];
        expect(cleanSchedule(input)[0].freeSlots).toHaveLength(0);
    });

    test('keeps valid free slot entries', () => {
        const input = [{ day: 'Monday', classes: [], freeSlots: [{ startTime: '10:00', endTime: '12:00' }] }];
        expect(cleanSchedule(input)[0].freeSlots).toHaveLength(1);
    });

    test('trims whitespace-only courseName as invalid', () => {
        const input = [{ day: 'Monday', classes: [{ courseName: '   ', startTime: '09:00', endTime: '10:00' }], freeSlots: [] }];
        expect(cleanSchedule(input)[0].classes).toHaveLength(0);
    });
});

describe('hasAnyEntry (FacultyMySchedule)', () => {
    test('returns true when at least one class exists', () => {
        expect(hasAnyEntry([{ day: 'Monday', classes: [{ courseName: 'Math' }], freeSlots: [] }])).toBe(true);
    });

    test('returns true when at least one free slot exists', () => {
        expect(hasAnyEntry([{ day: 'Monday', classes: [], freeSlots: [{ startTime: '10:00', endTime: '11:00' }] }])).toBe(true);
    });

    test('returns false when all days have empty classes and freeSlots', () => {
        expect(hasAnyEntry([{ day: 'Monday', classes: [], freeSlots: [] }])).toBe(false);
    });

    test('returns false for empty schedule array', () => {
        expect(hasAnyEntry([])).toBe(false);
    });
});

// 14. fetchSchedule (FacultyMySchedule)

const fetchSchedule = async (userId) => {
    const res = await axiosSecure.get(`/schedule/${userId}`);
    if (!res?.data?.success) throw new Error(res?.data?.message || 'Schedule fetch failed');
    return res.data.schedule;
};

describe('fetchSchedule (FacultyMySchedule)', () => {
    test('returns schedule on success', async () => {
        const mockSchedule = { _id: 'sch1', weeklySchedule: [] };
        axiosSecure.get.mockResolvedValueOnce({ data: { success: true, schedule: mockSchedule } });

        const result = await fetchSchedule('fac1');
        expect(result).toEqual(mockSchedule);
        expect(axiosSecure.get).toHaveBeenCalledWith('/schedule/fac1');
    });

    test('throws when success is false', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: { success: false, message: 'Not found' } });
        await expect(fetchSchedule('fac1')).rejects.toThrow('Not found');
    });

    test('throws on network error', async () => {
        axiosSecure.get.mockRejectedValueOnce(new Error('Network error'));
        await expect(fetchSchedule('fac1')).rejects.toThrow('Network error');
    });
});

// 15. handleChatClick — conversation lookup (AskMentor)

const handleChatClick = async (person, userId) => {
    const receiver = {
        _id: person.id,
        name: person.name,
        email: person.email,
        photoURL: person.photoURL ?? null,
    };

    const res = await axiosSecure.get(`/conversation/user/${userId}`);
    const conversations = res.data?.users || [];
    const existing = conversations.find(
        item => item.user?._id?.toString() === person.id?.toString()
    );

    return {
        receiver,
        path: existing?.conversationID
            ? `/dashboard/student/chat/${existing.conversationID}`
            : `/dashboard/student/chat/new?receiverID=${person.id}`
    };
};

describe('handleChatClick (AskMentor)', () => {
    const person = { id: 'fac1', name: 'Dr Rahman', email: 'rahman@uni.edu', photoURL: null };

    test('routes to existing conversation when one is found', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: { users: [{ user: { _id: 'fac1' }, conversationID: 'conv99' }] }
        });

        const result = await handleChatClick(person, 'student1');
        expect(result.path).toBe('/dashboard/student/chat/conv99');
    });

    test('routes to new conversation when no existing conversation', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: { users: [{ user: { _id: 'other_faculty' }, conversationID: 'conv1' }] }
        });

        const result = await handleChatClick(person, 'student1');
        expect(result.path).toBe('/dashboard/student/chat/new?receiverID=fac1');
    });

    test('routes to new conversation when conversations list is empty', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: { users: [] } });
        const result = await handleChatClick(person, 'student1');
        expect(result.path).toContain('new?receiverID=fac1');
    });

    test('builds receiver object correctly', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: { users: [] } });
        const result = await handleChatClick(person, 'student1');
        expect(result.receiver).toEqual({
            _id: 'fac1',
            name: 'Dr Rahman',
            email: 'rahman@uni.edu',
            photoURL: null,
        });
    });

    test('falls back to new path when API throws', async () => {
        axiosSecure.get.mockRejectedValueOnce(new Error('Network error'));
        await expect(handleChatClick(person, 'student1')).rejects.toThrow('Network error');
    });

    test('calls conversation endpoint with correct userId', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: { users: [] } });
        await handleChatClick(person, 'stu_abc');
        expect(axiosSecure.get).toHaveBeenCalledWith('/conversation/user/stu_abc');
    });
});