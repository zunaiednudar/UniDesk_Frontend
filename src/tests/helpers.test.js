/**
 * Unit tests for pure helper functions used across the UniDesk frontend.
 * These functions are extracted from their components and tested in isolation.
 */

// Helpers from AskMentor.jsx

const getInitials = (name = '') =>
    name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);

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

// Helpers from MyActivity.jsx

const getDueDateClasses = (dateStr, isCompleted) => {
    if (isCompleted) return 'text-gray-400';
    if (!dateStr) return 'text-gray-400';
    const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return 'text-red-500';
    if (diff <= 2) return 'text-orange-500';
    if (diff <= 5) return 'text-yellow-500';
    return 'text-gray-500';
};

const getCheckboxClasses = (status) => {
    switch (status) {
        case 'completed': return 'border-green-500 bg-green-500';
        case 'late':      return 'border-red-400 bg-red-400';
        case 'missed':    return 'border-red-400 bg-transparent';
        default:          return 'border-yellow-400 bg-transparent';
    }
};

// Helpers from CourseFilesDrawer.jsx

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

// Helpers from ManageUsers.jsx / ManageMentorship.jsx

/**
 * Filtering logic used in ManageUsers and ManageMentorship.
 * Extracted here to allow pure unit testing without rendering.
 */
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

const filterFaculties = (faculties, { searchQuery = '', supervisorFilter = 'all' }) => {
    const q = searchQuery.toLowerCase();
    return faculties.filter(f => {
        if (supervisorFilter === 'supervisor' && !f.isSupervisor) return false;
        if (supervisorFilter === 'non-supervisor' && f.isSupervisor) return false;
        return (
            f.name?.toLowerCase().includes(q) ||
            f.email?.toLowerCase().includes(q) ||
            f.department?.toLowerCase().includes(q) ||
            f.designation?.toLowerCase().includes(q)
        );
    });
};

const paginateList = (list, currentPage, itemsPerPage) =>
    list.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

const totalPages = (list, itemsPerPage) =>
    Math.max(1, Math.ceil(list.length / itemsPerPage));


// TEST SUITES

