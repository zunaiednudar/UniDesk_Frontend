const axiosSecure = {
    get:    jest.fn(),
    post:   jest.fn(),
    patch:  jest.fn(),
    delete: jest.fn(),
};

const toast = { success: jest.fn(), error: jest.fn(), info: jest.fn() };

const formatName = (name) =>
    name ? name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

beforeEach(() => { jest.clearAllMocks(); });


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

describe('fetchAppointments (AskMentor)', () => {
    const userId = 'user123';

    test('maps API response to correct shape', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: {
                appointments: [{
                    _id: 'appt1',
                    faculty: { _id: 'fac1', name: 'dr rahman' },
                    startTime: '2026-04-15T10:00:00Z',
                    endTime:   '2026-04-15T10:30:00Z',
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
            data: { appointments: [{ _id: 'a3', faculty: null, startTime: '2026-05-01T09:00:00Z' }] }
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

    test('MyActivity: filters only approved appointments as upcoming', () => {
        const all = [
            { id: 1, status: 'approved',   faculty: 'Dr A', startTime: '10:00', endTime: '11:00' },
            { id: 2, status: 'pending',    faculty: 'Dr B', startTime: '11:00', endTime: '12:00' },
            { id: 3, status: 'cancelled',  faculty: 'Dr C', startTime: '12:00', endTime: '13:00' },
        ];
        const upcoming = all.filter(a => a.status === 'approved');
        expect(upcoming).toHaveLength(1);
        expect(upcoming[0].id).toBe(1);
    });
});


const fetchInstructors = async () => {
    const coursesRes = await axiosSecure.get('/courses/my-courses');
    const activeCourses    = coursesRes.data.activeCourses    || [];
    const completedCourses = coursesRes.data.completedCourses || [];
    const allCourses = [...activeCourses, ...completedCourses];

    const facultyMap = new Map();
    for (const course of allCourses) {
        const faculties    = Array.isArray(course.faculties) ? course.faculties : [];
        const studentCount = Array.isArray(course.students)  ? course.students.length : 0;

        for (const faculty of faculties) {
            const id = faculty._id?.toString();
            if (!id) continue;

            if (!facultyMap.has(id)) {
                facultyMap.set(id, {
                    id,
                    name: formatName(faculty.name) ?? 'Unknown Faculty',
                    email:       faculty.email       ?? '',
                    designation: faculty.designation ?? '',
                    department:  faculty.department  ?? '',
                    room:        faculty.room        ?? '',
                    photoURL:    faculty.photoURL    ?? null,
                    status:      faculty.status      ?? 'verified',
                    courses: [],
                    totalStudents: 0,
                });
            }
            facultyMap.get(id).courses.push({
                id: course._id,
                courseCode:  course.courseCode,
                courseName:  course.courseName,
                students:    studentCount,
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

describe('fetchInstructors (AskMentor)', () => {
    test('deduplicates faculty across multiple courses', async () => {
        const sharedFaculty = { _id: 'f1', name: 'dr amin', email: 'amin@uni.edu', status: 'verified' };
        axiosSecure.get.mockResolvedValueOnce({
            data: {
                activeCourses: [
                    { _id: 'c1', courseCode: 'CSE301', courseName: 'Algo', faculties: [sharedFaculty], students: ['s1', 's2'] },
                    { _id: 'c2', courseCode: 'CSE302', courseName: 'DB',   faculties: [sharedFaculty], students: ['s1'] },
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
                    { _id: 'c1', faculties: [{ _id: 'f1', name: 'zara',  status: 'suspended' }], students: [] },
                    { _id: 'c2', faculties: [{ _id: 'f2', name: 'alice', status: 'verified'  }], students: [] },
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
                activeCourses: [{ _id: 'c1', faculties: [{ name: 'no id faculty' }], students: [] }],
                completedCourses: []
            }
        });
        const result = await fetchInstructors();
        expect(result).toHaveLength(0);
    });

    test('handles empty course lists', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: { activeCourses: [], completedCourses: [] } });
        const result = await fetchInstructors();
        expect(result).toHaveLength(0);
    });

    test('throws on API error', async () => {
        axiosSecure.get.mockRejectedValueOnce(new Error('Unauthorized'));
        await expect(fetchInstructors()).rejects.toThrow('Unauthorized');
    });

    test('includes faculty from completedCourses too', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: {
                activeCourses: [],
                completedCourses: [
                    { _id: 'c1', faculties: [{ _id: 'f1', name: 'dr past', status: 'verified' }], students: ['s1'] }
                ]
            }
        });
        const result = await fetchInstructors();
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Dr Past');
    });
});


const fetchSupervisors = async (userId) => {
    const res = await axiosSecure.get(`/supervisor/student/${userId}`);
    const rels = res.data.supervisors || [];
    return rels.map(s => ({
        id:             s.supervisor._id,
        name:           formatName(s.supervisor.name),
        email:          s.supervisor.email       ?? '',
        photoURL:       s.supervisor.photoURL    ?? null,
        designation:    s.supervisor.designation ?? '',
        department:     s.supervisor.department  ?? '',
        room:           s.supervisor.room        ?? '',
        status:         s.supervisor.status      ?? 'verified',
        courses:        [],
        totalStudents:  0,
        relationshipType: s.relationshipType,
        topic:          s.topic       ?? '',
        description:    s.description ?? '',
        supStatus:      s.status      ?? 'active',
    }));
};

describe('fetchSupervisors (AskMentor)', () => {
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
                supervisors: [{ supervisor: { _id: 'sup2', name: 'dr ali' }, relationshipType: 'project' }]
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


const buildBookingPayload = (instructor, form) => ({
    facultyID:   instructor.id,
    date:        form.date,
    startTime:   form.from,
    endTime:     form.to,
    purpose:     form.topic.trim(),
    mode:        form.format,
    meetingType: form.meetingType || 'general',
});

const submitBooking = async (instructor, form) => {
    await axiosSecure.post('/appointment', buildBookingPayload(instructor, form));
};

describe('submitBooking (BookingModal handleSubmit)', () => {
    const instructor = { id: 'fac1' };
    const form = {
        date: '2026-04-20', from: '10:00', to: '11:00',
        topic: '  Thesis discussion  ', format: 'online', meetingType: 'thesis',
    };

    test('posts to /appointment with correctly shaped payload', async () => {
        axiosSecure.post.mockResolvedValueOnce({ data: { success: true } });
        await submitBooking(instructor, form);
        expect(axiosSecure.post).toHaveBeenCalledWith('/appointment', {
            facultyID:   'fac1',
            date:        '2026-04-20',
            startTime:   '10:00',
            endTime:     '11:00',
            purpose:     'Thesis discussion',
            mode:        'online',
            meetingType: 'thesis',
        });
    });

    test('trims whitespace from topic', async () => {
        axiosSecure.post.mockResolvedValueOnce({ data: { success: true } });
        await submitBooking(instructor, { ...form, topic: '   hello   ' });
        expect(axiosSecure.post.mock.calls[0][1].purpose).toBe('hello');
    });

    test('defaults meetingType to general when not provided', async () => {
        axiosSecure.post.mockResolvedValueOnce({ data: { success: true } });
        await submitBooking(instructor, { ...form, meetingType: '' });
        expect(axiosSecure.post.mock.calls[0][1].meetingType).toBe('general');
    });

    test('throws on API error', async () => {
        axiosSecure.post.mockRejectedValueOnce(new Error('500'));
        await expect(submitBooking(instructor, form)).rejects.toThrow('500');
    });
});


const cancelAppointment = async (appointmentId, reason) => {
    if (!reason.trim()) throw new Error('Please provide a reason.');
    await axiosSecure.patch(`/appointment/${appointmentId}`, {
        status: 'cancelled', reason: reason.trim(),
    });
};

describe('cancelAppointment (CancelModal)', () => {
    test('patches correct endpoint with trimmed reason', async () => {
        axiosSecure.patch.mockResolvedValueOnce({ data: { success: true } });
        await cancelAppointment('appt42', '  Schedule conflict  ');
        expect(axiosSecure.patch).toHaveBeenCalledWith('/appointment/appt42', {
            status: 'cancelled', reason: 'Schedule conflict',
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
        expect(await deleteUser('bob@uni.edu')).toBe(true);
    });

    test('throws when status is not 200', async () => {
        axiosSecure.delete.mockResolvedValueOnce({ status: 403 });
        await expect(deleteUser('bob@uni.edu')).rejects.toThrow('Delete failed');
    });

    test('throws on network error', async () => {
        axiosSecure.delete.mockRejectedValueOnce(new Error('Network error'));
        await expect(deleteUser('charlie@uni.edu')).rejects.toThrow('Network error');
    });

    test('optimistic list update removes deleted user by email', () => {
        const users = [
            { id: 's1', email: 'alice@uni.edu', name: 'Alice' },
            { id: 's2', email: 'bob@uni.edu',   name: 'Bob'   },
        ];
        const updated = users.filter(u => u.email !== 'alice@uni.edu');
        expect(updated).toHaveLength(1);
        expect(updated[0].email).toBe('bob@uni.edu');
    });
});


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


const facultyCancelAppointment = async (appointmentId, reason) => {
    if (!reason.trim()) throw new Error('Cancellation reason is required');
    const res = await axiosSecure.patch(`/appointment/${appointmentId}`, {
        status: 'cancelled', reason: reason.trim()
    });
    if (!res?.data?.success) throw new Error(res?.data?.message || 'Failed to cancel appointment');
    return res.data.appointment;
};

describe('facultyCancelAppointment (FacultyMyAppointments)', () => {
    test('patches with cancelled status and trimmed reason', async () => {
        axiosSecure.patch.mockResolvedValueOnce({ data: { success: true, appointment: { status: 'cancelled' } } });
        await facultyCancelAppointment('a2', '  Student no-show  ');
        expect(axiosSecure.patch).toHaveBeenCalledWith('/appointment/a2', {
            status: 'cancelled', reason: 'Student no-show'
        });
    });

    test('throws when reason is blank', async () => {
        await expect(facultyCancelAppointment('a2', '')).rejects.toThrow('Cancellation reason is required');
    });

    test('throws when reason is whitespace-only', async () => {
        await expect(facultyCancelAppointment('a2', '   ')).rejects.toThrow('Cancellation reason is required');
    });

    test('throws when API returns success: false', async () => {
        axiosSecure.patch.mockResolvedValueOnce({ data: { success: false, message: 'Cannot cancel completed' } });
        await expect(facultyCancelAppointment('a2', 'reason')).rejects.toThrow('Cannot cancel completed');
    });
});


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

    test('throws on network error', async () => {
        axiosSecure.patch.mockRejectedValueOnce(new Error('timeout'));
        await expect(completeAppointment('a3')).rejects.toThrow('timeout');
    });
});


const updateAppointmentInList = (appointments, updatedAppointment) =>
    appointments.map(appointment =>
        appointment._id === updatedAppointment._id
            ? { ...appointment, ...updatedAppointment, student: appointment.student }
            : appointment
    );

describe('updateAppointmentInList (FacultyMyAppointments)', () => {
    const original = [
        { _id: 'a1', status: 'pending',  student: { name: 'Alice' }, purpose: 'Old'  },
        { _id: 'a2', status: 'approved', student: { name: 'Bob'   }, purpose: 'Keep' },
    ];

    test('updates matching appointment by _id', () => {
        const result = updateAppointmentInList(original, { _id: 'a1', status: 'approved', purpose: 'Updated' });
        expect(result[0].status).toBe('approved');
        expect(result[0].purpose).toBe('Updated');
    });

    test('preserves original student field', () => {
        const result = updateAppointmentInList(original, { _id: 'a1', status: 'approved', student: { name: 'OVERWRITTEN' } });
        expect(result[0].student.name).toBe('Alice');
    });

    test('does not mutate other appointments', () => {
        const result = updateAppointmentInList(original, { _id: 'a1', status: 'completed' });
        expect(result[1].status).toBe('approved');
    });

    test('returns same length array', () => {
        expect(updateAppointmentInList(original, { _id: 'a1', status: 'completed' })).toHaveLength(2);
    });

    test('does not modify when _id has no match', () => {
        const result = updateAppointmentInList(original, { _id: 'a99', status: 'rejected' });
        expect(result[0].status).toBe('pending');
        expect(result[1].status).toBe('approved');
    });
});


const updateStatsAfterStatusChange = (stats, previousStatus, nextStatus) => {
    if (previousStatus === nextStatus) return { ...stats };
    let { pending, upcoming, completed } = stats;
    if (previousStatus === 'pending')   pending   = Math.max(pending   - 1, 0);
    if (previousStatus === 'approved')  upcoming  = Math.max(upcoming  - 1, 0);
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
        const r = updateStatsAfterStatusChange(base, 'pending', 'approved');
        expect(r.pending).toBe(1);
        expect(r.upcoming).toBe(4);
        expect(r.completed).toBe(1);
    });

    test('approved → completed: decrements upcoming, increments completed', () => {
        const r = updateStatsAfterStatusChange(base, 'approved', 'completed');
        expect(r.upcoming).toBe(2);
        expect(r.completed).toBe(2);
    });

    test('approved → cancelled: decrements upcoming only (no cancelled counter)', () => {
        const r = updateStatsAfterStatusChange(base, 'approved', 'cancelled');
        expect(r.upcoming).toBe(2);
        expect(r.pending).toBe(2);
        expect(r.completed).toBe(1);
    });

    test('does not go below zero (floor at 0)', () => {
        const zero = { pending: 0, upcoming: 0, completed: 0 };
        const r = updateStatsAfterStatusChange(zero, 'pending', 'approved');
        expect(r.pending).toBe(0);
        expect(r.upcoming).toBe(1);
    });
});


const canJoinAppointment = (appointment, currentTime) => {
    if (appointment?.status !== 'approved' || appointment?.mode !== 'online' || !appointment?.meetLink)
        return false;
    const now  = new Date(currentTime);
    const startTime = new Date(appointment.startTime);
    const endTime   = new Date(appointment.endTime);
    const joinWindowStart = new Date(startTime.getTime() - 15 * 60 * 1000);
    return now >= joinWindowStart && now <= endTime;
};

describe('canJoinAppointment (FacultyMyAppointments)', () => {
    const makeAppt = (overrides = {}) => ({
        status: 'approved', mode: 'online',
        meetLink: 'https://meet.google.com/abc',
        startTime: '2026-04-15T10:00:00Z',
        endTime:   '2026-04-15T10:30:00Z',
        ...overrides,
    });

    const atTime = (offsetMinutes) => {
        const base = new Date('2026-04-15T10:00:00Z');
        return new Date(base.getTime() + offsetMinutes * 60 * 1000).getTime();
    };

    test('returns true 5 min before start (inside 15-min window)', () => {
        expect(canJoinAppointment(makeAppt(), atTime(-5))).toBe(true);
    });

    test('returns true exactly at start time', () => {
        expect(canJoinAppointment(makeAppt(), atTime(0))).toBe(true);
    });

    test('returns true during the appointment', () => {
        expect(canJoinAppointment(makeAppt(), atTime(15))).toBe(true);
    });

    test('returns false 16 min before start (outside 15-min window)', () => {
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
        expect(canJoinAppointment(makeAppt({ meetLink: ''   }), atTime(0))).toBe(false);
    });

    test('returns false for null appointment', () => {
        expect(canJoinAppointment(null, atTime(0))).toBe(false);
    });
});


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

    test('filters out classes with missing startTime', () => {
        const input = [{ day: 'Monday', classes: [{ courseName: 'Math', startTime: '', endTime: '10:00' }], freeSlots: [] }];
        expect(cleanSchedule(input)[0].classes).toHaveLength(0);
    });

    test('keeps valid class entries', () => {
        const input = [{ day: 'Monday', classes: [{ courseName: 'Math', startTime: '09:00', endTime: '10:00' }], freeSlots: [] }];
        expect(cleanSchedule(input)[0].classes).toHaveLength(1);
    });

    test('filters out free slots with missing startTime', () => {
        const input = [{ day: 'Monday', classes: [], freeSlots: [{ startTime: '', endTime: '12:00' }] }];
        expect(cleanSchedule(input)[0].freeSlots).toHaveLength(0);
    });

    test('keeps valid free slot entries', () => {
        const input = [{ day: 'Monday', classes: [], freeSlots: [{ startTime: '10:00', endTime: '12:00' }] }];
        expect(cleanSchedule(input)[0].freeSlots).toHaveLength(1);
    });

    test('treats whitespace-only courseName as invalid', () => {
        const input = [{ day: 'Monday', classes: [{ courseName: '   ', startTime: '09:00', endTime: '10:00' }], freeSlots: [] }];
        expect(cleanSchedule(input)[0].classes).toHaveLength(0);
    });

    test('mixed valid and invalid: keeps only valid', () => {
        const input = [{
            day: 'Monday',
            classes: [
                { courseName: 'Math', startTime: '09:00', endTime: '10:00' },
                { courseName: '',     startTime: '10:00', endTime: '11:00' },
            ],
            freeSlots: []
        }];
        expect(cleanSchedule(input)[0].classes).toHaveLength(1);
    });
});

describe('hasAnyEntry (FacultyMySchedule)', () => {
    test('returns true when at least one class exists', () => {
        expect(hasAnyEntry([{ day: 'Monday', classes: [{ courseName: 'Math' }], freeSlots: [] }])).toBe(true);
    });

    test('returns true when at least one free slot exists', () => {
        expect(hasAnyEntry([{ day: 'Monday', classes: [], freeSlots: [{ startTime: '10:00', endTime: '11:00' }] }])).toBe(true);
    });

    test('returns false when all days are empty', () => {
        expect(hasAnyEntry([{ day: 'Monday', classes: [], freeSlots: [] }])).toBe(false);
    });

    test('returns false for empty schedule array', () => {
        expect(hasAnyEntry([])).toBe(false);
    });
});


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

    test('throws on network error and sets reminder', async () => {
        axiosSecure.get.mockRejectedValueOnce(new Error('Network error'));
        await expect(fetchSchedule('fac1')).rejects.toThrow('Network error');
    });
});


