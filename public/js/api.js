/**
 * API Client Layer
 * Handles all communication with the backend API
 */

const API_CONFIG = {
    baseUrl: window.location.origin + '/api',
    tokenKey: 'kpl_auth_token',
    userKey: 'kpl_user'
};

// ==================== TOKEN MANAGEMENT ====================

function getToken() {
    return localStorage.getItem(API_CONFIG.tokenKey);
}

function setToken(token) {
    localStorage.setItem(API_CONFIG.tokenKey, token);
}

function clearToken() {
    localStorage.removeItem(API_CONFIG.tokenKey);
}

function getUser() {
    const user = localStorage.getItem(API_CONFIG.userKey);
    return user ? JSON.parse(user) : null;
}

function setUser(user) {
    localStorage.setItem(API_CONFIG.userKey, JSON.stringify(user));
}

function clearUser() {
    localStorage.removeItem(API_CONFIG.userKey);
}

// ==================== GENERIC API CALL ====================

async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        // Handle network errors
        if (error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your connection.');
        }
        throw error;
    }
}

// ==================== AUTHENTICATION APIs ====================

async function login(username, password) {
    const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });

    if (data.success) {
        setToken(data.token);
        setUser(data.user);
    }

    return data;
}

async function verifyAuth() {
    return await apiCall('/auth/verify', { method: 'POST' });
}

function logout() {
    clearToken();
    clearUser();
}

// ==================== VOTING APIs ====================

async function getVotingDates() {
    return await apiCall('/dates');
}

async function castVoteAPI(voterId, date, votedForId, isNullVote) {
    return await apiCall('/votes/cast', {
        method: 'POST',
        body: JSON.stringify({ voterId, date, votedForId, isNullVote })
    });
}

async function checkVote(userId, date) {
    return await apiCall(`/votes/check/${userId}/${date}`);
}

async function getUserVotes(userId) {
    return await apiCall(`/votes/user/${userId}`);
}

// ==================== ADMIN APIs ====================

async function getResults(date) {
    return await apiCall(`/admin/results/${date}`);
}

async function getStandings() {
    return await apiCall('/admin/standings');
}

async function getProgress(date) {
    return await apiCall(`/admin/progress/${date}`);
}

async function getAllProgress() {
    return await apiCall('/admin/progress/all');
}

async function getUnresolvedTies() {
    return await apiCall('/admin/ties/unresolved');
}

async function resolveTieAPI(date, winnerId) {
    return await apiCall('/admin/ties/resolve', {
        method: 'POST',
        body: JSON.stringify({ date, winnerId })
    });
}

async function exportData() {
    return await apiCall('/admin/export');
}

async function getAllUsers() {
    return await apiCall('/admin/users');
}

async function createUser(userData) {
    return await apiCall('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

async function updateUser(userId, updates) {
    return await apiCall(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
}

async function deleteUserAPI(userId) {
    return await apiCall(`/admin/users/${userId}`, {
        method: 'DELETE'
    });
}
