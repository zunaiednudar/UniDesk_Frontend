/**
 * Integration tests for UniDesk frontend flows.
 *
 * These tests simulate multi-step user journeys that span several functions
 * working together — mirroring what happens when a user interacts with a full page.
 *
 * Covered flows:
 *  1. Full appointment booking validation pipeline
 *  2. ManageUsers: fetch → filter → sort → paginate pipeline
 *  3. ManageMentorship: faculty data enrichment pipeline
 *  4. CourseFilesDrawer: file download fallback
 */

// Shared helpers

const to12hr = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const rangeOverlapsBusy = (schedule, dayName, from, to) => {
    if (!schedule || !from || !to) return false;
    const dayEntry = schedule.weeklySchedule?.find(d => d.day === dayName);
    if (!dayEntry) return false;
    const busySlots = dayEntry.classes || [];
    return busySlots.some(slot => {
        const slotStart = slot.startTime ?? slot.from;
        const slotEnd = slot.endTime ?? slot.to;
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

// Replicates handleSubmit validation from BookingModal
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
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        if (statusFilter !== 'all' && u.status !== statusFilter) return false;
        return (
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.studentID?.toLowerCase().includes(q) ||
            u.department?.toLowerCase().includes(q)
        );
    });
};

const sortUsers = (list, sortField, sortDir) =>
    [...list].sort((a, b) => {
        const valA = (a[sortField] ?? '').toString().toLowerCase();
        const valB = (b[sortField] ?? '').toString().toLowerCase();
        const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
    });

const paginateList = (list, currentPage, itemsPerPage) =>
    list.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


// INTEGRATION TEST SUITES

// 1. Appointment booking validation pipeline
describe('[Integration] Appointment booking validation pipeline', () => {
    // A realistic faculty schedule: Monday has a class 09:00–10:00 and a free slot 10:00–12:00
    const schedule = {
        weeklySchedule: [
            {
                day: 'Monday',
                classes: [{ startTime: '09:00', endTime: '10:00', courseName: 'Data Structures' }],
                freeSlots: [{ startTime: '10:00', endTime: '12:00' }],
            }
        ]
    };

    const freeSlotsMonday = [{ startTime: '10:00', endTime: '12:00' }];

    test('rejects completely empty form', () => {
        const result = validateBookingForm(
            { date: '', from: '', to: '', topic: '', format: '' },
            null, [], null
        );
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/fill in all fields/i);
    });

    test('rejects form with missing format', () => {
        const result = validateBookingForm(
            { date: '2026-04-15', from: '10:00', to: '11:00', topic: 'Thesis update', format: '' },
            null, [], null
        );
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/format/i);
    });

    test('rejects form where start time is after end time', () => {
        const result = validateBookingForm(
            { date: '2026-04-15', from: '11:00', to: '10:00', topic: 'Discussion', format: 'online' },
            null, [], null
        );
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/end time must be after/i);
    });

    test('rejects time outside free slots when free slots exist', () => {
        const result = validateBookingForm(
            { date: '2026-04-15', from: '08:00', to: '09:00', topic: 'Check-in', format: 'in-person' },
            schedule, freeSlotsMonday, 'Monday'
        );
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/available slots/i);
    });

    test('rejects time that overlaps with a class', () => {
        // 09:30 to 10:30 overlaps with 09:00–10:00 class
        const result = validateBookingForm(
            { date: '2026-04-14', from: '09:30', to: '10:30', topic: 'Project', format: 'online' },
            schedule, [], 'Monday'     // no free slots → skip that check, hit overlap check
        );
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/overlaps/i);
    });

    test('accepts a valid booking inside a free slot with no class conflict', () => {
        const result = validateBookingForm(
            { date: '2026-04-15', from: '10:30', to: '11:00', topic: 'Project discussion', format: 'online' },
            schedule, freeSlotsMonday, 'Monday'
        );
        expect(result.valid).toBe(true);
        expect(result.error).toBeNull();
    });

    test('accepts a valid in-person booking with no schedule loaded', () => {
        // When schedule is null, no conflict checks run
        const result = validateBookingForm(
            { date: '2026-04-15', from: '14:00', to: '15:00', topic: 'Assignment help', format: 'in-person' },
            null, [], null
        );
        expect(result.valid).toBe(true);
    });

    test('rejects topic that is only whitespace', () => {
        const result = validateBookingForm(
            { date: '2026-04-15', from: '10:00', to: '11:00', topic: '   ', format: 'online' },
            null, [], null
        );
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/fill in all fields/i);
    });
});