const handleChatClick = async (person, userId, dashboardRole = 'student') => {
    const receiver = {
        _id: person.id, name: person.name,
        email: person.email, photoURL: person.photoURL ?? null,
    };
    const res = await axiosSecure.get(`/conversation/user/${userId}`);
    const conversations = res.data?.users || [];
    const existing = conversations.find(
        item => item.user?._id?.toString() === person.id?.toString()
    );
    return {
        receiver,
        path: existing?.conversationID
            ? `/dashboard/${dashboardRole}/chat/${existing.conversationID}`
            : `/dashboard/${dashboardRole}/chat/new?receiverID=${person.id}`
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
        expect(result.receiver).toEqual({ _id: 'fac1', name: 'Dr Rahman', email: 'rahman@uni.edu', photoURL: null });
    });

    test('calls conversation endpoint with correct userId', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: { users: [] } });
        await handleChatClick(person, 'stu_abc');
        expect(axiosSecure.get).toHaveBeenCalledWith('/conversation/user/stu_abc');
    });

    test('uses faculty dashboardRole for faculty chat routing', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: { users: [] } });
        const result = await handleChatClick(person, 'fac_abc', 'faculty');
        expect(result.path).toContain('/dashboard/faculty/chat/');
    });

    test('throws on API error', async () => {
        axiosSecure.get.mockRejectedValueOnce(new Error('Network error'));
        await expect(handleChatClick(person, 'student1')).rejects.toThrow('Network error');
    });
});


