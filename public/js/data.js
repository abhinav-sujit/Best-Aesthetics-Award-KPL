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

// ==================== API-BASED EMPLOYEE FUNCTIONS ====================

// Get all employees from API (cached for session)
let employeesCache = null;

async function loadEmployees() {
    if (employeesCache) {
        return employeesCache;
    }

    try {
        const result = await getAllUsers();
        employeesCache = result.users.filter(u => !u.isAdmin);
        return employeesCache;
    } catch (error) {
        console.error('Failed to load employees:', error);
        return [];
    }
}

// Get employee by ID (async)
async function getEmployeeById(id) {
    const employees = await loadEmployees();
    return employees.find(emp => emp.id === id);
}

// Get employee by username (async)
async function getEmployeeByUsername(username) {
    const employees = await loadEmployees();
    return employees.find(emp => emp.username.toLowerCase() === username.toLowerCase());
}

// Clear employees cache (call after user management changes)
function clearEmployeesCache() {
    employeesCache = null;
}
