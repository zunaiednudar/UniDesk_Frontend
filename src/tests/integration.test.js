/**
 * Integration tests for UniDesk frontend flows.
 *
 * These tests simulate multi-step user journeys spanning several functions
 * working together — mirroring what happens when a user interacts with a full page.
 *
 * Covered flows:
 *  1.  Appointment booking validation pipeline          (BookingModal)
 *  2.  ManageUsers: filter → sort → paginate pipeline
 *  3.  ManageMentorship: faculty enrichment pipeline
 *  4.  CourseFilesDrawer: file download filename logic
 *  5.  Overview (admin courses): filter → sort → paginate pipeline
 *  6.  ManageUsers: stats and chart-data derivation pipeline
 *  7.  FacultyMyAppointments: approve/complete/cancel → stat update chain
 *  8.  FacultyMySchedule: schedule clean → validate → submit flow
 *  9.  FacultyMySupervises: status update → list reconciliation pipeline
 * 10.  FacultyMyCourses: course code generation → session validation pipeline
 * 11.  MyAssessments: assignment status derivation → week-board bucketing
 * 12.  MyProjects: filter + status badge pipeline
 * 13.  ChatPage: newMessage → unread increment → read-reset pipeline
 * 14.  Notifications: fetch → partition today/history → markAllRead pipeline
 * 15.  AskMentor: fetchInstructors dedup → filter → chat routing pipeline
 */

// ─── Shared helpers ───────────────────────────────────────────────────────────

const to12hr = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const rangeOverlapsBusy = (schedule, dayName, from, to) => {
    if (!schedule || !from || !to) return false;
    const dayEntry  = schedule.weeklySchedule?.find(d => d.day === dayName);
    if (!dayEntry) return false;
    const busySlots = dayEntry.classes || [];
    return busySlots.some(slot => {
        const slotStart = slot.startTime ?? slot.from;
        const slotEnd   = slot.endTime   ?? slot.to;
        if (!slotStart || !slotEnd) return false;
        return from < slotEnd && to > slotStart;
    });
};

const isInsideFreeSlot = (freeSlotsForDay, from, to) => {
    if (!from || !to || freeSlotsForDay.length === 0) return false;
    return freeSlotsForDay.some(slot =>
        from >= slot.startTime && to <= slot.endTime
    );
};

const validateBookingForm = (form, schedule, freeSlotsForDay, selectedDayName) => {
    const { date, from, to, topic, format } = form;
    if (!date || !from || !to || !topic?.trim())
        return { valid: false, error: 'Please fill in all fields.' };
    if (!format)
        return { valid: false, error: 'Please select an appointment format.' };
    if (from >= to)
        return { valid: false, error: 'End time must be after start time.' };
    if (schedule && freeSlotsForDay.length > 0 && !isInsideFreeSlot(freeSlotsForDay, from, to))
        return { valid: false, error: 'Please choose a time within the available slots shown above.' };
    if (schedule && selectedDayName && rangeOverlapsBusy(schedule, selectedDayName, from, to))
        return { valid: false, error: "This time slot overlaps with the faculty's class schedule. Please choose a different time." };
    return { valid: true, error: null };
};

const filterUsers = (userList, { searchQuery = '', roleFilter = 'all', statusFilter = 'all' }) => {
    const q = searchQuery.toLowerCase();
    return userList.filter(u => {
        if (roleFilter   !== 'all' && u.role   !== roleFilter)   return false;
        if (statusFilter !== 'all' && u.status !== statusFilter) return false;
        return (
            u.name?.toLowerCase().includes(q)      ||
            u.email?.toLowerCase().includes(q)     ||
            u.studentID?.toLowerCase().includes(q) ||
            u.department?.toLowerCase().includes(q)
        );
    });
};

const sortUsers = (list, sortField, sortDir) =>
    [...list].sort((a, b) => {
        const valA = (a[sortField] ?? '').toString().toLowerCase();
        const valB = (b[sortField] ?? '').toString().toLowerCase();
        const cmp  = valA < valB ? -1 : valA > valB ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
    });

const paginateList = (list, currentPage, itemsPerPage) =>
    list.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

const filterCourses = (courses, searchQuery, statusFilter) => {
    const q = searchQuery.toLowerCase();
    return courses.filter(c => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        return (
            c.courseCode?.toLowerCase().includes(q)       ||
            c.courseName?.toLowerCase().includes(q)       ||
            c.department?.toLowerCase().includes(q)       ||
            c.faculties?.some(f => f.name?.toLowerCase().includes(q))
        );
    });
};