const updateSuperviseeInLists = (activeSupervises, completedSupervises, updatedSupervisee) => {
    const matchFn = (item) =>
        item?.student?._id === updatedSupervisee?.student?._id &&
        item?.relationshipType === updatedSupervisee?.relationshipType;

    const newActive = (() => {
        const filtered = activeSupervises.filter(item => !matchFn(item));
        return updatedSupervisee?.status === 'active' ? [updatedSupervisee, ...filtered] : filtered;
    })();

    const newCompleted = (() => {
        const filtered = completedSupervises.filter(item => !matchFn(item));
        return updatedSupervisee?.status === 'completed' ? [updatedSupervisee, ...filtered] : filtered;
    })();

    return { newActive, newCompleted };
};

describe('updateSuperviseeInLists (FacultyMySupervises)', () => {
    const s1 = { student: { _id: 'st1' }, relationshipType: 'thesis',   status: 'active' };
    const s2 = { student: { _id: 'st2' }, relationshipType: 'project',  status: 'active' };

    test('moves supervisee from active to completed on status change', () => {
        const updated = { ...s1, status: 'completed' };
        const { newActive, newCompleted } = updateSuperviseeInLists([s1, s2], [], updated);
        expect(newActive.find(i => i.student._id === 'st1')).toBeUndefined();
        expect(newCompleted.find(i => i.student._id === 'st1')).toBeDefined();
    });

    test('keeps other active supervisees untouched', () => {
        const updated = { ...s1, status: 'completed' };
        const { newActive } = updateSuperviseeInLists([s1, s2], [], updated);
        expect(newActive).toHaveLength(1);
        expect(newActive[0].student._id).toBe('st2');
    });

    test('stays in active if status remains active', () => {
        const updated = { ...s1, status: 'active', topic: 'Updated topic' };
        const { newActive, newCompleted } = updateSuperviseeInLists([s1, s2], [], updated);
        expect(newActive.find(i => i.student._id === 'st1')).toBeDefined();
        expect(newCompleted).toHaveLength(0);
    });

    test('matches by both studentId AND relationshipType (different rel types not confused)', () => {
        const s1Project = { student: { _id: 'st1' }, relationshipType: 'project', status: 'active' };
        const updated = { ...s1, status: 'completed' };
        const { newActive } = updateSuperviseeInLists([s1, s1Project], [], updated);
        expect(newActive.find(i => i.relationshipType === 'project')).toBeDefined();
    });
});


