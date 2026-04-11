/**
 * Unit tests for pure helper functions used across the UniDesk frontend.
 * All functions are extracted from their components and tested in isolation.
 *
 * Covered:
 *  1.  getInitials                (AskMentor)
 *  2.  to12hr                     (AskMentor / BookingModal)
 *  3.  rangeOverlapsBusy          (AskMentor / BookingModal)
 *  4.  isInsideFreeSlot           (BookingModal)
 *  5.  getDueDateClasses          (MyActivity / MyAssessments)
 *  6.  getCheckboxClasses         (MyActivity)
 *  7.  fileIconMap                (CourseFilesDrawer)
 *  8.  filterUsers                (ManageUsers)
 *  9.  sortUsers                  (ManageUsers)
 * 10.  filterFaculties            (ManageMentorship)
 * 11.  paginateList               (ManageUsers / ManageMentorship / Overview)
 * 12.  totalPages                 (all paginated views)
 * 13.  getStatusBadgeClass        (FacultyMyAppointments)
 * 14.  buildCourseCode            (FacultyMyCourses)
 * 15.  validateSessionFormat      (FacultyMyCourses)
 * 16.  deriveAssignmentStatus     (MyAssessments)
 * 17.  gradeColor                 (MyAssessments)
 * 18.  getWeekRange               (MyAssessments)
 * 19.  filterProjects             (MyProjects)
 * 20.  getStatusBadgeClass        (MyProjects — status/priority)
 * 21.  statsFromCourses           (Overview — admin courses)
 * 22.  filterCourses              (Overview — admin)
 * 23.  isToday                    (Notifications)
 * 24.  onlineUsers Set helpers    (ChatPage)
 * 25.  unreadCountLogic           (ChatPage newMessage handler)
 * 26.  formatName stub            (shared utility)
 * 27.  buildFileName              (CourseFilesDrawer download)
 * 28.  statsInfoComputation       (FacultyMySchedule)
 * 29.  scheduleDayIndexMap        (FacultyMySchedule classEvents)
 * 30.  appointmentStatusConfig    (MyActivity / AskMentor)
 */

// ─── Shared stubs ─────────────────────────────────────────────────────────────

const formatName = (name) =>
    name ? name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

// ─── 1. getInitials (AskMentor) ───────────────────────────────────────────────

const getInitials = (name = '') =>
    name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);

describe('getInitials (AskMentor)', () => {
    test('returns two initials for a full name', () => {
        expect(getInitials('John Doe')).toBe('JD');
    });

    test('returns one initial for a single word name', () => {
        expect(getInitials('Alice')).toBe('A');
    });

    test('handles three-word name — only first two initials', () => {
        expect(getInitials('Alice Bob Charlie')).toBe('AB');
    });

    test('returns empty string for empty input', () => {
        expect(getInitials('')).toBe('');
    });

    test('returns empty string for whitespace-only input', () => {
        expect(getInitials('   ')).toBe('');
    });

    test('uppercases initials regardless of input case', () => {
        expect(getInitials('john doe')).toBe('JD');
    });
});

// ─── 2. to12hr (AskMentor / BookingModal) ─────────────────────────────────────

const to12hr = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};

describe('to12hr (AskMentor)', () => {
    test('converts midnight (00:00) to 12:00 AM', () => {
        expect(to12hr('00:00')).toBe('12:00 AM');
    });

    test('converts noon (12:00) to 12:00 PM', () => {
        expect(to12hr('12:00')).toBe('12:00 PM');
    });

    test('converts 09:30 to 9:30 AM', () => {
        expect(to12hr('09:30')).toBe('9:30 AM');
    });

    test('converts 13:45 to 1:45 PM', () => {
        expect(to12hr('13:45')).toBe('1:45 PM');
    });

    test('converts 23:59 to 11:59 PM', () => {
        expect(to12hr('23:59')).toBe('11:59 PM');
    });

    test('pads minutes with leading zero', () => {
        expect(to12hr('08:05')).toBe('8:05 AM');
    });

    test('returns empty string for null/undefined', () => {
        expect(to12hr(null)).toBe('');
        expect(to12hr(undefined)).toBe('');
    });

    test('returns empty string for empty string input', () => {
        expect(to12hr('')).toBe('');
    });
});

// ─── 3. rangeOverlapsBusy (AskMentor / BookingModal) ──────────────────────────

const rangeOverlapsBusy = (schedule, dayName, from, to) => {
    if (!schedule || !from || !to) return false;
    const dayEntry = schedule.weeklySchedule?.find(d => d.day === dayName);
    if (!dayEntry) return false;
    const busySlots = dayEntry.classes || [];
    return busySlots.some(slot => {
        const slotStart = slot.startTime ?? slot.from;
        const slotEnd   = slot.endTime   ?? slot.to;
        if (!slotStart || !slotEnd) return false;
        return from < slotEnd && to > slotStart;
    });
};