const sortCourses = (list, sortField, sortDir) =>
    [...list].sort((a, b) => {
        const valA = (a[sortField] ?? '').toString().toLowerCase();
        const valB = (b[sortField] ?? '').toString().toLowerCase();
        const cmp  = valA < valB ? -1 : valA > valB ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
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

const deriveStatus = (a) => {
    const submission = a.submission;
    const dueDate    = a.assignment.dueDate;
    if (!submission) return new Date(dueDate) < new Date() ? 'missed' : 'pending';
    if (submission.isGraded) return 'graded';
    return 'submitted';
};

const buildFileName = (url, title) => {
    const ext = url.split('?')[0].split('.').pop().toLowerCase();
    return `${title.replace(/\s+/g, '_')}.${ext}`;
};

// ═════════════════════════════════════════════════════════════════════════════
// 1. Appointment booking validation pipeline (BookingModal)
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] Appointment booking validation pipeline', () => {
    const schedule = {
        weeklySchedule: [{
            day: 'Monday',
            classes:   [{ startTime: '09:00', endTime: '10:00', courseName: 'Data Structures' }],
            freeSlots: [{ startTime: '10:00', endTime: '12:00' }],
        }]
    };
    const freeSlotsMonday = [{ startTime: '10:00', endTime: '12:00' }];

    test('rejects completely empty form', () => {
        const r = validateBookingForm({ date: '', from: '', to: '', topic: '', format: '' }, null, [], null);
        expect(r.valid).toBe(false);
        expect(r.error).toMatch(/fill in all fields/i);
    });

    test('rejects form with missing format', () => {
        const r = validateBookingForm(
            { date: '2026-04-15', from: '10:00', to: '11:00', topic: 'Thesis update', format: '' },
            null, [], null
        );
        expect(r.valid).toBe(false);
        expect(r.error).toMatch(/format/i);
    });

    test('rejects form where start time is after end time', () => {
        const r = validateBookingForm(
            { date: '2026-04-15', from: '11:00', to: '10:00', topic: 'Discussion', format: 'online' },
            null, [], null
        );
        expect(r.valid).toBe(false);
        expect(r.error).toMatch(/end time must be after/i);
    });

    test('rejects equal start and end time', () => {
        const r = validateBookingForm(
            { date: '2026-04-15', from: '10:00', to: '10:00', topic: 'Meet', format: 'online' },
            null, [], null
        );
        expect(r.valid).toBe(false);
    });

    test('rejects time outside free slots when free slots exist', () => {
        const r = validateBookingForm(
            { date: '2026-04-15', from: '08:00', to: '09:00', topic: 'Check-in', format: 'in-person' },
            schedule, freeSlotsMonday, 'Monday'
        );
        expect(r.valid).toBe(false);
        expect(r.error).toMatch(/available slots/i);
    });

    test('rejects time that overlaps with a class', () => {
        const r = validateBookingForm(
            { date: '2026-04-14', from: '09:30', to: '10:30', topic: 'Project', format: 'online' },
            schedule, [], 'Monday'
        );
        expect(r.valid).toBe(false);
        expect(r.error).toMatch(/overlaps/i);
    });

    test('accepts a valid booking inside a free slot with no class conflict', () => {
        const r = validateBookingForm(
            { date: '2026-04-15', from: '10:30', to: '11:00', topic: 'Project discussion', format: 'online' },
            schedule, freeSlotsMonday, 'Monday'
        );
        expect(r.valid).toBe(true);
        expect(r.error).toBeNull();
    });

    test('accepts a valid booking with no schedule loaded', () => {
        const r = validateBookingForm(
            { date: '2026-04-15', from: '14:00', to: '15:00', topic: 'Assignment help', format: 'in-person' },
            null, [], null
        );
        expect(r.valid).toBe(true);
    });

    test('rejects topic that is only whitespace', () => {
        const r = validateBookingForm(
            { date: '2026-04-15', from: '10:00', to: '11:00', topic: '   ', format: 'online' },
            null, [], null
        );
        expect(r.valid).toBe(false);
        expect(r.error).toMatch(/fill in all fields/i);
    });

    test('to12hr correctly formats the chosen time slot', () => {
        expect(to12hr('10:30')).toBe('10:30 AM');
        expect(to12hr('13:00')).toBe('1:00 PM');
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. ManageUsers: filter → sort → paginate pipeline
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] ManageUsers filter → sort → paginate pipeline', () => {
    const users = [
        ...Array.from({ length: 8 }, (_, i) => ({
            id: `s${i}`, name: `Student ${String.fromCharCode(65 + i)}`,
            email: `student${i}@uni.edu`, role: 'student',
            status: i < 6 ? 'verified' : 'pending',
            department: i % 2 === 0 ? 'CSE' : 'EEE', studentID: `S00${i}`
        })),
        ...Array.from({ length: 7 }, (_, i) => ({
            id: `f${i}`, name: `Faculty ${String.fromCharCode(65 + i)}`,
            email: `faculty${i}@uni.edu`, role: 'faculty',
            status: i < 5 ? 'verified' : 'suspended',
            department: 'CSE', studentID: null
        })),
    ];

    test('filtering by student role returns only students', () => {
        const filtered = filterUsers(users, { roleFilter: 'student' });
        expect(filtered.every(u => u.role === 'student')).toBe(true);
        expect(filtered).toHaveLength(8);
    });

    test('filtering by department then sorting by name gives alphabetical CSE users', () => {
        const filtered = filterUsers(users, { searchQuery: 'CSE' });
        const sorted   = sortUsers(filtered, 'name', 'asc');
        const names    = sorted.map(u => u.name);
        expect(names).toEqual([...names].sort());
    });

    test('paginating filtered + sorted results returns correct page slices', () => {
        const filtered = filterUsers(users, { roleFilter: 'student' });
        const sorted   = sortUsers(filtered, 'name', 'asc');
        const page1    = paginateList(sorted, 1, 5);
        const page2    = paginateList(sorted, 2, 5);
        expect(page1).toHaveLength(5);
        expect(page2).toHaveLength(3);
        const p1Ids = page1.map(u => u.id);
        const p2Ids = page2.map(u => u.id);
        expect(p1Ids.filter(id => p2Ids.includes(id))).toHaveLength(0);
    });

    test('pending students only: correct count after chained filters', () => {
        const filtered = filterUsers(users, { roleFilter: 'student', statusFilter: 'pending' });
        expect(filtered).toHaveLength(2);
        filtered.forEach(u => {
            expect(u.role).toBe('student');
            expect(u.status).toBe('pending');
        });
    });

    test('search + role + status combined returns expected subset', () => {
        const filtered = filterUsers(users, { searchQuery: 'CSE', roleFilter: 'faculty', statusFilter: 'verified' });
        filtered.forEach(u => {
            expect(u.role).toBe('faculty');
            expect(u.status).toBe('verified');
            expect(u.department).toBe('CSE');
        });
    });

    test('admin users excluded from list before filtering', () => {
        const withAdmin = [
            ...users,
            { id: 'a1', name: 'Admin User', email: 'admin@uni.edu', role: 'admin', status: 'verified', department: 'IT', studentID: null }
        ];
        const withoutAdmins = withAdmin.filter(u => u.role !== 'admin');
        expect(withoutAdmins.every(u => u.role !== 'admin')).toBe(true);
        expect(withoutAdmins).toHaveLength(users.length);
    });

    test('stats derivation from raw users', () => {
        const allUsers = [
            ...users,
            { id: 'a1', role: 'admin', status: 'verified' }
        ];
        const students  = allUsers.filter(u => u.role === 'student');
        const faculties = allUsers.filter(u => u.role === 'faculty');
        const admins    = allUsers.filter(u => u.role === 'admin');
        expect(students.length  + faculties.length + admins.length).toBe(allUsers.length);
        expect(admins).toHaveLength(1);
    });

    test('pie chart status counts computed correctly', () => {
        const usersWithoutAdmins = users;
        const pendingCount   = usersWithoutAdmins.filter(u => u.status === 'pending').length;
        const verifiedCount  = usersWithoutAdmins.filter(u => u.status === 'verified').length;
        const suspendedCount = usersWithoutAdmins.filter(u => u.status === 'suspended').length;
        expect(pendingCount + verifiedCount + suspendedCount).toBe(users.length);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. ManageMentorship: faculty enrichment pipeline
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] ManageMentorship faculty enrichment pipeline', () => {
    const rawUsers = [
        { _id: 'f1', name: 'Dr. Rahman', role: 'faculty', status: 'verified', department: 'CSE' },
        { _id: 'f2', name: 'Dr. Karim',  role: 'faculty', status: 'verified', department: 'EEE' },
        { _id: 's1', name: 'Alice',       role: 'student', status: 'verified', department: 'CSE' },
    ];

    const supervisorRelationships = [{ supervisor: { _id: 'f1' } }];

    test('correctly separates faculties from students', () => {
        const faculties = rawUsers.filter(u => u.role === 'faculty');
        const students  = rawUsers.filter(u => u.role === 'student');
        expect(faculties).toHaveLength(2);
        expect(students).toHaveLength(1);
    });

    test('enriches faculties with correct isSupervisor flag', () => {
        const faculties    = rawUsers.filter(u => u.role === 'faculty');
        const supervisorIds = new Set(supervisorRelationships.map(r => r.supervisor._id));
        const enriched     = faculties.map(f => ({ ...f, isSupervisor: supervisorIds.has(f._id) }));
        expect(enriched.find(f => f._id === 'f1').isSupervisor).toBe(true);
        expect(enriched.find(f => f._id === 'f2').isSupervisor).toBe(false);
    });

    test('stat counts are correct after enrichment', () => {
        const faculties     = rawUsers.filter(u => u.role === 'faculty');
        const supervisorIds  = new Set(supervisorRelationships.map(r => r.supervisor._id));
        const enriched      = faculties.map(f => ({ ...f, isSupervisor: supervisorIds.has(f._id) }));
        const supervisorCount    = enriched.filter(f => f.isSupervisor).length;
        const nonSupervisorCount = enriched.length - supervisorCount;
        expect(enriched).toHaveLength(2);
        expect(supervisorCount).toBe(1);
        expect(nonSupervisorCount).toBe(1);
    });

    test('supervisor filter correctly narrows enriched faculty list', () => {
        const faculties     = rawUsers.filter(u => u.role === 'faculty');
        const supervisorIds  = new Set(supervisorRelationships.map(r => r.supervisor._id));
        const enriched      = faculties.map(f => ({ ...f, isSupervisor: supervisorIds.has(f._id) }));
        const supervisors    = enriched.filter(f => f.isSupervisor);
        const nonSupervisors = enriched.filter(f => !f.isSupervisor);
        expect(supervisors.map(f => f._id)).toContain('f1');
        expect(nonSupervisors.map(f => f._id)).toContain('f2');
    });

    test('deduplicated supervisor IDs from multiple student relationships', () => {
        const multipleRels = [
            { supervisor: { _id: 'f1' } },
            { supervisor: { _id: 'f1' } },
            { supervisor: { _id: 'f2' } },
        ];
        const supervisorIds = new Set(multipleRels.map(r => r.supervisor._id));
        expect(supervisorIds.size).toBe(2);
    });

    test('faculty with id matching unique supervisor set gets isSupervisor=true', () => {
        const multipleRels = [
            { supervisor: { _id: 'f1' } },
            { supervisor: { _id: 'f1' } },
        ];
        const supervisorIds  = new Set(multipleRels.map(r => r.supervisor._id));
        const faculties      = rawUsers.filter(u => u.role === 'faculty');
        const enriched       = faculties.map(f => ({ ...f, isSupervisor: supervisorIds.has(f._id) }));
        expect(enriched.find(f => f._id === 'f1').isSupervisor).toBe(true);
        expect(enriched.find(f => f._id === 'f2').isSupervisor).toBe(false);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. CourseFilesDrawer: file download filename logic
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] CourseFilesDrawer download filename logic', () => {
    test('builds correct filename from a clean URL and title', () => {
        expect(buildFileName('https://cdn.example.com/lecture.pdf', 'Week 1 Lecture'))
            .toBe('Week_1_Lecture.pdf');
    });

    test('strips query string before extracting extension', () => {
        expect(buildFileName('https://cdn.example.com/notes.docx?token=xyz123', 'My Notes'))
            .toBe('My_Notes.docx');
    });

    test('replaces multiple spaces with underscores', () => {
        expect(buildFileName('doc.pdf', 'Chapter  1   Introduction'))
            .toBe('Chapter_1_Introduction.pdf');
    });

    test('lowercases the extension', () => {
        expect(buildFileName('IMAGE.JPG', 'Profile Photo'))
            .toBe('Profile_Photo.jpg');
    });

    test('handles title with no spaces', () => {
        expect(buildFileName('slides.pptx', 'Lecture1'))
            .toBe('Lecture1.pptx');
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 5. Overview (admin): filter → sort → paginate pipeline
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] Overview admin courses filter → sort → paginate pipeline', () => {
    const courses = Array.from({ length: 12 }, (_, i) => ({
        id:         `c${i}`,
        courseCode: `CSE ${3100 + i}`,
        courseName: `Course ${String.fromCharCode(65 + i)}`,
        department: i % 3 === 0 ? 'EEE' : 'CSE',
        status:     i < 8 ? 'active' : 'completed',
        faculties:  [{ name: i % 2 === 0 ? 'Dr Amin' : 'Dr Reza' }],
        studentCount: i * 5,
        session:    '2025-2026',
    }));

    test('filter by status: active returns correct subset', () => {
        const filtered = filterCourses(courses, '', 'active');
        expect(filtered.every(c => c.status === 'active')).toBe(true);
        expect(filtered).toHaveLength(8);
    });

    test('search by faculty name', () => {
        const filtered = filterCourses(courses, 'dr amin', 'all');
        expect(filtered.length).toBeGreaterThan(0);
        filtered.forEach(c =>
            expect(c.faculties.some(f => f.name.toLowerCase().includes('dr amin'))).toBe(true)
        );
    });

    test('filter → sort → paginate: page 1 and 2 have no overlap', () => {
        const filtered = filterCourses(courses, '', 'all');
        const sorted   = sortCourses(filtered, 'courseCode', 'asc');
        const page1    = paginateList(sorted, 1, 5);
        const page2    = paginateList(sorted, 2, 5);
        const p1Ids    = page1.map(c => c.id);
        const p2Ids    = page2.map(c => c.id);
        expect(p1Ids.filter(id => p2Ids.includes(id))).toHaveLength(0);
    });

    test('sort by courseCode descending places higher codes first', () => {
        const sorted = sortCourses(courses, 'courseCode', 'desc');
        expect(sorted[0].courseCode > sorted[sorted.length - 1].courseCode).toBe(true);
    });

    test('stats derivation: total, active, completed counts', () => {
        const total     = courses.length;
        const active    = courses.filter(c => c.status === 'active').length;
        const completed = courses.filter(c => c.status === 'completed').length;
        expect(total).toBe(12);
        expect(active + completed).toBe(total);
    });

    test('course data mapping: studentCount from array length', () => {
        const raw = { students: ['s1', 's2', 's3'], faculties: [] };
        const studentCount = Array.isArray(raw.students) ? raw.students.length : 0;
        expect(studentCount).toBe(3);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 6. ManageUsers: stats and chart-data derivation pipeline
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] ManageUsers stats and chart-data derivation pipeline', () => {
    const thisYear = new Date().getFullYear();
    const makeUser = (role, month) => ({
        role,
        status: 'verified',
        createdAtRaw: new Date(thisYear, month, 15).toISOString(),
    });

    const users = [
        makeUser('student', 0), makeUser('student', 1), makeUser('student', 1),
        makeUser('faculty', 0), makeUser('faculty', 2),
        makeUser('admin',   0),
    ];

    test('student / faculty / admin counts are correct', () => {
        expect(users.filter(u => u.role === 'student').length).toBe(3);
        expect(users.filter(u => u.role === 'faculty').length).toBe(2);
        expect(users.filter(u => u.role === 'admin').length).toBe(1);
    });

    test('cumulative bar-chart student growth data', () => {
        const students = users.filter(u => u.role === 'student');
        const rawCount = students.reduce((acc, u) => {
            const month = new Date(u.createdAtRaw).getMonth();
            if (new Date(u.createdAtRaw).getFullYear() === thisYear)
                acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, Array(12).fill(0));

        // Cumulative up to month 1 (Feb)
        let cumulative = 0;
        const result = [];
        for (let m = 0; m <= 1; m++) {
            cumulative += rawCount[m];
            result.push(cumulative);
        }
        expect(result[0]).toBe(1); // Jan: 1
        expect(result[1]).toBe(3); // Feb: 1+2
    });

    test('pie chart: pending + verified + suspended sums to total non-admin users', () => {
        const nonAdmins  = users.filter(u => u.role !== 'admin');
        const pending    = nonAdmins.filter(u => u.status === 'pending').length;
        const verified   = nonAdmins.filter(u => u.status === 'verified').length;
        const suspended  = nonAdmins.filter(u => u.status === 'suspended').length;
        expect(pending + verified + suspended).toBe(nonAdmins.length);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 7. FacultyMyAppointments: approve → complete → cancel chain
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] FacultyMyAppointments approve → complete → cancel stat update chain', () => {
    test('full chain: pending → approved → completed stats', () => {
        let stats = { pending: 3, upcoming: 1, completed: 0 };

        stats = updateStatsAfterStatusChange(stats, 'pending', 'approved');
        expect(stats.pending).toBe(2);
        expect(stats.upcoming).toBe(2);

        stats = updateStatsAfterStatusChange(stats, 'approved', 'completed');
        expect(stats.upcoming).toBe(1);
        expect(stats.completed).toBe(1);
    });

    test('approved → cancelled: upcoming decrements, no other change', () => {
        let stats = { pending: 1, upcoming: 2, completed: 1 };
        stats = updateStatsAfterStatusChange(stats, 'approved', 'cancelled');
        expect(stats.upcoming).toBe(1);
        expect(stats.pending).toBe(1);
        expect(stats.completed).toBe(1);
    });

    test('stats do not go below zero on multiple cancellations', () => {
        let stats = { pending: 0, upcoming: 1, completed: 0 };
        stats = updateStatsAfterStatusChange(stats, 'approved', 'cancelled');
        stats = updateStatsAfterStatusChange(stats, 'approved', 'cancelled'); // upcoming already 0
        expect(stats.upcoming).toBe(0);
    });

    test('noop when status unchanged', () => {
        const stats = { pending: 2, upcoming: 3, completed: 1 };
        expect(updateStatsAfterStatusChange(stats, 'pending', 'pending')).toEqual(stats);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 8. FacultyMySchedule: clean → validate → would-submit flow
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] FacultyMySchedule schedule clean → validate → submit flow', () => {
    test('fully valid schedule passes clean and hasAnyEntry check', () => {
        const raw = [{
            day: 'Monday',
            classes:   [{ courseName: 'Math', startTime: '09:00', endTime: '10:00' }],
            freeSlots: [{ startTime: '10:00', endTime: '12:00' }],
        }];
        const cleaned = cleanSchedule(raw);
        expect(hasAnyEntry(cleaned)).toBe(true);
        expect(cleaned[0].classes).toHaveLength(1);
        expect(cleaned[0].freeSlots).toHaveLength(1);
    });

    test('schedule with all-invalid classes but valid free slot still passes hasAnyEntry', () => {
        const raw = [{
            day:       'Monday',
            classes:   [{ courseName: '', startTime: '', endTime: '' }],
            freeSlots: [{ startTime: '10:00', endTime: '12:00' }],
        }];
        const cleaned = cleanSchedule(raw);
        expect(hasAnyEntry(cleaned)).toBe(true);
    });

    test('completely blank schedule fails hasAnyEntry → submit is blocked', () => {
        const raw = [{
            day:       'Monday',
            classes:   [{ courseName: '', startTime: '', endTime: '' }],
            freeSlots: [{ startTime: '', endTime: '' }],
        }];
        const cleaned = cleanSchedule(raw);
        expect(hasAnyEntry(cleaned)).toBe(false);
    });

    test('whitespace-only courseName is filtered out', () => {
        const raw = [{
            day:       'Tuesday',
            classes:   [{ courseName: '   ', startTime: '09:00', endTime: '10:00' }],
            freeSlots: [],
        }];
        const cleaned = cleanSchedule(raw);
        expect(cleaned[0].classes).toHaveLength(0);
        expect(hasAnyEntry(cleaned)).toBe(false);
    });

    test('multiple days: partial validity still passes overall hasAnyEntry', () => {
        const raw = [
            { day: 'Monday',  classes: [],                                                    freeSlots: [] },
            { day: 'Tuesday', classes: [{ courseName: 'Physics', startTime: '09:00', endTime: '10:00' }], freeSlots: [] },
        ];
        expect(hasAnyEntry(cleanSchedule(raw))).toBe(true);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 9. FacultyMySupervises: status update → list reconciliation pipeline
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] FacultyMySupervises status update → list reconciliation', () => {
    const s1 = { student: { _id: 'st1' }, relationshipType: 'thesis',  status: 'active',    topic: 'AI Research' };
    const s2 = { student: { _id: 'st2' }, relationshipType: 'project', status: 'active',    topic: 'Web App'     };
    const s3 = { student: { _id: 'st3' }, relationshipType: 'thesis',  status: 'completed', topic: 'Done'        };

    const updateSuperviseeInLists = (active, completed, updated) => {
        const matchFn = item =>
            item.student._id === updated.student._id &&
            item.relationshipType === updated.relationshipType;

        const newActive    = active.filter(i => !matchFn(i));
        const newCompleted = completed.filter(i => !matchFn(i));

        if (updated.status === 'active')    newActive.unshift(updated);
        if (updated.status === 'completed') newCompleted.unshift(updated);

        return { newActive, newCompleted };
    };

    test('active → completed: removed from active, added to completed', () => {
        const { newActive, newCompleted } = updateSuperviseeInLists([s1, s2], [s3], { ...s1, status: 'completed' });
        expect(newActive.find(i => i.student._id === 'st1')).toBeUndefined();
        expect(newCompleted.find(i => i.student._id === 'st1')).toBeDefined();
        expect(newActive).toHaveLength(1);
    });

    test('other active supervisees untouched', () => {
        const { newActive } = updateSuperviseeInLists([s1, s2], [], { ...s1, status: 'completed' });
        expect(newActive.find(i => i.student._id === 'st2')).toBeDefined();
    });

    test('totalCompletedSupervises increments on active → completed transition', () => {
        let totalCompleted = 1;
        const previousStatus = 'active';
        const nextStatus = 'completed';
        if (previousStatus === 'active' && nextStatus === 'completed') totalCompleted += 1;
        expect(totalCompleted).toBe(2);
    });

    test('totalCompletedSupervises does not increment on other transitions', () => {
        let totalCompleted = 1;
        const previousStatus = 'completed';
        const nextStatus = 'active';
        if (previousStatus === 'active' && nextStatus === 'completed') totalCompleted += 1;
        expect(totalCompleted).toBe(1);
    });

    test('removal: supervisee removed from active list only', () => {
        const updated = [s1, s2].filter(s =>
            !(s.student._id === 'st1' && s.relationshipType === 'thesis')
        );
        expect(updated).toHaveLength(1);
        expect(updated[0].student._id).toBe('st2');
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 10. FacultyMyCourses: code generation → session validation pipeline
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] FacultyMyCourses course code → session validation pipeline', () => {
    const buildCourseCode = (subject, year, semester, serial) => {
        if (!subject || !year || !semester || !serial) return '';
        return `${subject} ${year[0]}${semester[0]}${serial}`;
    };

    const validateSession = (session) => /^\d{4}-\d{4}$/.test(session);

    test('full valid flow: code built and session validates', () => {
        const code    = buildCourseCode('CSE', '3rd', '2nd', '09');
        const session = '2025-2026';
        expect(code).toBe('CSE 3209');
        expect(validateSession(session)).toBe(true);
    });

    test('empty serial produces empty code → submit blocked', () => {
        const code = buildCourseCode('CSE', '3rd', '2nd', '');
        expect(code).toBe('');
        // simulate: if (!courseCode) → blocked
        expect(code ? 'proceed' : 'blocked').toBe('blocked');
    });

    test('invalid session format → submit blocked', () => {
        expect(validateSession('2025-26')).toBe(false);
        expect(validateSession('25-2026')).toBe(false);
    });

    test('join course: whitespace-only code is rejected before API call', () => {
        const code = '   '.trim();
        expect(code.length).toBe(0);
    });

    test('faculty join uses /courses/faculty/join endpoint with code query', () => {
        const code     = 'ABC123';
        const endpoint = `/courses/faculty/join?code=${code}`;
        expect(endpoint).toBe('/courses/faculty/join?code=ABC123');
    });

    test('student join uses /courses/student/join endpoint with invitationCode query', () => {
        const code     = 'XYZ999';
        const endpoint = `/courses/student/join?invitationCode=${code}`;
        expect(endpoint).toBe('/courses/student/join?invitationCode=XYZ999');
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 11. MyAssessments: deriveStatus → week-board bucketing
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] MyAssessments deriveStatus → week-board bucketing pipeline', () => {
    const future = new Date(Date.now() + 7  * 24 * 60 * 60 * 1000).toISOString();
    const past   = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000).toISOString();
    const soon   = new Date(Date.now() + 1  * 24 * 60 * 60 * 1000).toISOString();

    const rawAssignments = [
        { submission: null,              assignment: { dueDate: future }, title: 'A', courseCode: 'CSE 3101' },
        { submission: null,              assignment: { dueDate: past   }, title: 'B', courseCode: 'CSE 3102' },
        { submission: { isGraded: true  }, assignment: { dueDate: past }, title: 'C', courseCode: 'CSE 3103' },
        { submission: { isGraded: false }, assignment: { dueDate: past }, title: 'D', courseCode: 'CSE 3104' },
    ];

    test('derives correct statuses for mixed assignments', () => {
        const statuses = rawAssignments.map(deriveStatus);
        expect(statuses).toEqual(['pending', 'missed', 'graded', 'submitted']);
    });

    test('pending count correct', () => {
        const derived = rawAssignments.map(a => ({ ...a, status: deriveStatus(a) }));
        expect(derived.filter(a => a.status === 'pending')).toHaveLength(1);
    });

    test('missed count correct', () => {
        const derived = rawAssignments.map(a => ({ ...a, status: deriveStatus(a) }));
        expect(derived.filter(a => a.status === 'missed')).toHaveLength(1);
    });

    test('submission stats: onTime (graded/submitted), missed computed correctly', () => {
        const derived = rawAssignments.map(a => ({ ...a, status: deriveStatus(a) }));
        const onTime  = derived.filter(a => a.status === 'graded' || a.status === 'submitted').length;
        const missed  = derived.filter(a => a.status === 'missed').length;
        expect(onTime).toBe(2);
        expect(missed).toBe(1);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 12. MyProjects: filter + badge class pipeline
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] MyProjects filter + badge pipeline', () => {
    const projects = [
        { id: 1, title: 'E-Commerce Platform', course: 'CSE 3220', courseName: 'Software Engineering', status: 'in-progress', priority: 'high'   },
        { id: 2, title: 'Sorting Visualizer',   course: 'CSE 3250', courseName: 'Algorithm Analysis',  status: 'completed',   priority: 'low'    },
        { id: 3, title: 'AI Chatbot',            course: 'CSE 3260', courseName: 'Artificial Intelligence', status: 'not-started', priority: 'high' },
    ];

    const filterProjects = (projects, searchQuery, statusFilter) =>
        projects.filter(p => {
            const matchSearch =
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.courseName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'all' || p.status === statusFilter;
            return matchSearch && matchStatus;
        });

    const getStatusBadge = (status) => ({
        'in-progress':  'bg-blue-100 text-blue-700',
        'completed':    'bg-green-100 text-green-700',
        'not-started':  'bg-gray-100 text-gray-700',
    }[status] || 'bg-gray-100 text-gray-700');

    test('filter by status then badge assignment are consistent', () => {
        const filtered = filterProjects(projects, '', 'completed');
        expect(filtered).toHaveLength(1);
        expect(getStatusBadge(filtered[0].status)).toBe('bg-green-100 text-green-700');
    });

    test('search by course name returns correct subset', () => {
        const result = filterProjects(projects, 'algorithm', 'all');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(2);
    });

    test('in-progress filter + badge', () => {
        const filtered = filterProjects(projects, '', 'in-progress');
        filtered.forEach(p => {
            expect(getStatusBadge(p.status)).toBe('bg-blue-100 text-blue-700');
        });
    });

    test('empty search with "all" status returns full list', () => {
        expect(filterProjects(projects, '', 'all')).toHaveLength(3);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 13. ChatPage: newMessage → unread increment → read-reset pipeline
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] ChatPage newMessage → unread → read-reset pipeline', () => {
    const userId = 'me';

    const handleNewMessage = (prev, msg, currentPath) => {
        const isCurrentConv = currentPath.includes(msg.conversation);
        const isReceiver    = msg.sender._id !== userId;
        const exists        = prev.some(i => i.conversationID === msg.conversation);

        if (exists) {
            return prev.map(item => {
                if (item.conversationID !== msg.conversation) return item;
                return {
                    ...item,
                    lastMessage: msg.content,
                    unreadCount: (isReceiver && !isCurrentConv) ? (item.unreadCount || 0) + 1 : item.unreadCount,
                };
            });
        }

        return [{
            conversationID: msg.conversation,
            lastMessage:    msg.content,
            unreadCount:    (isReceiver && !isCurrentConv) ? 1 : 0,
        }, ...prev];
    };

    const resetUnread = (items, conversationID) =>
        items.map(i => i.conversationID === conversationID ? { ...i, unreadCount: 0 } : i);

    test('full pipeline: message received → unread increments → click resets to 0', () => {
        let items = [{ conversationID: 'c1', lastMessage: 'old', unreadCount: 0 }];

        // Step 1: receive a new message on c1 from another user (not current conv)
        const msg = { conversation: 'c1', content: 'Hello!', sender: { _id: 'other' } };
        items = handleNewMessage(items, msg, '/dashboard/student/chat/c2');
        expect(items[0].unreadCount).toBe(1);
        expect(items[0].lastMessage).toBe('Hello!');

        // Step 2: receive another message
        items = handleNewMessage(items, { ...msg, content: 'You there?' }, '/dashboard/student/chat/c2');
        expect(items[0].unreadCount).toBe(2);

        // Step 3: user clicks the conversation → unreadCount resets
        items = resetUnread(items, 'c1');
        expect(items[0].unreadCount).toBe(0);
    });

    test('message from self does not increment unread', () => {
        let items = [{ conversationID: 'c1', unreadCount: 0 }];
        const msg = { conversation: 'c1', content: 'My msg', sender: { _id: 'me' } };
        items = handleNewMessage(items, msg, '/dashboard/student/chat/c2');
        expect(items[0].unreadCount).toBe(0);
    });

    test('new conversation is prepended to the list', () => {
        let items = [{ conversationID: 'c1', unreadCount: 0 }];
        const msg = { conversation: 'c_new', content: 'Hi', sender: { _id: 'stranger' } };
        items = handleNewMessage(items, msg, '/other/path');
        expect(items[0].conversationID).toBe('c_new');
        expect(items).toHaveLength(2);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 14. Notifications: fetch → partition today/history → markAllRead pipeline
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] Notifications fetch → partition → markAllRead pipeline', () => {
    const isToday = (dateStr) => {
        const created = new Date(dateStr);
        const now     = new Date();
        return created.getFullYear() === now.getFullYear() &&
            created.getMonth()    === now.getMonth()    &&
            created.getDate()     === now.getDate();
    };

    const todayISO = new Date().toISOString();
    const pastISO  = '2025-01-10T09:00:00Z';

    const rawNotifications = [
        { _id: 'n1', type: 'appointment', message: 'Approved', isRead: false, createdAt: todayISO },
        { _id: 'n2', type: 'course',      message: 'New file', isRead: true,  createdAt: todayISO },
        { _id: 'n3', type: 'system',      message: 'Update',   isRead: false, createdAt: pastISO  },
    ];

    const notifications = rawNotifications.map((n, i) => ({
        id: i + 1, _id: n._id, title: n.type, message: n.message,
        read: n.isRead, today: isToday(n.createdAt),
    }));

    test('partitions into today and history correctly', () => {
        const todayNotifs   = notifications.filter(n => n.today);
        const historyNotifs = notifications.filter(n => !n.today);
        expect(todayNotifs).toHaveLength(2);
        expect(historyNotifs).toHaveLength(1);
    });

    test('unreadCount is correct', () => {
        const unreadCount = notifications.filter(n => !n.read).length;
        expect(unreadCount).toBe(2);
    });

    test('markAllRead sets all read:true in the list', () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        expect(updated.every(n => n.read)).toBe(true);
        expect(updated.filter(n => !n.read)).toHaveLength(0);
    });

    test('markRead sets only targeted notification to read', () => {
        const updated = notifications.map(n => n.id === 1 ? { ...n, read: true } : n);
        expect(updated.find(n => n.id === 1).read).toBe(true);
        expect(updated.find(n => n.id === 3).read).toBe(false);
    });

    test('unreadCount drops to 0 after markAllRead', () => {
        const updated    = notifications.map(n => ({ ...n, read: true }));
        const unreadCount = updated.filter(n => !n.read).length;
        expect(unreadCount).toBe(0);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// 15. AskMentor: fetchInstructors dedup → filter → chat routing pipeline
// ═════════════════════════════════════════════════════════════════════════════

describe('[Integration] AskMentor fetchInstructors → filter → chat routing pipeline', () => {
    const formatName = (name) =>
        name ? name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

    const buildInstructorMap = (courses) => {
        const facultyMap = new Map();
        for (const course of courses) {
            const faculties = course.faculties || [];
            for (const faculty of faculties) {
                const id = faculty._id;
                if (!id) continue;
                if (!facultyMap.has(id)) {
                    facultyMap.set(id, {
                        id, name: formatName(faculty.name),
                        status: faculty.status ?? 'verified',
                        courses: [], totalStudents: 0,
                    });
                }
                facultyMap.get(id).courses.push(course);
                facultyMap.get(id).totalStudents += (course.students || []).length;
            }
        }
        return [...facultyMap.values()].sort((a, b) => {
            if (a.status === 'verified' && b.status !== 'verified') return -1;
            if (a.status !== 'verified' && b.status === 'verified') return 1;
            return a.name.localeCompare(b.name);
        });
    };

    const courses = [
        { _id: 'c1', faculties: [{ _id: 'f1', name: 'dr amin',  status: 'verified'  }, { _id: 'f2', name: 'dr reza', status: 'suspended' }], students: ['s1', 's2'] },
        { _id: 'c2', faculties: [{ _id: 'f1', name: 'dr amin',  status: 'verified'  }], students: ['s3'] },
    ];

    test('deduplicates faculty and accumulates student counts', () => {
        const instructors = buildInstructorMap(courses);
        const amin = instructors.find(i => i.id === 'f1');
        expect(amin.courses).toHaveLength(2);
        expect(amin.totalStudents).toBe(3);
    });

    test('sorts verified before suspended', () => {
        const instructors = buildInstructorMap(courses);
        expect(instructors[0].status).toBe('verified');
        expect(instructors[instructors.length - 1].status).toBe('suspended');
    });

    test('chat routing: existing conversation found → navigate to it', () => {
        const conversations = [{ user: { _id: 'f1' }, conversationID: 'conv10' }];
        const person = { id: 'f1' };
        const existing = conversations.find(i => i.user._id === person.id);
        const path = existing?.conversationID
            ? `/dashboard/student/chat/${existing.conversationID}`
            : `/dashboard/student/chat/new?receiverID=${person.id}`;
        expect(path).toBe('/dashboard/student/chat/conv10');
    });

    test('chat routing: no existing conversation → new chat path', () => {
        const conversations = [];
        const person = { id: 'f2' };
        const existing = conversations.find(i => i?.user?._id === person.id);
        const path = existing?.conversationID
            ? `/dashboard/student/chat/${existing.conversationID}`
            : `/dashboard/student/chat/new?receiverID=${person.id}`;
        expect(path).toBe('/dashboard/student/chat/new?receiverID=f2');
    });

    test('full pipeline: build → sort → route to chat', () => {
        const instructors = buildInstructorMap(courses);
        // Top instructor is verified Dr Amin
        const topInstructor = instructors[0];
        expect(topInstructor.name).toBe('Dr Amin');

        // Simulate clicking "Chat" on Dr Amin with no existing conversation
        const conversations = [];
        const existing = conversations.find(i => i?.user?._id === topInstructor.id);
        const path = existing?.conversationID
            ? `/dashboard/student/chat/${existing.conversationID}`
            : `/dashboard/student/chat/new?receiverID=${topInstructor.id}`;
        expect(path).toBe('/dashboard/student/chat/new?receiverID=f1');
    });
});