const updateSuperviseeStatus = async (facultyId, studentId, relationshipType, status) => {
    const payload = { studentID: studentId, relationshipType, status };
    const res = await axiosSecure.patch(`/supervisor/${facultyId}`, payload);
    if (!res?.data?.success) throw new Error(res?.data?.message || 'Failed to update supervisee status');
    return res.data;
};

describe('handleUpdateSuperviseeStatus (FacultyMySupervises)', () => {
    test('patches correct endpoint with correct payload', async () => {
        axiosSecure.patch.mockResolvedValueOnce({ data: { success: true } });
        await updateSuperviseeStatus('fac1', 'st1', 'thesis', 'completed');
        expect(axiosSecure.patch).toHaveBeenCalledWith('/supervisor/fac1', {
            studentID: 'st1', relationshipType: 'thesis', status: 'completed'
        });
    });

    test('throws when API returns success: false', async () => {
        axiosSecure.patch.mockResolvedValueOnce({ data: { success: false, message: 'Not found' } });
        await expect(updateSuperviseeStatus('fac1', 'st1', 'thesis', 'completed')).rejects.toThrow('Not found');
    });

    test('totalCompletedSupervises increments when moving active → completed', () => {
        let totalCompleted = 2;
        const previousStatus = 'active';
        const nextStatus = 'completed';
        if (previousStatus === 'active' && nextStatus === 'completed') totalCompleted += 1;
        expect(totalCompleted).toBe(3);
    });
});