describe('rangeOverlapsBusy (AskMentor)', () => {
    const makeSchedule = (classes) => ({
        weeklySchedule: [{ day: 'Monday', classes }]
    });

    test('returns false when schedule is null', () => {
        expect(rangeOverlapsBusy(null, 'Monday', '09:00', '10:00')).toBe(false);
    });

    test('returns false when from or to is missing', () => {
        const s = makeSchedule([{ startTime: '09:00', endTime: '10:00' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '', '10:00')).toBe(false);
        expect(rangeOverlapsBusy(s, 'Monday', '09:00', '')).toBe(false);
    });

    test('returns false when day has no entry in schedule', () => {
        const s = makeSchedule([{ startTime: '09:00', endTime: '10:00' }]);
        expect(rangeOverlapsBusy(s, 'Friday', '09:00', '10:00')).toBe(false);
    });

    test('detects exact overlap with a busy slot', () => {
        const s = makeSchedule([{ startTime: '09:00', endTime: '10:00' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '09:00', '10:00')).toBe(true);
    });

    test('detects partial overlap — starts inside busy slot', () => {
        const s = makeSchedule([{ startTime: '09:00', endTime: '10:00' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '09:30', '10:30')).toBe(true);
    });

    test('detects partial overlap — ends inside busy slot', () => {
        const s = makeSchedule([{ startTime: '09:00', endTime: '10:00' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '08:00', '09:30')).toBe(true);
    });

    test('detects overlap when busy slot is fully contained', () => {
        const s = makeSchedule([{ startTime: '09:00', endTime: '10:00' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '08:00', '11:00')).toBe(true);
    });

    test('returns false for adjacent range (ends exactly when slot starts)', () => {
        const s = makeSchedule([{ startTime: '10:00', endTime: '11:00' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '09:00', '10:00')).toBe(false);
    });

    test('returns false for range after slot', () => {
        const s = makeSchedule([{ startTime: '09:00', endTime: '10:00' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '10:30', '11:30')).toBe(false);
    });

    test('supports slot.from / slot.to alias keys', () => {
        const s = { weeklySchedule: [{ day: 'Monday', classes: [{ from: '09:00', to: '10:00' }] }] };
        expect(rangeOverlapsBusy(s, 'Monday', '09:30', '10:30')).toBe(true);
    });

    test('skips slots missing both startTime and from', () => {
        const s = makeSchedule([{}]);
        expect(rangeOverlapsBusy(s, 'Monday', '09:00', '10:00')).toBe(false);
    });
});

// ─── 4. isInsideFreeSlot (BookingModal) ───────────────────────────────────────

const isInsideFreeSlot = (freeSlotsForDay, from, to) => {
    if (!from || !to || freeSlotsForDay.length === 0) return false;
    return freeSlotsForDay.some(slot =>
        from >= slot.startTime && to <= slot.endTime
    );
};

describe('isInsideFreeSlot (BookingModal)', () => {
    const slots = [{ startTime: '10:00', endTime: '12:00' }];

    test('returns true when range is entirely within a free slot', () => {
        expect(isInsideFreeSlot(slots, '10:30', '11:30')).toBe(true);
    });

    test('returns true when range exactly matches a free slot', () => {
        expect(isInsideFreeSlot(slots, '10:00', '12:00')).toBe(true);
    });

    test('returns false when range starts before the slot', () => {
        expect(isInsideFreeSlot(slots, '09:30', '11:00')).toBe(false);
    });

    test('returns false when range ends after the slot', () => {
        expect(isInsideFreeSlot(slots, '11:00', '12:30')).toBe(false);
    });

    test('returns false when no free slots', () => {
        expect(isInsideFreeSlot([], '10:00', '11:00')).toBe(false);
    });

    test('returns false when from or to is empty', () => {
        expect(isInsideFreeSlot(slots, '', '11:00')).toBe(false);
        expect(isInsideFreeSlot(slots, '10:00', '')).toBe(false);
    });

    test('returns true when multiple slots and range fits in second one', () => {
        const multiSlots = [
            { startTime: '08:00', endTime: '09:00' },
            { startTime: '10:00', endTime: '12:00' },
        ];
        expect(isInsideFreeSlot(multiSlots, '10:30', '11:00')).toBe(true);
    });
});

// ─── 5. getDueDateClasses (MyActivity / MyAssessments) ────────────────────────

const getDueDateClasses = (dateStr, isCompleted) => {
    if (isCompleted) return 'text-gray-400';
    if (!dateStr) return 'text-gray-400';
    const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff < 0)   return 'text-red-500';
    if (diff <= 2)  return 'text-orange-500';
    if (diff <= 5)  return 'text-yellow-500';
    return 'text-gray-500';
};

describe('getDueDateClasses (MyActivity)', () => {
    const future = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const past   = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    test('returns gray when task is completed regardless of date', () => {
        expect(getDueDateClasses(past(1), true)).toBe('text-gray-400');
    });

    test('returns gray when no date provided', () => {
        expect(getDueDateClasses(null, false)).toBe('text-gray-400');
        expect(getDueDateClasses('', false)).toBe('text-gray-400');
    });

    test('returns red for overdue tasks', () => {
        expect(getDueDateClasses(past(1), false)).toBe('text-red-500');
    });

    test('returns orange when due within 2 days', () => {
        expect(getDueDateClasses(future(1), false)).toBe('text-orange-500');
    });

    test('returns yellow when due within 3-5 days', () => {
        expect(getDueDateClasses(future(4), false)).toBe('text-yellow-500');
    });

    test('returns gray-500 when due in more than 5 days', () => {
        expect(getDueDateClasses(future(10), false)).toBe('text-gray-500');
    });
});

// ─── 6. getCheckboxClasses (MyActivity) ───────────────────────────────────────

const getCheckboxClasses = (status) => {
    switch (status) {
        case 'completed': return 'border-green-500 bg-green-500';
        case 'late':      return 'border-red-400 bg-red-400';
        case 'missed':    return 'border-red-400 bg-transparent';
        default:          return 'border-yellow-400 bg-transparent';
    }
};

describe('getCheckboxClasses (MyActivity)', () => {
    test('completed → green filled', () => {
        expect(getCheckboxClasses('completed')).toBe('border-green-500 bg-green-500');
    });

    test('late → red filled', () => {
        expect(getCheckboxClasses('late')).toBe('border-red-400 bg-red-400');
    });

    test('missed → red border, transparent bg', () => {
        expect(getCheckboxClasses('missed')).toBe('border-red-400 bg-transparent');
    });

    test('pending (default) → yellow border, transparent bg', () => {
        expect(getCheckboxClasses('pending')).toBe('border-yellow-400 bg-transparent');
    });

    test('unknown status falls to default', () => {
        expect(getCheckboxClasses('unknown')).toBe('border-yellow-400 bg-transparent');
    });
});

// ─── 7. fileIconMap (CourseFilesDrawer) ───────────────────────────────────────

const fileIconMap = (url = '') => {
    const ext = url.split('?')[0].split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext))
        return { color: 'text-pink-500', bg: 'bg-pink-50' };
    if (['pdf'].includes(ext))
        return { color: 'text-red-500', bg: 'bg-red-50' };
    if (['doc', 'docx'].includes(ext))
        return { color: 'text-blue-500', bg: 'bg-blue-50' };
    return { color: 'text-gray-500', bg: 'bg-gray-100' };
};

describe('fileIconMap (CourseFilesDrawer)', () => {
    test('returns pink for image extensions', () => {
        ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].forEach(ext => {
            expect(fileIconMap(`file.${ext}`).color).toBe('text-pink-500');
        });
    });

    test('returns red for pdf', () => {
        expect(fileIconMap('report.pdf').color).toBe('text-red-500');
    });

    test('returns blue for doc/docx', () => {
        expect(fileIconMap('essay.docx').color).toBe('text-blue-500');
        expect(fileIconMap('essay.doc').color).toBe('text-blue-500');
    });

    test('returns gray for unknown extensions', () => {
        expect(fileIconMap('archive.zip').color).toBe('text-gray-500');
    });

    test('strips query string before extracting extension', () => {
        expect(fileIconMap('lecture.pdf?token=abc123').color).toBe('text-red-500');
    });

    test('lowercases extension before matching', () => {
        expect(fileIconMap('IMAGE.PNG').color).toBe('text-pink-500');
    });

    test('returns gray for empty URL', () => {
        expect(fileIconMap('').color).toBe('text-gray-500');
    });
});

// ─── 8. filterUsers (ManageUsers) ─────────────────────────────────────────────

const filterUsers = (userList, { searchQuery = '', roleFilter = 'all', statusFilter = 'all' }) => {
    const q = searchQuery.toLowerCase();
    return userList.filter(u => {
        if (roleFilter   !== 'all' && u.role   !== roleFilter)   return false;
        if (statusFilter !== 'all' && u.status !== statusFilter) return false;
        return (
            u.name?.toLowerCase().includes(q)       ||
            u.email?.toLowerCase().includes(q)      ||
            u.studentID?.toLowerCase().includes(q)  ||
            u.department?.toLowerCase().includes(q)
        );
    });
};

describe('filterUsers (ManageUsers)', () => {
    const users = [
        { id: 's1', name: 'Alice',   email: 'alice@uni.edu',   role: 'student', status: 'verified',  department: 'CSE', studentID: 'S001' },
        { id: 's2', name: 'Bob',     email: 'bob@uni.edu',     role: 'student', status: 'pending',   department: 'EEE', studentID: 'S002' },
        { id: 'f1', name: 'Dr Amin', email: 'amin@uni.edu',    role: 'faculty', status: 'verified',  department: 'CSE', studentID: null   },
        { id: 'f2', name: 'Dr Reza', email: 'reza@uni.edu',    role: 'faculty', status: 'suspended', department: 'EEE', studentID: null   },
    ];

    test('returns all users when no filters applied', () => {
        expect(filterUsers(users, {})).toHaveLength(4);
    });

    test('filters by role: student', () => {
        const result = filterUsers(users, { roleFilter: 'student' });
        expect(result.every(u => u.role === 'student')).toBe(true);
        expect(result).toHaveLength(2);
    });

    test('filters by role: faculty', () => {
        expect(filterUsers(users, { roleFilter: 'faculty' })).toHaveLength(2);
    });

    test('filters by status: verified', () => {
        const result = filterUsers(users, { statusFilter: 'verified' });
        expect(result.every(u => u.status === 'verified')).toBe(true);
    });

    test('filters by status: pending', () => {
        const result = filterUsers(users, { statusFilter: 'pending' });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Bob');
    });

    test('filters by status: suspended', () => {
        const result = filterUsers(users, { statusFilter: 'suspended' });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Dr Reza');
    });

    test('chains role and status filters', () => {
        const result = filterUsers(users, { roleFilter: 'student', statusFilter: 'pending' });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Bob');
    });

    test('searches by name (case-insensitive)', () => {
        expect(filterUsers(users, { searchQuery: 'alice' })).toHaveLength(1);
    });

    test('searches by email', () => {
        expect(filterUsers(users, { searchQuery: 'amin@uni' })).toHaveLength(1);
    });

    test('searches by studentID', () => {
        expect(filterUsers(users, { searchQuery: 'S001' })).toHaveLength(1);
    });

    test('searches by department', () => {
        const result = filterUsers(users, { searchQuery: 'CSE' });
        expect(result).toHaveLength(2);
    });

    test('returns empty array when no match', () => {
        expect(filterUsers(users, { searchQuery: 'zzznomatch' })).toHaveLength(0);
    });
});

// ─── 9. sortUsers (ManageUsers) ───────────────────────────────────────────────

const sortUsers = (list, sortField, sortDir) =>
    [...list].sort((a, b) => {
        const valA = (a[sortField] ?? '').toString().toLowerCase();
        const valB = (b[sortField] ?? '').toString().toLowerCase();
        const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
    });

describe('sortUsers (ManageUsers)', () => {
    const users = [
        { name: 'Charlie', role: 'student',  status: 'verified',  department: 'CSE' },
        { name: 'Alice',   role: 'faculty',  status: 'pending',   department: 'EEE' },
        { name: 'Bob',     role: 'student',  status: 'suspended', department: 'CSE' },
    ];

    test('sorts by name ascending', () => {
        const sorted = sortUsers(users, 'name', 'asc');
        expect(sorted.map(u => u.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    test('sorts by name descending', () => {
        const sorted = sortUsers(users, 'name', 'desc');
        expect(sorted.map(u => u.name)).toEqual(['Charlie', 'Bob', 'Alice']);
    });

    test('sorts by role', () => {
        const sorted = sortUsers(users, 'role', 'asc');
        expect(sorted[0].role).toBe('faculty');
    });

    test('sorts by department', () => {
        const sorted = sortUsers(users, 'department', 'asc');
        expect(sorted[0].department).toBe('CSE');
    });

    test('does not mutate the original array', () => {
        const original = [...users];
        sortUsers(users, 'name', 'desc');
        expect(users[0].name).toBe(original[0].name);
    });

    test('handles null/undefined field values gracefully', () => {
        const withNull = [{ name: null }, { name: 'Alice' }];
        const sorted = sortUsers(withNull, 'name', 'asc');
        expect(sorted[0].name).toBe(null);
    });
});

// ─── 10. filterFaculties (ManageMentorship) ───────────────────────────────────

const filterFaculties = (faculties, { searchQuery = '', supervisorFilter = 'all' }) => {
    const q = searchQuery.toLowerCase();
    return faculties.filter(f => {
        if (supervisorFilter === 'supervisor'     && !f.isSupervisor) return false;
        if (supervisorFilter === 'non-supervisor' &&  f.isSupervisor) return false;
        return (
            f.name?.toLowerCase().includes(q)        ||
            f.email?.toLowerCase().includes(q)       ||
            f.department?.toLowerCase().includes(q)  ||
            f.designation?.toLowerCase().includes(q)
        );
    });
};

describe('filterFaculties (ManageMentorship)', () => {
    const faculties = [
        { name: 'Dr Rahman', email: 'rahman@uni.edu', department: 'CSE', designation: 'Professor', isSupervisor: true  },
        { name: 'Dr Karim',  email: 'karim@uni.edu',  department: 'EEE', designation: 'Lecturer',  isSupervisor: false },
        { name: 'Dr Ali',    email: 'ali@uni.edu',    department: 'CSE', designation: 'Associate',  isSupervisor: true  },
    ];

    test('returns all when no filter applied', () => {
        expect(filterFaculties(faculties, {})).toHaveLength(3);
    });

    test('filters to supervisors only', () => {
        const result = filterFaculties(faculties, { supervisorFilter: 'supervisor' });
        expect(result.every(f => f.isSupervisor)).toBe(true);
        expect(result).toHaveLength(2);
    });

    test('filters to non-supervisors only', () => {
        const result = filterFaculties(faculties, { supervisorFilter: 'non-supervisor' });
        expect(result.every(f => !f.isSupervisor)).toBe(true);
        expect(result).toHaveLength(1);
    });

    test('searches by name', () => {
        expect(filterFaculties(faculties, { searchQuery: 'karim' })).toHaveLength(1);
    });

    test('searches by department', () => {
        expect(filterFaculties(faculties, { searchQuery: 'CSE' })).toHaveLength(2);
    });

    test('searches by designation', () => {
        expect(filterFaculties(faculties, { searchQuery: 'lecturer' })).toHaveLength(1);
    });

    test('combines search and supervisor filter', () => {
        const result = filterFaculties(faculties, { searchQuery: 'CSE', supervisorFilter: 'supervisor' });
        expect(result).toHaveLength(2);
        expect(result.every(f => f.isSupervisor && f.department === 'CSE')).toBe(true);
    });
});

// ─── 11. paginateList (all paginated views) ───────────────────────────────────

const paginateList = (list, currentPage, itemsPerPage) =>
    list.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

describe('paginateList', () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    test('returns first page correctly', () => {
        const page = paginateList(items, 1, 10);
        expect(page).toHaveLength(10);
        expect(page[0].id).toBe(1);
    });

    test('returns second page correctly', () => {
        const page = paginateList(items, 2, 10);
        expect(page[0].id).toBe(11);
        expect(page).toHaveLength(10);
    });

    test('returns partial last page', () => {
        const page = paginateList(items, 3, 10);
        expect(page).toHaveLength(5);
        expect(page[0].id).toBe(21);
    });

    test('returns empty array for out-of-range page', () => {
        expect(paginateList(items, 10, 10)).toHaveLength(0);
    });

    test('no overlap between adjacent pages', () => {
        const p1 = paginateList(items, 1, 5).map(i => i.id);
        const p2 = paginateList(items, 2, 5).map(i => i.id);
        expect(p1.filter(id => p2.includes(id))).toHaveLength(0);
    });
});

// ─── 12. totalPages ───────────────────────────────────────────────────────────

const computeTotalPages = (list, itemsPerPage) =>
    Math.max(1, Math.ceil(list.length / itemsPerPage));

describe('totalPages', () => {
    test('returns 1 for empty list', () => {
        expect(computeTotalPages([], 10)).toBe(1);
    });

    test('returns 1 when items fit in one page', () => {
        expect(computeTotalPages(Array(5), 10)).toBe(1);
    });

    test('returns correct page count', () => {
        expect(computeTotalPages(Array(25), 10)).toBe(3);
    });

    test('returns exact count when list is multiple of page size', () => {
        expect(computeTotalPages(Array(20), 10)).toBe(2);
    });
});

// ─── 13. getStatusBadgeClass (FacultyMyAppointments) ─────────────────────────

const getStatusBadgeClass = (status) => {
    if (status === 'pending')   return 'bg-amber-100 text-amber-700';
    if (status === 'approved')  return 'bg-green-100 text-green-700';
    if (status === 'completed') return 'bg-blue-100 text-blue-700';
    if (status === 'cancelled') return 'bg-red-100 text-red-700';
    if (status === 'rejected')  return 'bg-gray-200 text-gray-700';
    return 'bg-gray-100 text-gray-700';
};

describe('getStatusBadgeClass (FacultyMyAppointments)', () => {
    test('pending → amber', () => {
        expect(getStatusBadgeClass('pending')).toBe('bg-amber-100 text-amber-700');
    });

    test('approved → green', () => {
        expect(getStatusBadgeClass('approved')).toBe('bg-green-100 text-green-700');
    });

    test('completed → blue', () => {
        expect(getStatusBadgeClass('completed')).toBe('bg-blue-100 text-blue-700');
    });

    test('cancelled → red', () => {
        expect(getStatusBadgeClass('cancelled')).toBe('bg-red-100 text-red-700');
    });

    test('rejected → gray-200', () => {
        expect(getStatusBadgeClass('rejected')).toBe('bg-gray-200 text-gray-700');
    });

    test('unknown → default gray-100', () => {
        expect(getStatusBadgeClass('unknown')).toBe('bg-gray-100 text-gray-700');
    });
});

// ─── 14. buildCourseCode (FacultyMyCourses) ───────────────────────────────────

const buildCourseCode = (subject, year, semester, serial) => {
    if (!subject || !year || !semester || !serial) return '';
    return `${subject} ${year[0]}${semester[0]}${serial}`;
};

describe('buildCourseCode (FacultyMyCourses)', () => {
    test('builds correct code from all parts', () => {
        expect(buildCourseCode('CSE', '3rd', '2nd', '09')).toBe('CSE 3209');
    });

    test('uses first char of year and semester', () => {
        expect(buildCourseCode('EEE', '1st', '1st', '01')).toBe('EEE 1101');
    });

    test('returns empty string when subject is missing', () => {
        expect(buildCourseCode('', '3rd', '2nd', '09')).toBe('');
    });

    test('returns empty string when serial is missing', () => {
        expect(buildCourseCode('CSE', '3rd', '2nd', '')).toBe('');
    });
});

// ─── 15. validateSessionFormat (FacultyMyCourses) ─────────────────────────────

const validateSession = (session) => /^\d{4}-\d{4}$/.test(session);

describe('validateSessionFormat (FacultyMyCourses)', () => {
    test('accepts valid YYYY-YYYY format', () => {
        expect(validateSession('2023-2024')).toBe(true);
    });

    test('rejects short year format', () => {
        expect(validateSession('23-24')).toBe(false);
    });

    test('rejects slash separator', () => {
        expect(validateSession('2023/2024')).toBe(false);
    });

    test('rejects no separator', () => {
        expect(validateSession('20232024')).toBe(false);
    });

    test('rejects empty string', () => {
        expect(validateSession('')).toBe(false);
    });
});

// ─── 16. deriveAssignmentStatus (MyAssessments) ───────────────────────────────

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

    test('pending when no submission and due date is future', () => {
        expect(deriveStatus({ submission: null, assignment: { dueDate: future } })).toBe('pending');
    });

    test('missed when no submission and due date is past', () => {
        expect(deriveStatus({ submission: null, assignment: { dueDate: past } })).toBe('missed');
    });

    test('graded when submission is graded', () => {
        expect(deriveStatus({ submission: { isGraded: true }, assignment: { dueDate: future } })).toBe('graded');
    });

    test('submitted when submission exists but not graded', () => {
        expect(deriveStatus({ submission: { isGraded: false }, assignment: { dueDate: past } })).toBe('submitted');
    });
});

// ─── 17. gradeColor (MyAssessments) ───────────────────────────────────────────

const gradeColor = (marks, total) => {
    if (!total) return 'text-gray-900';
    const pct = (marks / total) * 100;
    if (pct >= 80) return 'text-green-600';
    if (pct >= 60) return 'text-orange-500';
    return 'text-red-500';
};

describe('gradeColor (MyAssessments)', () => {
    test('returns gray when total is 0 or null', () => {
        expect(gradeColor(0, 0)).toBe('text-gray-900');
        expect(gradeColor(10, null)).toBe('text-gray-900');
    });

    test('returns green for >= 80%', () => {
        expect(gradeColor(80, 100)).toBe('text-green-600');
        expect(gradeColor(100, 100)).toBe('text-green-600');
    });

    test('returns orange for 60-79%', () => {
        expect(gradeColor(60, 100)).toBe('text-orange-500');
        expect(gradeColor(79, 100)).toBe('text-orange-500');
    });

    test('returns red for < 60%', () => {
        expect(gradeColor(59, 100)).toBe('text-red-500');
        expect(gradeColor(0, 100)).toBe('text-red-500');
    });
});

// ─── 18. getWeekRange (MyAssessments) ─────────────────────────────────────────

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon = new Date(now);
    mon.setDate(now.getDate() + diff);
    mon.setHours(0, 0, 0, 0);
    return WEEKDAYS.map((_, i) => {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        return d;
    });
};

describe('getWeekRange (MyAssessments)', () => {
    test('returns exactly 5 dates', () => {
        expect(getWeekRange()).toHaveLength(5);
    });

    test('all dates are consecutive days', () => {
        const range = getWeekRange();
        for (let i = 1; i < range.length; i++) {
            const diff = (range[i] - range[i - 1]) / (1000 * 60 * 60 * 24);
            expect(diff).toBe(1);
        }
    });

    test('first date is a Monday (getDay() === 1)', () => {
        expect(getWeekRange()[0].getDay()).toBe(1);
    });

    test('last date is a Friday (getDay() === 5)', () => {
        const range = getWeekRange();
        expect(range[range.length - 1].getDay()).toBe(5);
    });
});

// ─── 19. filterProjects (MyProjects) ──────────────────────────────────────────

const filterProjects = (projects, searchQuery, statusFilter) =>
    projects.filter(project => {
        const matchesSearch =
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.courseName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

describe('filterProjects (MyProjects)', () => {
    const projects = [
        { id: 1, title: 'E-Commerce Platform', course: 'CSE 3220', courseName: 'Software Engineering', status: 'in-progress' },
        { id: 2, title: 'Network Analyzer',    course: 'CSE 3230', courseName: 'Computer Networks',   status: 'in-progress' },
        { id: 3, title: 'Sorting Visualizer',  course: 'CSE 3250', courseName: 'Algorithm Analysis',  status: 'completed'   },
        { id: 4, title: 'AI Chatbot',          course: 'CSE 3260', courseName: 'Artificial Intelligence', status: 'not-started' },
    ];

    test('returns all when no filters', () => {
        expect(filterProjects(projects, '', 'all')).toHaveLength(4);
    });

    test('filters by status: completed', () => {
        const result = filterProjects(projects, '', 'completed');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(3);
    });

    test('filters by status: not-started', () => {
        expect(filterProjects(projects, '', 'not-started')).toHaveLength(1);
    });

    test('searches by title (case-insensitive)', () => {
        expect(filterProjects(projects, 'chatbot', 'all')).toHaveLength(1);
    });

    test('searches by course code', () => {
        expect(filterProjects(projects, 'CSE 3220', 'all')).toHaveLength(1);
    });

    test('searches by course name', () => {
        expect(filterProjects(projects, 'networks', 'all')).toHaveLength(1);
    });

    test('combines search and status filter', () => {
        const result = filterProjects(projects, 'CSE', 'in-progress');
        expect(result).toHaveLength(2);
    });

    test('returns empty array when no match', () => {
        expect(filterProjects(projects, 'zzznomatch', 'all')).toHaveLength(0);
    });
});

// ─── 20. getStatusBadgeClass / getPriorityBadgeClass (MyProjects) ─────────────

const getProjectStatusBadgeClass = (status) => {
    const classes = {
        'in-progress':  'bg-blue-100 text-blue-700',
        'completed':    'bg-green-100 text-green-700',
        'review':       'bg-purple-100 text-purple-700',
        'not-started':  'bg-gray-100 text-gray-700',
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
};

const getPriorityBadgeClass = (priority) => {
    const classes = {
        high:   'bg-red-100 text-red-700',
        medium: 'bg-orange-100 text-orange-700',
        low:    'bg-green-100 text-green-700',
    };
    return classes[priority] || 'bg-gray-100 text-gray-700';
};

describe('project badge helpers (MyProjects)', () => {
    test('status: in-progress → blue', () => {
        expect(getProjectStatusBadgeClass('in-progress')).toBe('bg-blue-100 text-blue-700');
    });

    test('status: completed → green', () => {
        expect(getProjectStatusBadgeClass('completed')).toBe('bg-green-100 text-green-700');
    });

    test('status: review → purple', () => {
        expect(getProjectStatusBadgeClass('review')).toBe('bg-purple-100 text-purple-700');
    });

    test('status: not-started → gray', () => {
        expect(getProjectStatusBadgeClass('not-started')).toBe('bg-gray-100 text-gray-700');
    });

    test('priority: high → red', () => {
        expect(getPriorityBadgeClass('high')).toBe('bg-red-100 text-red-700');
    });

    test('priority: medium → orange', () => {
        expect(getPriorityBadgeClass('medium')).toBe('bg-orange-100 text-orange-700');
    });

    test('priority: low → green', () => {
        expect(getPriorityBadgeClass('low')).toBe('bg-green-100 text-green-700');
    });

    test('unknown priority → default gray', () => {
        expect(getPriorityBadgeClass('unknown')).toBe('bg-gray-100 text-gray-700');
    });
});

// ─── 21. statsFromCourses (Overview — admin) ──────────────────────────────────

const computeCourseStats = (courses) => ({
    totalCourses:    courses.length,
    activeCount:     courses.filter(c => c.status === 'active').length,
    completedCount:  courses.filter(c => c.status === 'completed').length,
});

describe('statsFromCourses (Overview)', () => {
    const courses = [
        { id: 'c1', status: 'active'    },
        { id: 'c2', status: 'active'    },
        { id: 'c3', status: 'completed' },
    ];

    test('counts total, active and completed correctly', () => {
        const stats = computeCourseStats(courses);
        expect(stats.totalCourses).toBe(3);
        expect(stats.activeCount).toBe(2);
        expect(stats.completedCount).toBe(1);
    });

    test('returns zeros for empty course list', () => {
        const stats = computeCourseStats([]);
        expect(stats.totalCourses).toBe(0);
        expect(stats.activeCount).toBe(0);
        expect(stats.completedCount).toBe(0);
    });
});

// ─── 22. filterCourses (Overview — admin) ─────────────────────────────────────

const filterCourses = (courses, searchQuery, statusFilter) => {
    const q = searchQuery.toLowerCase();
    return courses.filter(c => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        return (
            c.courseCode?.toLowerCase().includes(q) ||
            c.courseName?.toLowerCase().includes(q) ||
            c.department?.toLowerCase().includes(q) ||
            c.faculties?.some(f => f.name?.toLowerCase().includes(q))
        );
    });
};

describe('filterCourses (Overview)', () => {
    const courses = [
        { courseCode: 'CSE 3101', courseName: 'Algorithms', department: 'CSE', status: 'active',    faculties: [{ name: 'Dr Amin' }] },
        { courseCode: 'EEE 2201', courseName: 'Circuits',   department: 'EEE', status: 'completed', faculties: [{ name: 'Dr Reza' }] },
        { courseCode: 'CSE 4101', courseName: 'AI',         department: 'CSE', status: 'active',    faculties: [{ name: 'Dr Hasan' }] },
    ];

    test('returns all when no filter applied', () => {
        expect(filterCourses(courses, '', 'all')).toHaveLength(3);
    });

    test('filters by status: active', () => {
        expect(filterCourses(courses, '', 'active')).toHaveLength(2);
    });

    test('filters by status: completed', () => {
        expect(filterCourses(courses, '', 'completed')).toHaveLength(1);
    });

    test('searches by courseCode', () => {
        expect(filterCourses(courses, 'CSE 3101', 'all')).toHaveLength(1);
    });

    test('searches by courseName', () => {
        expect(filterCourses(courses, 'circuits', 'all')).toHaveLength(1);
    });

    test('searches by department', () => {
        expect(filterCourses(courses, 'CSE', 'all')).toHaveLength(2);
    });

    test('searches by faculty name', () => {
        expect(filterCourses(courses, 'dr amin', 'all')).toHaveLength(1);
    });

    test('combines search and status', () => {
        expect(filterCourses(courses, 'CSE', 'active')).toHaveLength(2);
    });
});

// ─── 23. isToday (Notifications) ──────────────────────────────────────────────

const isToday = (dateString) => {
    const created = new Date(dateString);
    const today   = new Date();
    return (
        created.getFullYear() === today.getFullYear() &&
        created.getMonth()    === today.getMonth()    &&
        created.getDate()     === today.getDate()
    );
};

describe('isToday (Notifications)', () => {
    test('returns true for the current date', () => {
        expect(isToday(new Date().toISOString())).toBe(true);
    });

    test('returns false for a past date', () => {
        expect(isToday('2020-01-01T00:00:00Z')).toBe(false);
    });

    test('returns false for a future date', () => {
        const future = new Date();
        future.setDate(future.getDate() + 1);
        expect(isToday(future.toISOString())).toBe(false);
    });
});

// ─── 24. onlineUsers Set helpers (ChatPage) ───────────────────────────────────

describe('onlineUsers Set helpers (ChatPage)', () => {
    test('adds userId to Set on userOnline event', () => {
        const onlineUsers = new Set();
        const addUser = (id) => new Set([...onlineUsers, id]);
        const updated = addUser('u1');
        expect(updated.has('u1')).toBe(true);
    });

    test('removes userId from Set on userOffline event', () => {
        let onlineUsers = new Set(['u1', 'u2']);
        const removeUser = (id) => { const s = new Set(onlineUsers); s.delete(id); return s; };
        onlineUsers = removeUser('u1');
        expect(onlineUsers.has('u1')).toBe(false);
        expect(onlineUsers.has('u2')).toBe(true);
    });

    test('onlineStatus: adds to set when isOnline is true', () => {
        const onlineUsers = new Set();
        const handleStatus = ({ userID, isOnline }) => {
            if (isOnline) return new Set([...onlineUsers, userID]);
            return onlineUsers;
        };
        const updated = handleStatus({ userID: 'u3', isOnline: true });
        expect(updated.has('u3')).toBe(true);
    });

    test('onlineStatus: does not add when isOnline is false', () => {
        const onlineUsers = new Set();
        const handleStatus = ({ userID, isOnline }) => {
            if (isOnline) return new Set([...onlineUsers, userID]);
            return onlineUsers;
        };
        const updated = handleStatus({ userID: 'u3', isOnline: false });
        expect(updated.has('u3')).toBe(false);
    });
});

// ─── 25. unreadCountLogic (ChatPage newMessage handler) ───────────────────────

describe('unreadCountLogic (ChatPage)', () => {
    const userId = 'me';

    const handleNewMessage = (prev, msg, currentConvPath) => {
        const isCurrentConversation = currentConvPath.includes(msg.conversation?.toString());
        const isReceiver = msg.sender?._id?.toString() !== userId;

        const exists = prev.some(
            item => item.conversationID?.toString() === msg.conversation?.toString()
        );

        if (exists) {
            return prev.map(item => {
                if (item.conversationID?.toString() === msg.conversation?.toString()) {
                    return {
                        ...item,
                        lastMessage: msg.content,
                        unreadCount: (isReceiver && !isCurrentConversation)
                            ? (item.unreadCount || 0) + 1
                            : item.unreadCount,
                    };
                }
                return item;
            });
        }

        return [{
            conversationID: msg.conversation,
            lastMessage: msg.content,
            unreadCount: (isReceiver && !isCurrentConversation) ? 1 : 0,
        }, ...prev];
    };

    test('increments unreadCount for receiver when not in current conversation', () => {
        const prev = [{ conversationID: 'c1', unreadCount: 0 }];
        const msg  = { conversation: 'c1', content: 'Hey', sender: { _id: 'other' }, createdAt: new Date().toISOString() };
        const result = handleNewMessage(prev, msg, '/dashboard/student/chat/c2');
        expect(result[0].unreadCount).toBe(1);
    });

    test('does NOT increment unreadCount when in current conversation', () => {
        const prev = [{ conversationID: 'c1', unreadCount: 0 }];
        const msg  = { conversation: 'c1', content: 'Hey', sender: { _id: 'other' }, createdAt: new Date().toISOString() };
        const result = handleNewMessage(prev, msg, '/dashboard/student/chat/c1');
        expect(result[0].unreadCount).toBe(0);
    });

    test('does NOT increment unreadCount when the user is the sender', () => {
        const prev = [{ conversationID: 'c1', unreadCount: 0 }];
        const msg  = { conversation: 'c1', content: 'My msg', sender: { _id: 'me' }, createdAt: new Date().toISOString() };
        const result = handleNewMessage(prev, msg, '/dashboard/student/chat/c2');
        expect(result[0].unreadCount).toBe(0);
    });

    test('creates new list entry for unknown conversation', () => {
        const prev   = [];
        const msg    = { conversation: 'c_new', content: 'Hi', sender: { _id: 'other' }, createdAt: new Date().toISOString() };
        const result = handleNewMessage(prev, msg, '/dashboard/student/chat/other');
        expect(result).toHaveLength(1);
        expect(result[0].conversationID).toBe('c_new');
        expect(result[0].unreadCount).toBe(1);
    });

    test('updates lastMessage on existing conversation', () => {
        const prev = [{ conversationID: 'c1', lastMessage: 'old', unreadCount: 0 }];
        const msg  = { conversation: 'c1', content: 'new message', sender: { _id: 'other' }, createdAt: new Date().toISOString() };
        const result = handleNewMessage(prev, msg, '/different/path');
        expect(result[0].lastMessage).toBe('new message');
    });
});

// ─── 26. formatName (shared utility) ──────────────────────────────────────────

describe('formatName (shared utility)', () => {
    test('capitalises first letter of each word', () => {
        expect(formatName('dr john doe')).toBe('Dr John Doe');
    });

    test('returns empty string for null/undefined', () => {
        expect(formatName(null)).toBe('');
        expect(formatName(undefined)).toBe('');
    });

    test('handles already-capitalised name', () => {
        expect(formatName('Dr Rahman')).toBe('Dr Rahman');
    });

    test('handles single word', () => {
        expect(formatName('alice')).toBe('Alice');
    });
});

// ─── 27. buildFileName (CourseFilesDrawer download) ───────────────────────────

const buildFileName = (url, title) => {
    const ext = url.split('?')[0].split('.').pop().toLowerCase();
    return `${title.replace(/\s+/g, '_')}.${ext}`;
};

describe('buildFileName (CourseFilesDrawer)', () => {
    test('builds correct filename from a clean URL', () => {
        expect(buildFileName('https://cdn.example.com/lecture.pdf', 'Week 1 Lecture'))
            .toBe('Week_1_Lecture.pdf');
    });

    test('strips query string before extracting extension', () => {
        expect(buildFileName('https://cdn.example.com/notes.docx?token=xyz123', 'My Notes'))
            .toBe('My_Notes.docx');
    });

    test('collapses multiple spaces to single underscore', () => {
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

// ─── 28. statsInfoComputation (FacultyMySchedule) ─────────────────────────────

const computeScheduleStats = (classEvents, appointmentEvents) => {
    const busyDaysSet  = new Set();
    let   totalMinutes = 0;

    [...classEvents, ...appointmentEvents].forEach(event => {
        const start = new Date(event.start);
        const end   = new Date(event.end);
        busyDaysSet.add(start.getDay());
        totalMinutes += (end - start) / (1000 * 60);
    });

    return {
        totalClasses:       classEvents.length,
        totalAppointments:  appointmentEvents.length,
        busyDays:           busyDaysSet.size,
        totalHours:         (totalMinutes / 60).toFixed(1),
    };
};

describe('statsInfoComputation (FacultyMySchedule)', () => {
    const classes = [
        { start: new Date('2026-04-13T09:00:00'), end: new Date('2026-04-13T10:00:00') }, // Monday
        { start: new Date('2026-04-14T10:00:00'), end: new Date('2026-04-14T11:00:00') }, // Tuesday
    ];

    const appointments = [
        { start: new Date('2026-04-13T11:00:00'), end: new Date('2026-04-13T11:30:00') }, // Monday
    ];

    test('counts classes and appointments separately', () => {
        const stats = computeScheduleStats(classes, appointments);
        expect(stats.totalClasses).toBe(2);
        expect(stats.totalAppointments).toBe(1);
    });

    test('counts unique busy days (Monday shared by class + appointment)', () => {
        const stats = computeScheduleStats(classes, appointments);
        expect(stats.busyDays).toBe(2); // Monday + Tuesday
    });

    test('computes totalHours correctly', () => {
        const stats = computeScheduleStats(classes, appointments);
        // 60 + 60 + 30 = 150 min = 2.5 h
        expect(stats.totalHours).toBe('2.5');
    });

    test('returns zeros for empty events', () => {
        const stats = computeScheduleStats([], []);
        expect(stats.totalClasses).toBe(0);
        expect(stats.busyDays).toBe(0);
        expect(stats.totalHours).toBe('0.0');
    });
});

// ─── 29. scheduleDayIndexMap (FacultyMySchedule classEvents) ──────────────────

describe('scheduleDayIndexMap (FacultyMySchedule)', () => {
    const dayIndexMap = {
        Sunday:    0,
        Monday:    1,
        Tuesday:   2,
        Wednesday: 3,
        Thursday:  4,
        Friday:    5,
        Saturday:  6,
    };

    test('each day maps to the correct JS getDay() index', () => {
        expect(dayIndexMap['Sunday']).toBe(0);
        expect(dayIndexMap['Monday']).toBe(1);
        expect(dayIndexMap['Thursday']).toBe(4);
        expect(dayIndexMap['Saturday']).toBe(6);
    });

    test('returns undefined for unknown day', () => {
        expect(dayIndexMap['Holiday']).toBeUndefined();
    });

    test('all 7 days are mapped', () => {
        expect(Object.keys(dayIndexMap)).toHaveLength(7);
    });
});

// ─── 30. appointmentStatusConfig completeness (MyActivity / AskMentor) ────────

describe('appointmentStatusConfig completeness (MyActivity / AskMentor)', () => {
    const appointmentStatusConfig = {
        approved:  { badge: 'bg-green-50 border border-green-200',  dot: 'bg-green-500',  label: 'Approved'  },
        pending:   { badge: 'bg-yellow-50 border border-yellow-200', dot: 'bg-yellow-400', label: 'Pending'   },
        cancelled: { badge: 'bg-red-50 border border-red-200',       dot: 'bg-red-500',    label: 'Cancelled' },
        rejected:  { badge: 'bg-red-50 border border-red-200',       dot: 'bg-red-400',    label: 'Rejected'  },
        completed: { badge: 'bg-blue-50 border border-blue-200',     dot: 'bg-blue-500',   label: 'Completed' },
    };

    test('all 5 statuses are defined', () => {
        ['approved', 'pending', 'cancelled', 'rejected', 'completed'].forEach(status => {
            expect(appointmentStatusConfig[status]).toBeDefined();
        });
    });

    test('each config entry has badge, dot and label', () => {
        Object.values(appointmentStatusConfig).forEach(cfg => {
            expect(cfg.badge).toBeDefined();
            expect(cfg.dot).toBeDefined();
            expect(cfg.label).toBeDefined();
        });
    });

    test('approved lookup by lowercase works', () => {
        const status = 'approved';
        const cfg = appointmentStatusConfig[status.toLowerCase()] || appointmentStatusConfig.pending;
        expect(cfg.label).toBe('Approved');
    });

    test('unknown status falls back to pending config', () => {
        const status = 'unknown';
        const cfg = appointmentStatusConfig[status.toLowerCase()] || appointmentStatusConfig.pending;
        expect(cfg.label).toBe('Pending');
    });
});