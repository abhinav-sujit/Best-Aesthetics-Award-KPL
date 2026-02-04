// API-based Storage Management for KlimArt Premiere League
// Best Aesthetics Award - January 2026
// Version 2.0 - Backend Integration

// Keep for backward compatibility (now just a no-op)
function initStorage() {
    // No longer needed - data is in database
}

// ==================== VOTING FUNCTIONS ====================

// Check if user has voted for a specific date
async function hasUserVoted(userId, date) {
    try {
        const result = await checkVote(userId, date);
        return result.hasVoted;
    } catch (error) {
        console.error('Error checking vote:', error);
        return false;
    }
}

// Get user's vote for a specific date
async function getUserVote(userId, date) {
    try {
        const result = await checkVote(userId, date);
        return result.hasVoted ? result.vote : null;
    } catch (error) {
        console.error('Error getting user vote:', error);
        return null;
    }
}

// Cast a vote (returns result object with success status)
async function castVote(voterId, date, votedForId) {
    try {
        const isNullVote = votedForId === null;
        const result = await castVoteAPI(voterId, date, votedForId, isNullVote);
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Get user's complete voting history
async function getUserVotingHistory(userId) {
    try {
        const result = await getUserVotes(userId);
        return result.votes || [];
    } catch (error) {
        console.error('Error getting voting history:', error);
        return [];
    }
}

// ==================== ADMIN FUNCTIONS ====================

// Get voting progress for specific date
async function getVotingProgress(date) {
    try {
        const result = await getProgress(date);
        return {
            voted: result.voted,
            total: result.total,
            percentage: result.percentage,
            notVoted: result.notVoted || []
        };
    } catch (error) {
        console.error('Error getting voting progress:', error);
        return { voted: 0, total: 0, percentage: 0, notVoted: [] };
    }
}

// Get voting progress for all dates
async function getAllVotingProgress() {
    try {
        const result = await getAllProgress();
        return result.progress || {};
    } catch (error) {
        console.error('Error getting all progress:', error);
        return {};
    }
}

// Get results for a specific date
async function getResultsForDate(date) {
    try {
        const result = await getResults(date);

        // Transform to match expected format
        const winner = determineWinner(result.results);

        return {
            results: result.results,
            nullVotes: result.nullVotes,
            totalVotes: result.totalVotes,
            totalEmployees: result.totalEmployees,
            winner: winner,
            isTie: winner.isTie,
            notVoted: result.notVoted || [],
            tieResolution: result.tieResolution || null
        };
    } catch (error) {
        console.error('Error getting results:', error);
        return {
            results: [],
            nullVotes: 0,
            totalVotes: 0,
            totalEmployees: 0,
            winner: null,
            isTie: false,
            notVoted: [],
            tieResolution: null
        };
    }
}

// Determine winner from results
function determineWinner(results) {
    if (!results || results.length === 0) {
        return { isTie: false, winners: [] };
    }

    const maxVotes = Math.max(...results.map(r => r.votes));
    const winners = results.filter(r => r.votes === maxVotes && r.votes > 0);

    if (winners.length > 1) {
        return { isTie: true, winners: winners };
    } else if (winners.length === 1) {
        return { isTie: false, winners: [winners[0]] };
    } else {
        return { isTie: false, winners: [] };
    }
}

// Get overall standings
async function getOverallStandings() {
    try {
        const result = await getStandings();
        return result;
    } catch (error) {
        console.error('Error getting standings:', error);
        return { standings: [], dailyWinners: [], totalVotes: [] };
    }
}

// ==================== TIE RESOLUTION ====================

// Get unresolved ties
async function getUnresolvedTiesData() {
    try {
        const result = await getUnresolvedTies(); // API call from api.js
        return result.unresolvedTies || [];
    } catch (error) {
        console.error('Error getting unresolved ties:', error);
        return [];
    }
}

// Resolve a tie
async function resolveTie(date, winnerId) {
    try {
        const result = await resolveTieAPI(date, winnerId);
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Check for ties on a specific date
async function checkForTies(date) {
    try {
        const result = await getResults(date);
        const winner = determineWinner(result.results);
        return {
            hasTie: winner.isTie,
            candidates: winner.winners
        };
    } catch (error) {
        console.error('Error checking for ties:', error);
        return { hasTie: false, candidates: [] };
    }
}

// Get tie resolutions for all dates
async function getTieResolutions() {
    const resolutions = {};
    const dates = [
        "2026-01-02", "2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08",
        "2026-01-09", "2026-01-10", "2026-01-12", "2026-01-13", "2026-01-15",
        "2026-01-16", "2026-01-19", "2026-01-20", "2026-01-21", "2026-01-22",
        "2026-01-24", "2026-01-27", "2026-01-28", "2026-01-29", "2026-01-30",
        "2026-01-31"
    ];

    for (const date of dates) {
        try {
            const result = await getResults(date);
            if (result.tieResolution) {
                resolutions[date] = result.tieResolution.winnerId;
            }
        } catch (error) {
            console.error(`Error getting tie resolution for ${date}:`, error);
        }
    }

    return resolutions;
}

// Get votes for a specific date
async function getVotesForDate(date) {
    try {
        const result = await getResults(date);
        return {
            voted: result.totalVotes,
            total: result.totalEmployees,
            notVoted: result.notVoted || []
        };
    } catch (error) {
        console.error('Error getting votes for date:', error);
        return { voted: 0, total: 0, notVoted: [] };
    }
}

// ==================== DATA EXPORT ====================

// Export all data (admin only)
async function exportDataAPI() {
    try {
        const result = await exportData();
        return result.data;
    } catch (error) {
        console.error('Error exporting data:', error);
        return { votes: [], tieResolutions: [] };
    }
}

// ==================== PUBLIC STANDINGS ====================

// Get overall standings (calls admin endpoint which is now accessible to all authenticated users)
async function getPublicStandings() {
    // Reuse existing getStandings() which calls the admin endpoint
    return await getStandings();
}

// ==================== LEGACY FUNCTIONS (NO-OP) ====================

// These functions existed in localStorage version
// Now they do nothing but prevent errors

function getAllVotes() {
    console.warn('getAllVotes() is deprecated - data is now in database');
    return {};
}

function saveAllVotes(votes) {
    console.warn('saveAllVotes() is deprecated - use API instead');
}

function resetAllData() {
    console.warn('resetAllData() should be done via backend API');
    alert('Data reset must be performed directly in the database.\nPlease contact system administrator.');
}