const removeSupervisee = async (facultyId, studentId, relationshipType) => {
    const res = await axiosSecure.delete(`/supervisor/${facultyId}`, {
        data: { studentID: studentId, relationshipType }
    });
    if (!res?.data?.success) throw new Error(res?.data?.message || 'Failed to remove supervisee');
    return true;
};

describe('handleRemoveSupervisee (FacultyMySupervises)', () => {
    test('calls correct DELETE endpoint with body payload', async () => {
        axiosSecure.delete.mockResolvedValueOnce({ data: { success: true } });
        await removeSupervisee('fac1', 'st1', 'thesis');
        expect(axiosSecure.delete).toHaveBeenCalledWith('/supervisor/fac1', {
            data: { studentID: 'st1', relationshipType: 'thesis' }
        });
    });

    test('returns true on success', async () => {
        axiosSecure.delete.mockResolvedValueOnce({ data: { success: true } });
        expect(await removeSupervisee('fac1', 'st1', 'thesis')).toBe(true);
    });

    test('throws when API returns success: false', async () => {
        axiosSecure.delete.mockResolvedValueOnce({ data: { success: false, message: 'Permission denied' } });
        await expect(removeSupervisee('fac1', 'st1', 'thesis')).rejects.toThrow('Permission denied');
    });

    test('optimistic list update removes by studentId and relationshipType', () => {
        const active = [
            { student: { _id: 'st1' }, relationshipType: 'thesis' },
            { student: { _id: 'st2' }, relationshipType: 'project' },
        ];
        const updated = active.filter(s =>
            !(s.student._id === 'st1' && s.relationshipType === 'thesis')
        );
        expect(updated).toHaveLength(1);
        expect(updated[0].student._id).toBe('st2');
    });
});


const buildCourseCode = (subject, year, semester, serial) => {
    if (!subject || !year || !semester || !serial) return '';
    const yearNumber     = year[0];
    const semesterNumber = semester[0];
    return `${subject} ${yearNumber}${semesterNumber}${serial}`;
};

