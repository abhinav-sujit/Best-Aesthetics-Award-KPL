// Static data for KlimArt Premiere League
// Best Aesthetics Award - January 2026
// Version 2.0 - Backend Integration

// NOTE: Employee and admin data is now managed via the backend API
// Use the admin user management dashboard to create/edit/delete users

// January 2026 voting dates
// Excluded: Jan 1, 3, 4, 11, 14, 17, 18, 23, 25, 26
// Total voting days: 21

const JANUARY_2026_DATES = [
    "2026-01-02", // Fri
    "2026-01-05", // Mon
    "2026-01-06", // Tue
    "2026-01-07", // Wed
    "2026-01-08", // Thu
    "2026-01-09", // Fri
    "2026-01-10", // Sat
    "2026-01-12", // Mon
    "2026-01-13", // Tue
    "2026-01-15", // Thu
    "2026-01-16", // Fri
    "2026-01-19", // Mon
    "2026-01-20", // Tue
    "2026-01-21", // Wed
    "2026-01-22", // Thu
    "2026-01-24", // Sat
    "2026-01-27", // Tue
    "2026-01-28", // Wed
    "2026-01-29", // Thu
    "2026-01-30", // Fri
    "2026-01-31"  // Sat
];

// Helper function to format date for display
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// ==================== STATIC EMPLOYEE DATA ====================

// Static employee list (18 employees from complete-reset.sql)
const EMPLOYEES = [
    { id: 2, name: 'Kavya', username: 'kavya' },
    { id: 3, name: 'Ganesh', username: 'ganesh' },
    { id: 4, name: 'Sahil', username: 'sahil' },
    { id: 5, name: 'Prathiksha', username: 'prathiksha' },
    { id: 6, name: 'Arpana', username: 'arpana' },
    { id: 7, name: 'Hemanshu', username: 'hemanshu' },
    { id: 8, name: 'Migom', username: 'migom' },
    { id: 9, name: 'Nikita', username: 'nikita' },
    { id: 10, name: 'Sam', username: 'sam' },
    { id: 11, name: 'Satish', username: 'satish' },
    { id: 12, name: 'Sakshi', username: 'sakshi' },
    { id: 13, name: 'Sai Sidhardha', username: 'saisidhardha' },
    { id: 14, name: 'Abhinav', username: 'abhinav' },
    { id: 15, name: 'Shreya', username: 'shreya' },
    { id: 16, name: 'Ramya', username: 'ramya' },
    { id: 17, name: 'Chaitanya', username: 'chaitanya' },
    { id: 18, name: 'Mrummayee', username: 'mrummayee' },
    { id: 19, name: 'Mamatha', username: 'mamatha' }
];

const TOTAL_EMPLOYEES = 18;

// ==================== API-BASED EMPLOYEE FUNCTIONS ====================

// Get all employees (returns static list)
function loadEmployees() {
    return EMPLOYEES;
}

// Get employee by ID (synchronous)
function getEmployeeById(id) {
    return EMPLOYEES.find(emp => emp.id === id);
}

// Get employee by username (synchronous)
function getEmployeeByUsername(username) {
    return EMPLOYEES.find(emp => emp.username.toLowerCase() === username.toLowerCase());
}

// Fetch voting dates (with explicit sorting, no caching to avoid stale data)
async function loadVotingDates() {
    try {
        const result = await getVotingDates();
        if (result.success && result.dates) {
            // Sort dates chronologically to ensure correct order
            const sortedDates = result.dates.sort((a, b) => {
                return new Date(a.date) - new Date(b.date);
            });
            return sortedDates;
        }
        return [];
    } catch (error) {
        console.error('Failed to load voting dates:', error);
        return [];
    }
}