// getInitials
describe('getInitials', () => {
    test('returns two initials for a full name', () => {
        expect(getInitials('John Doe')).toBe('JD');
    });

    test('returns one initial for a single word name', () => {
        expect(getInitials('Alice')).toBe('A'); // only one word → one initial
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

// to12hr
describe('to12hr', () => {
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
});

// rangeOverlapsBusy
describe('rangeOverlapsBusy', () => {
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

    test('detects partial overlap — request starts during class', () => {
        const s = makeSchedule([{ startTime: '09:00', endTime: '10:00' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '09:30', '10:30')).toBe(true);
    });

    test('detects partial overlap — request ends during class', () => {
        const s = makeSchedule([{ startTime: '09:00', endTime: '10:00' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '08:30', '09:30')).toBe(true);
    });

    test('detects request that completely contains a class', () => {
        const s = makeSchedule([{ startTime: '09:00', endTime: '10:00' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '08:00', '11:00')).toBe(true);
    });

    test('returns false when request is entirely before the class', () => {
        const s = makeSchedule([{ startTime: '09:00', endTime: '10:00' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '07:00', '08:30')).toBe(false);
    });

    test('returns false when request is entirely after the class', () => {
        const s = makeSchedule([{ startTime: '09:00', endTime: '10:00' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '10:00', '11:00')).toBe(false);
    });

    test('supports alternate field names (from/to instead of startTime/endTime)', () => {
        const s = makeSchedule([{ from: '09:00', to: '10:00' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '09:30', '10:00')).toBe(true);
    });

    test('returns false if slot has no time fields', () => {
        const s = makeSchedule([{ courseName: 'Math' }]);
        expect(rangeOverlapsBusy(s, 'Monday', '09:00', '10:00')).toBe(false);
    });

    test('no overlap when day has no classes', () => {
        const s = makeSchedule([]);
        expect(rangeOverlapsBusy(s, 'Monday', '09:00', '10:00')).toBe(false);
    });
});

// getDueDateClasses
describe('getDueDateClasses', () => {
    const daysFromNow = (n) => {
        const d = new Date();
        d.setDate(d.getDate() + n);
        return d.toISOString();
    };

    test('returns gray if task is completed regardless of date', () => {
        expect(getDueDateClasses(daysFromNow(-5), true)).toBe('text-gray-400');
        expect(getDueDateClasses(daysFromNow(10), true)).toBe('text-gray-400');
    });

    test('returns gray if no date provided', () => {
        expect(getDueDateClasses(null, false)).toBe('text-gray-400');
        expect(getDueDateClasses('', false)).toBe('text-gray-400');
    });

    test('returns red for overdue dates', () => {
        expect(getDueDateClasses(daysFromNow(-1), false)).toBe('text-red-500');
    });

    test('returns orange for due within 2 days', () => {
        expect(getDueDateClasses(daysFromNow(1), false)).toBe('text-orange-500');
    });

    test('returns yellow for due within 5 days', () => {
        expect(getDueDateClasses(daysFromNow(4), false)).toBe('text-yellow-500');
    });

    test('returns gray for due in more than 5 days', () => {
        expect(getDueDateClasses(daysFromNow(10), false)).toBe('text-gray-500');
    });
});

// getCheckboxClasses
describe('getCheckboxClasses', () => {
    test('returns green for completed', () => {
        expect(getCheckboxClasses('completed')).toBe('border-green-500 bg-green-500');
    });

    test('returns filled red for late', () => {
        expect(getCheckboxClasses('late')).toBe('border-red-400 bg-red-400');
    });

    test('returns transparent red for missed', () => {
        expect(getCheckboxClasses('missed')).toBe('border-red-400 bg-transparent');
    });

    test('returns yellow transparent for pending/default', () => {
        expect(getCheckboxClasses('pending')).toBe('border-yellow-400 bg-transparent');
        expect(getCheckboxClasses(undefined)).toBe('border-yellow-400 bg-transparent');
    });
});

// fileIconMap
describe('fileIconMap', () => {
    test('maps jpg to pink image styling', () => {
        const r = fileIconMap('https://example.com/photo.jpg');
        expect(r.color).toBe('text-pink-500');
        expect(r.bg).toBe('bg-pink-50');
    });

    test('maps png to pink image styling', () => {
        expect(fileIconMap('image.png').color).toBe('text-pink-500');
    });

    test('maps svg to pink image styling', () => {
        expect(fileIconMap('icon.svg').color).toBe('text-pink-500');
    });

    test('maps pdf to red styling', () => {
        const r = fileIconMap('document.pdf');
        expect(r.color).toBe('text-red-500');
        expect(r.bg).toBe('bg-red-50');
    });

    test('maps docx to blue styling', () => {
        const r = fileIconMap('report.docx');
        expect(r.color).toBe('text-blue-500');
        expect(r.bg).toBe('bg-blue-50');
    });

    test('maps doc to blue styling', () => {
        expect(fileIconMap('notes.doc').color).toBe('text-blue-500');
    });

    test('maps unknown extension to gray fallback', () => {
        const r = fileIconMap('data.csv');
        expect(r.color).toBe('text-gray-500');
        expect(r.bg).toBe('bg-gray-100');
    });

    test('handles URLs with query strings — uses filename before ?', () => {
        expect(fileIconMap('https://cdn.example.com/file.pdf?token=abc').color).toBe('text-red-500');
    });

    test('returns gray for empty url', () => {
        expect(fileIconMap('').bg).toBe('bg-gray-100');
    });
});

// filterUsers (ManageUsers logic)
describe('filterUsers', () => {
    const users = [
        { name: 'Alice Smith', email: 'alice@uni.edu', role: 'student', status: 'verified', department: 'CSE', studentID: 'S001' },
        { name: 'Bob Faculty', email: 'bob@uni.edu', role: 'faculty', status: 'verified', department: 'EEE', studentID: null },
        { name: 'Charlie Doe', email: 'charlie@uni.edu', role: 'student', status: 'suspended', department: 'CSE', studentID: 'S002' },
        { name: 'Diana Admin', email: 'diana@uni.edu', role: 'faculty', status: 'pending', department: 'BBA', studentID: null },
    ];

    test('returns all users with default filters', () => {
        expect(filterUsers(users, {})).toHaveLength(4);
    });

    test('filters by role: student', () => {
        const result = filterUsers(users, { roleFilter: 'student' });
        expect(result).toHaveLength(2);
        result.forEach(u => expect(u.role).toBe('student'));
    });

    test('filters by role: faculty', () => {
        const result = filterUsers(users, { roleFilter: 'faculty' });
        expect(result).toHaveLength(2);
    });

    test('filters by status: suspended', () => {
        const result = filterUsers(users, { statusFilter: 'suspended' });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Charlie Doe');
    });

    test('filters by search query on name', () => {
        expect(filterUsers(users, { searchQuery: 'alice' })).toHaveLength(1);
    });

    test('filters by search query on email', () => {
        expect(filterUsers(users, { searchQuery: 'bob@uni' })).toHaveLength(1);
    });

    test('filters by search query on department', () => {
        expect(filterUsers(users, { searchQuery: 'CSE' })).toHaveLength(2);
    });

    test('filters by search query on studentID', () => {
        expect(filterUsers(users, { searchQuery: 'S002' })).toHaveLength(1);
    });

    test('combines role and status filters', () => {
        const result = filterUsers(users, { roleFilter: 'faculty', statusFilter: 'pending' });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Diana Admin');
    });

    test('returns empty array when nothing matches', () => {
        expect(filterUsers(users, { searchQuery: 'zzznomatch' })).toHaveLength(0);
    });
});

// sortUsers
describe('sortUsers', () => {
    const users = [
        { name: 'Charlie', role: 'student' },
        { name: 'Alice', role: 'faculty' },
        { name: 'Bob', role: 'student' },
    ];

    test('sorts by name ascending', () => {
        const result = sortUsers(users, 'name', 'asc');
        expect(result.map(u => u.name)).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    test('sorts by name descending', () => {
        const result = sortUsers(users, 'name', 'desc');
        expect(result.map(u => u.name)).toEqual(['Charlie', 'Bob', 'Alice']);
    });

    test('does not mutate original array', () => {
        const original = [...users];
        sortUsers(users, 'name', 'desc');
        expect(users).toEqual(original);
    });

    test('handles missing field values gracefully (treats as empty string)', () => {
        const list = [{ name: 'Zoe' }, { name: null }, { name: 'Amy' }];
        const result = sortUsers(list, 'name', 'asc');
        expect(result[0].name).toBeNull(); // null → '' → sorts first
    });
});

// filterFaculties (ManageMentorship logic)
describe('filterFaculties', () => {
    const faculties = [
        { name: 'Dr. Amin', email: 'amin@uni.edu', department: 'CSE', designation: 'Professor', isSupervisor: true },
        { name: 'Dr. Banu', email: 'banu@uni.edu', department: 'EEE', designation: 'Lecturer', isSupervisor: false },
        { name: 'Dr. Chowdhury', email: 'chow@uni.edu', department: 'CSE', designation: 'Associate Professor', isSupervisor: true },
    ];

    test('returns all when filter is all and no query', () => {
        expect(filterFaculties(faculties, {})).toHaveLength(3);
    });

    test('filters supervisors only', () => {
        const result = filterFaculties(faculties, { supervisorFilter: 'supervisor' });
        expect(result).toHaveLength(2);
        result.forEach(f => expect(f.isSupervisor).toBe(true));
    });

    test('filters non-supervisors only', () => {
        const result = filterFaculties(faculties, { supervisorFilter: 'non-supervisor' });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Dr. Banu');
    });

    test('searches by name', () => {
        expect(filterFaculties(faculties, { searchQuery: 'banu' })).toHaveLength(1);
    });

    test('searches by department', () => {
        expect(filterFaculties(faculties, { searchQuery: 'CSE' })).toHaveLength(2);
    });

    test('searches by designation', () => {
        expect(filterFaculties(faculties, { searchQuery: 'lecturer' })).toHaveLength(1);
    });

    test('combined: supervisor filter + search query', () => {
        const result = filterFaculties(faculties, { supervisorFilter: 'supervisor', searchQuery: 'amin' });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Dr. Amin');
    });

    test('returns empty when nothing matches', () => {
        expect(filterFaculties(faculties, { searchQuery: 'zzznomatch' })).toHaveLength(0);
    });
});

// paginateList & totalPages
describe('paginateList', () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    test('returns first 10 items on page 1', () => {
        const result = paginateList(items, 1, 10);
        expect(result).toHaveLength(10);
        expect(result[0].id).toBe(1);
    });

    test('returns items 11-20 on page 2', () => {
        const result = paginateList(items, 2, 10);
        expect(result[0].id).toBe(11);
        expect(result[9].id).toBe(20);
    });

    test('returns remaining 5 items on page 3', () => {
        expect(paginateList(items, 3, 10)).toHaveLength(5);
    });

    test('returns empty array beyond last page', () => {
        expect(paginateList(items, 10, 10)).toHaveLength(0);
    });
});

describe('totalPages', () => {
    test('returns 3 pages for 25 items at 10/page', () => {
        expect(totalPages(Array(25), 10)).toBe(3);
    });

    test('returns 1 page for exactly 10 items', () => {
        expect(totalPages(Array(10), 10)).toBe(1);
    });

    test('returns 1 minimum even for empty list', () => {
        expect(totalPages([], 10)).toBe(1);
    });

    test('returns correct pages for 1 item', () => {
        expect(totalPages(Array(1), 10)).toBe(1);
    });
});