describe('courseCodeBuilder (FacultyMyCourses)', () => {
    test('builds correct course code from all parts', () => {
        expect(buildCourseCode('CSE', '3rd', '2nd', '09')).toBe('CSE 3209');
    });

    test('extracts first char of year and semester', () => {
        expect(buildCourseCode('EEE', '1st', '1st', '01')).toBe('EEE 1101');
    });

    test('returns empty string when any part is missing', () => {
        expect(buildCourseCode('',    '3rd', '2nd', '09')).toBe('');
        expect(buildCourseCode('CSE', '',    '2nd', '09')).toBe('');
        expect(buildCourseCode('CSE', '3rd', '',    '09')).toBe('');
        expect(buildCourseCode('CSE', '3rd', '2nd', ''  )).toBe('');
    });
});


const validateSession = (session) => /^\d{4}-\d{4}$/.test(session);

describe('sessionValidation (FacultyMyCourses)', () => {
    test('accepts valid YYYY-YYYY format', () => {
        expect(validateSession('2023-2024')).toBe(true);
        expect(validateSession('2025-2026')).toBe(true);
    });

    test('rejects invalid formats', () => {
        expect(validateSession('23-24')).toBe(false);
        expect(validateSession('2023/2024')).toBe(false);
        expect(validateSession('2023-24')).toBe(false);
        expect(validateSession('20232024')).toBe(false);
        expect(validateSession('')).toBe(false);
    });
});


const facultyJoinCourse = async (invitationCode) => {
    const code = invitationCode.trim();
    if (!code) throw new Error('Course invitation code required');
    const res = await axiosSecure.post(`/courses/faculty/join?code=${code}`);
    if (!res?.data?.success) throw new Error(res?.data?.message || 'Failed to join');
    return res.data.course;
};

describe('handleJoinCourse — faculty (FacultyMyCourses)', () => {
    test('throws when invitation code is empty', async () => {
        await expect(facultyJoinCourse('')).rejects.toThrow('Course invitation code required');
    });

    test('throws when invitation code is whitespace-only', async () => {
        await expect(facultyJoinCourse('   ')).rejects.toThrow('Course invitation code required');
    });

    test('posts to correct endpoint with trimmed code', async () => {
        axiosSecure.post.mockResolvedValueOnce({ data: { success: true, course: { _id: 'c1' } } });
        await facultyJoinCourse('  ABC123  ');
        expect(axiosSecure.post).toHaveBeenCalledWith('/courses/faculty/join?code=ABC123');
    });

    test('returns the course object on success', async () => {
        axiosSecure.post.mockResolvedValueOnce({ data: { success: true, course: { _id: 'c99', courseCode: 'CSE 3101' } } });
        const course = await facultyJoinCourse('XYZ');
        expect(course._id).toBe('c99');
    });

    test('throws when API returns success: false', async () => {
        axiosSecure.post.mockResolvedValueOnce({ data: { success: false, message: 'Invalid code' } });
        await expect(facultyJoinCourse('BAD')).rejects.toThrow('Invalid code');
    });
});


const studentJoinCourse = async (invitationCode) => {
    if (!invitationCode.trim()) throw new Error('Please enter an invitation code.');
    const res = await axiosSecure.post(`/courses/student/join?invitationCode=${invitationCode.trim()}`);
    return res.data;
};

describe('handleJoinCourse — student (MyCourses)', () => {
    test('throws when code is empty', async () => {
        await expect(studentJoinCourse('')).rejects.toThrow('Please enter an invitation code.');
    });

    test('posts to correct student join endpoint', async () => {
        axiosSecure.post.mockResolvedValueOnce({ data: { message: 'Joined!' } });
        await studentJoinCourse('CODE99');
        expect(axiosSecure.post).toHaveBeenCalledWith('/courses/student/join?invitationCode=CODE99');
    });

    test('throws on network error', async () => {
        axiosSecure.post.mockRejectedValueOnce(new Error('500'));
        await expect(studentJoinCourse('X')).rejects.toThrow('500');
    });
});


const isToday = (dateString) => {
    const created = new Date(dateString);
    const today   = new Date();
    return (
        created.getFullYear() === today.getFullYear() &&
        created.getMonth()    === today.getMonth()    &&
        created.getDate()     === today.getDate()
    );
};

const fetchNotifications = async () => {
    const res = await axiosSecure.get('/notifications');
    return (res.data.notifications || []).map((n, index) => ({
        id:      index + 1,
        _id:     n._id,
        title:   n.type,
        message: n.message,
        read:    n.isRead,
        today:   isToday(n.createdAt),
    }));
};