// 2. ManageUsers: full filter → sort → paginate pipeline
describe('[Integration] ManageUsers filter → sort → paginate pipeline', () => {
    // Build a realistic 15-user dataset
    const users = [
        ...Array.from({ length: 8 }, (_, i) => ({
            id: `s${i}`, name: `Student ${String.fromCharCode(65 + i)}`, email: `student${i}@uni.edu`,
            role: 'student', status: i < 6 ? 'verified' : 'pending',
            department: i % 2 === 0 ? 'CSE' : 'EEE', studentID: `S00${i}`
        })),
        ...Array.from({ length: 7 }, (_, i) => ({
            id: `f${i}`, name: `Faculty ${String.fromCharCode(65 + i)}`, email: `faculty${i}@uni.edu`,
            role: 'faculty', status: i < 5 ? 'verified' : 'suspended',
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
        const sorted = sortUsers(filtered, 'name', 'asc');
        const names = sorted.map(u => u.name);
        expect(names).toEqual([...names].sort());
    });

    test('paginating filtered+sorted results returns correct page slices', () => {
        const filtered = filterUsers(users, { roleFilter: 'student' }); // 8 students
        const sorted = sortUsers(filtered, 'name', 'asc');
        const page1 = paginateList(sorted, 1, 5);
        const page2 = paginateList(sorted, 2, 5);
        expect(page1).toHaveLength(5);
        expect(page2).toHaveLength(3);
        // No overlap between pages
        const page1Ids = page1.map(u => u.id);
        const page2Ids = page2.map(u => u.id);
        expect(page1Ids.filter(id => page2Ids.includes(id))).toHaveLength(0);
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
        const filtered = filterUsers(users, {
            searchQuery: 'CSE',
            roleFilter: 'faculty',
            statusFilter: 'verified'
        });
        filtered.forEach(u => {
            expect(u.role).toBe('faculty');
            expect(u.status).toBe('verified');
            expect(u.department).toBe('CSE');
        });
    });
});

// 3. ManageMentorship: faculty data enrichment pipeline
describe('[Integration] ManageMentorship faculty enrichment pipeline', () => {
    // Simulates what the component does after fetching /admin/users and /supervisor/student/:id

    const rawUsers = [
        { _id: 'f1', name: 'Dr. Rahman', email: 'rahman@uni.edu', role: 'faculty', status: 'verified', department: 'CSE', designation: 'Professor', researchInterests: ['AI', 'ML'], photoURL: null },
        { _id: 'f2', name: 'Dr. Karim', email: 'karim@uni.edu', role: 'faculty', status: 'verified', department: 'EEE', designation: 'Lecturer', researchInterests: [], photoURL: null },
        { _id: 's1', name: 'Alice', email: 'alice@uni.edu', role: 'student', status: 'verified', department: 'CSE', designation: null, researchInterests: [], photoURL: null },
    ];

    // Simulate supervisor relationships: f1 supervises s1
    const supervisorRelationships = [{ supervisor: { _id: 'f1' } }];

    test('correctly separates faculties from students', () => {
        const faculties = rawUsers.filter(u => u.role === 'faculty');
        const students = rawUsers.filter(u => u.role === 'student');
        expect(faculties).toHaveLength(2);
        expect(students).toHaveLength(1);
    });

    test('enriches faculties with correct isSupervisor flag', () => {
        const faculties = rawUsers.filter(u => u.role === 'faculty');
        const supervisorIds = new Set(supervisorRelationships.map(r => r.supervisor._id));
        const enriched = faculties.map(f => ({ ...f, isSupervisor: supervisorIds.has(f._id) }));

        expect(enriched.find(f => f._id === 'f1').isSupervisor).toBe(true);
        expect(enriched.find(f => f._id === 'f2').isSupervisor).toBe(false);
    });

    test('stat counts are correct after enrichment', () => {
        const faculties = rawUsers.filter(u => u.role === 'faculty');
        const supervisorIds = new Set(supervisorRelationships.map(r => r.supervisor._id));
        const enriched = faculties.map(f => ({ ...f, isSupervisor: supervisorIds.has(f._id) }));

        const supervisorCount = enriched.filter(f => f.isSupervisor).length;
        const nonSupervisorCount = enriched.length - supervisorCount;

        expect(enriched).toHaveLength(2);
        expect(supervisorCount).toBe(1);
        expect(nonSupervisorCount).toBe(1);
    });

    test('supervisor filter correctly narrows enriched faculty list', () => {
        const faculties = rawUsers.filter(u => u.role === 'faculty');
        const supervisorIds = new Set(supervisorRelationships.map(r => r.supervisor._id));
        const enriched = faculties.map(f => ({ ...f, isSupervisor: supervisorIds.has(f._id) }));

        const supervisors = enriched.filter(f => f.isSupervisor);
        const nonSupervisors = enriched.filter(f => !f.isSupervisor);

        expect(supervisors.map(f => f._id)).toContain('f1');
        expect(nonSupervisors.map(f => f._id)).toContain('f2');
    });

    test('deduplicated supervisor IDs from multiple student relationships', () => {
        // s1 and s2 both supervised by f1 — f1 should only appear once in the supervisor set
        const multipleRels = [
            { supervisor: { _id: 'f1' } },
            { supervisor: { _id: 'f1' } },
            { supervisor: { _id: 'f2' } },
        ];
        const supervisorIds = new Set(multipleRels.map(r => r.supervisor._id));
        expect(supervisorIds.size).toBe(2);
    });
});

// 4. CourseFilesDrawer: download filename construction
describe('[Integration] CourseFilesDrawer download filename logic', () => {
    // Replicates the filename construction inside handleDownload
    const buildFileName = (url, title) => {
        const ext = url.split('?')[0].split('.').pop().toLowerCase();
        return `${title.replace(/\s+/g, '_')}.${ext}`;
    };

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
            .toBe('Chapter_1_Introduction.pdf'); // /\s+/ collapses all whitespace runs to single _
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