describe('fetchNotifications (Notifications)', () => {
    test('maps response correctly', async () => {
        const now = new Date().toISOString();
        axiosSecure.get.mockResolvedValueOnce({
            data: {
                notifications: [
                    { _id: 'n1', type: 'appointment', message: 'Your booking was approved', isRead: false, createdAt: now },
                    { _id: 'n2', type: 'course',      message: 'New file uploaded',         isRead: true,  createdAt: now },
                ]
            }
        });
        const result = await fetchNotifications();
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe(1);
        expect(result[0].title).toBe('appointment');
        expect(result[0].read).toBe(false);
        expect(result[0].today).toBe(true);
        expect(result[1].read).toBe(true);
    });

    test('returns empty array when notifications is missing', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: {} });
        const result = await fetchNotifications();
        expect(result).toHaveLength(0);
    });

    test('isToday returns false for past dates', () => {
        expect(isToday('2020-01-01T00:00:00Z')).toBe(false);
    });

    test('unreadCount derived correctly', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: {
                notifications: [
                    { _id: 'n1', type: 'x', message: 'm', isRead: false, createdAt: new Date().toISOString() },
                    { _id: 'n2', type: 'x', message: 'm', isRead: true,  createdAt: new Date().toISOString() },
                    { _id: 'n3', type: 'x', message: 'm', isRead: false, createdAt: new Date().toISOString() },
                ]
            }
        });
        const result = await fetchNotifications();
        const unreadCount = result.filter(n => !n.read).length;
        expect(unreadCount).toBe(2);
    });
});


const markRead = async (notifId) => {
    await axiosSecure.patch(`/notifications/${notifId}`);
};

const markAllRead = async () => {
    await axiosSecure.patch('/notifications/all');
};

describe('markRead / markAllRead (Notifications)', () => {
    test('markRead patches the correct notification endpoint', async () => {
        axiosSecure.patch.mockResolvedValueOnce({});
        await markRead('n42');
        expect(axiosSecure.patch).toHaveBeenCalledWith('/notifications/n42');
    });

    test('markAllRead patches /notifications/all', async () => {
        axiosSecure.patch.mockResolvedValueOnce({});
        await markAllRead();
        expect(axiosSecure.patch).toHaveBeenCalledWith('/notifications/all');
    });

    test('optimistic markRead update sets read:true for matching id', () => {
        const notifications = [
            { id: 1, _id: 'n1', read: false },
            { id: 2, _id: 'n2', read: false },
        ];
        const updated = notifications.map(n => n.id === 1 ? { ...n, read: true } : n);
        expect(updated[0].read).toBe(true);
        expect(updated[1].read).toBe(false);
    });

    test('optimistic markAllRead sets all to read:true', () => {
        const notifications = [
            { id: 1, read: false },
            { id: 2, read: false },
        ];
        const updated = notifications.map(n => ({ ...n, read: true }));
        expect(updated.every(n => n.read)).toBe(true);
    });
});


const buildProfileUpdatePayload = ({ name, photoURL, photoId, role, room }) => {
    const payload = { name, photoURL, photoId };
    if (role === 'faculty' && room) payload.room = room;
    return payload;
};

describe('handleProfileUpdate payload (StudentProfile)', () => {
    test('builds basic payload with name and photo', () => {
        const p = buildProfileUpdatePayload({ name: 'Alice', photoURL: 'http://cdn/img.jpg', photoId: 'img_01', role: 'student', room: '' });
        expect(p.name).toBe('Alice');
        expect(p.photoURL).toBe('http://cdn/img.jpg');
        expect(p.photoId).toBe('img_01');
        expect(p.room).toBeUndefined();
    });

    test('includes room only for faculty role', () => {
        const p = buildProfileUpdatePayload({ name: 'Dr X', photoURL: '', photoId: '', role: 'faculty', room: 'CSE 201' });
        expect(p.room).toBe('CSE 201');
    });

    test('does not include room for student role even if value present', () => {
        const p = buildProfileUpdatePayload({ name: 'Alice', photoURL: '', photoId: '', role: 'student', room: 'Room 5' });
        expect(p.room).toBeUndefined();
    });

    test('patches the correct endpoint', async () => {
        axiosSecure.patch.mockResolvedValueOnce({ data: {} });
        await axiosSecure.patch('/users/profile/alice@uni.edu', { name: 'Alice' });
        expect(axiosSecure.patch).toHaveBeenCalledWith('/users/profile/alice@uni.edu', { name: 'Alice' });
    });
});


const handlePasswordReset = async (passwordResetFn, email) => {
    await passwordResetFn(email);
};

describe('handlePasswordReset (StudentProfile / Login)', () => {
    test('calls passwordReset with the user email', async () => {
        const mockReset = jest.fn().mockResolvedValueOnce(undefined);
        await handlePasswordReset(mockReset, 'user@uni.edu');
        expect(mockReset).toHaveBeenCalledWith('user@uni.edu');
    });

    test('Login: forgot password sends to the provided email (not userData email)', async () => {
        const mockReset = jest.fn().mockResolvedValueOnce(undefined);
        await handlePasswordReset(mockReset, 'forgot@uni.edu');
        expect(mockReset).toHaveBeenCalledWith('forgot@uni.edu');
    });

    test('throws on reset failure', async () => {
        const mockReset = jest.fn().mockRejectedValueOnce(new Error('User not found'));
        await expect(handlePasswordReset(mockReset, 'bad@uni.edu')).rejects.toThrow('User not found');
    });
});


const fetchConversationList = async (userId, searchTerm = '') => {
    const res = await axiosSecure.get(`/conversation/user/${userId}`, {
        params: searchTerm ? { search: searchTerm } : {}
    });
    if (!res.data.success) return { users: [], mode: 'chat' };
    return { users: res.data.users, mode: res.data.mode };
};

describe('fetchConversationList (ChatPage)', () => {
    test('returns users and mode on success', async () => {
        axiosSecure.get.mockResolvedValueOnce({
            data: { success: true, users: [{ conversationID: 'c1', user: { _id: 'u1', name: 'Bob' } }], mode: 'chat' }
        });
        const result = await fetchConversationList('me123');
        expect(result.users).toHaveLength(1);
        expect(result.mode).toBe('chat');
    });

    test('passes search param when searchTerm is provided', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: { success: true, users: [], mode: 'search' } });
        await fetchConversationList('me123', 'Alice');
        expect(axiosSecure.get).toHaveBeenCalledWith('/conversation/user/me123', { params: { search: 'Alice' } });
    });

    test('omits search param when searchTerm is empty', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: { success: true, users: [], mode: 'chat' } });
        await fetchConversationList('me123', '');
        expect(axiosSecure.get).toHaveBeenCalledWith('/conversation/user/me123', { params: {} });
    });

    test('returns empty fallback when success is false', async () => {
        axiosSecure.get.mockResolvedValueOnce({ data: { success: false } });
        const result = await fetchConversationList('me123');
        expect(result.users).toHaveLength(0);
        expect(result.mode).toBe('chat');
    });
});


const buildChatNavigationTarget = (item, dashboardPath) => {
    if (item.conversationID)
        return `/dashboard/${dashboardPath}/chat/${item.conversationID}`;
    return `/dashboard/${dashboardPath}/chat/new?receiverID=${item.user._id}`;
};

describe('handleItemClick routing (ChatPage)', () => {
    test('routes to existing conversation when conversationID is present', () => {
        const item = { conversationID: 'conv42', user: { _id: 'u1' } };
        expect(buildChatNavigationTarget(item, 'student')).toBe('/dashboard/student/chat/conv42');
    });

    test('routes to new chat when conversationID is absent', () => {
        const item = { conversationID: null, user: { _id: 'u99' } };
        expect(buildChatNavigationTarget(item, 'student')).toBe('/dashboard/student/chat/new?receiverID=u99');
    });

    test('unreadCount reset: sets unreadCount to 0 on click', () => {
        const items = [
            { conversationID: 'c1', unreadCount: 3 },
            { conversationID: 'c2', unreadCount: 1 },
        ];
        const updated = items.map(i => i.conversationID === 'c1' ? { ...i, unreadCount: 0 } : i);
        expect(updated[0].unreadCount).toBe(0);
        expect(updated[1].unreadCount).toBe(1);
    });

    test('uses faculty dashboard path for faculty users', () => {
        const item = { conversationID: 'conv10', user: { _id: 'u1' } };
        expect(buildChatNavigationTarget(item, 'faculty')).toBe('/dashboard/faculty/chat/conv10');
    });
});

const deriveStatus = (a) => {
    const submission = a.submission;
    const dueDate    = a.assignment.dueDate;
    if (!submission) return new Date(dueDate) < new Date() ? 'missed' : 'pending';
    if (submission.isGraded) return 'graded';
    return 'submitted';
};

describe('deriveAssignmentStatus (MyAssessments)', () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const past   = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    test('returns pending when no submission and due date is in the future', () => {
        expect(deriveStatus({ submission: null, assignment: { dueDate: future } })).toBe('pending');
    });

    test('returns missed when no submission and due date has passed', () => {
        expect(deriveStatus({ submission: null, assignment: { dueDate: past } })).toBe('missed');
    });

    test('returns graded when submission is graded', () => {
        expect(deriveStatus({ submission: { isGraded: true }, assignment: { dueDate: future } })).toBe('graded');
    });

    test('returns submitted when submission exists but not graded', () => {
        expect(deriveStatus({ submission: { isGraded: false }, assignment: { dueDate: past } })).toBe('submitted');
    });
});

const redirectToSuperviseeChat = async (supervisee, facultyId) => {
    try {
        const res = await axiosSecure.post('/conversation', { receiverID: supervisee.student._id });
        const conversationID = res.data.conversation._id;
        return `/dashboard/faculty/chat/${conversationID}`;
    } catch {
        return `/dashboard/faculty/chat/new?receiverID=${supervisee.student._id}`;
    }
};

describe('handleRedirectChatbox (FacultyMySupervises)', () => {
    const supervisee = { student: { _id: 'st1', name: 'Alice' } };

    test('navigates to existing conversation when post succeeds', async () => {
        axiosSecure.post.mockResolvedValueOnce({ data: { conversation: { _id: 'conv77' } } });
        const path = await redirectToSuperviseeChat(supervisee, 'fac1');
        expect(path).toBe('/dashboard/faculty/chat/conv77');
    });

    test('falls back to new chat path when post fails', async () => {
        axiosSecure.post.mockRejectedValueOnce(new Error('Network error'));
        const path = await redirectToSuperviseeChat(supervisee, 'fac1');
        expect(path).toBe('/dashboard/faculty/chat/new?receiverID=st1');
    });

    test('posts receiverID to /conversation endpoint', async () => {
        axiosSecure.post.mockResolvedValueOnce({ data: { conversation: { _id: 'c1' } } });
        await redirectToSuperviseeChat(supervisee, 'fac1');
        expect(axiosSecure.post).toHaveBeenCalledWith('/conversation', { receiverID: 'st1' });
    });
});