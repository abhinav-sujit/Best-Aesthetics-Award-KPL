/**
 * Admin Routes
 * Handles all admin operations (user management, results, standings, etc.)
 * All routes require authentication and admin privileges
 */

const express = require('express');
const router = express.Router();
const { query } = require('../lib/db');
const { authenticateUser, requireAdmin, asyncHandler } = require('../lib/middleware');

// Apply authentication and admin middleware to all routes
router.use(authenticateUser);
router.use(requireAdmin);

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * GET /api/admin/users
 * Get all users
 */
router.get('/users', asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT id, name, username, is_admin, created_at, updated_at
     FROM users
     ORDER BY is_admin DESC, name ASC`
  );

  return res.status(200).json({
    success: true,
    users: result.rows.map(row => ({
      id: row.id,
      name: row.name,
      username: row.username,
      isAdmin: row.is_admin,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  });
}));

/**
 * POST /api/admin/users
 * Create new user
 */
router.post('/users', asyncHandler(async (req, res) => {
  const { name, username, password, isAdmin } = req.body;

  // Validate input
  if (!name || !username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, username, and password are required'
    });
  }

  try {
    // Insert new user
    const result = await query(
      `INSERT INTO users (name, username, password, is_admin)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, username, is_admin, created_at`,
      [name.trim(), username.toLowerCase().trim(), password, isAdmin || false]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        username: result.rows[0].username,
        isAdmin: result.rows[0].is_admin,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }
    throw error;
  }
}));

/**
 * PUT /api/admin/users/:id
 * Update user
 */
router.put('/users/:id', asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  const { name, username, password, isAdmin } = req.body;

  // Build dynamic update query
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(name.trim());
  }
  if (username !== undefined) {
    updates.push(`username = $${paramCount++}`);
    values.push(username.toLowerCase().trim());
  }
  if (password !== undefined) {
    updates.push(`password = $${paramCount++}`);
    values.push(password);
  }
  if (isAdmin !== undefined) {
    updates.push(`is_admin = $${paramCount++}`);
    values.push(isAdmin);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update'
    });
  }

  values.push(userId);

  try {
    const result = await query(
      `UPDATE users
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, name, username, is_admin, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        username: result.rows[0].username,
        isAdmin: result.rows[0].is_admin,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }
    throw error;
  }
}));

/**
 * DELETE /api/admin/users/:id
 * Delete user
 */
router.delete('/users/:id', asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  // Prevent deleting yourself
  if (userId === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account'
    });
  }

  const result = await query(
    'DELETE FROM users WHERE id = $1 RETURNING id, name',
    [userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  return res.status(200).json({
    success: true,
    message: `User "${result.rows[0].name}" deleted successfully`
  });
}));

// ============================================================================
// VOTING RESULTS & ANALYTICS
// ============================================================================

/**
 * GET /api/admin/results/:date
 * Get voting results for a specific date
 */
router.get('/results/:date', asyncHandler(async (req, res) => {
  const { date } = req.params;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date is required'
    });
  }

  // Get vote counts for each candidate
  const voteResults = await query(
    `SELECT u.id, u.name, COUNT(v.id) as votes
     FROM users u
     LEFT JOIN votes v ON u.id = v.voted_for_id AND v.voting_date = $1
     WHERE u.is_admin = FALSE
     GROUP BY u.id, u.name
     ORDER BY votes DESC, u.name ASC`,
    [date]
  );

  // Get NULL vote count
  const nullVoteResult = await query(
    `SELECT COUNT(*) as count
     FROM votes
     WHERE voting_date = $1 AND is_null_vote = TRUE`,
    [date]
  );

  // Get total votes cast
  const totalVotesResult = await query(
    `SELECT COUNT(*) as count
     FROM votes
     WHERE voting_date = $1`,
    [date]
  );

  // Get total employees (non-admin users)
  const totalEmployeesResult = await query(
    `SELECT COUNT(*) as count
     FROM users
     WHERE is_admin = FALSE`
  );

  // Get list of who hasn't voted
  const notVotedResult = await query(
    `SELECT u.id, u.name
     FROM users u
     WHERE u.is_admin = FALSE
     AND NOT EXISTS (
       SELECT 1 FROM votes v
       WHERE v.voter_id = u.id AND v.voting_date = $1
     )
     ORDER BY u.name ASC`,
    [date]
  );

  // Check if tie was resolved
  const tieResolutionResult = await query(
    `SELECT winner_id FROM tie_resolutions WHERE voting_date = $1`,
    [date]
  );

  const results = voteResults.rows.map(row => ({
    id: row.id,
    name: row.name,
    votes: parseInt(row.votes)
  }));

  return res.status(200).json({
    success: true,
    date: date,
    results: results,
    nullVotes: parseInt(nullVoteResult.rows[0].count),
    totalVotes: parseInt(totalVotesResult.rows[0].count),
    totalEmployees: parseInt(totalEmployeesResult.rows[0].count),
    notVoted: notVotedResult.rows,
    tieResolution: tieResolutionResult.rows.length > 0
      ? { winnerId: tieResolutionResult.rows[0].winner_id }
      : null
  });
}));

/**
 * GET /api/admin/standings
 * Get overall standings/rankings
 */
router.get('/standings', asyncHandler(async (req, res) => {
  // Get winners from each date (including tie resolutions)
  const standingsResult = await query(
    `WITH daily_winners AS (
       -- Get natural winners (highest votes without ties)
       SELECT
         voting_date,
         voted_for_id as winner_id
       FROM votes
       WHERE voted_for_id IS NOT NULL
       GROUP BY voting_date, voted_for_id
       HAVING COUNT(*) = (
         SELECT MAX(vote_count)
         FROM (
           SELECT COUNT(*) as vote_count
           FROM votes
           WHERE voting_date = votes.voting_date
           AND voted_for_id IS NOT NULL
           GROUP BY voted_for_id
         ) AS counts
       )
       AND (
         SELECT COUNT(DISTINCT voted_for_id)
         FROM votes
         WHERE voting_date = votes.voting_date
         AND voted_for_id IS NOT NULL
         GROUP BY voted_for_id
         HAVING COUNT(*) = (
           SELECT MAX(vote_count)
           FROM (
             SELECT COUNT(*) as vote_count
             FROM votes v2
             WHERE v2.voting_date = votes.voting_date
             AND v2.voted_for_id IS NOT NULL
             GROUP BY v2.voted_for_id
           ) AS counts2
         )
       ) = 1

       UNION ALL

       -- Get tie resolution winners
       SELECT
         voting_date,
         winner_id
       FROM tie_resolutions
     )
     SELECT
       u.id,
       u.name,
       COUNT(dw.winner_id) as wins
     FROM users u
     LEFT JOIN daily_winners dw ON u.id = dw.winner_id
     WHERE u.is_admin = FALSE
     GROUP BY u.id, u.name
     ORDER BY wins DESC, u.name ASC`
  );

  // Get daily winners with dates (natural + tie resolutions)
  const dailyWinnersResult = await query(
    `WITH daily_winners AS (
       SELECT
         v.voting_date,
         v.voted_for_id as winner_id,
         COUNT(*) as votes,
         RANK() OVER (PARTITION BY v.voting_date ORDER BY COUNT(*) DESC) as rank
       FROM votes v
       WHERE v.is_null_vote = FALSE
       GROUP BY v.voting_date, v.voted_for_id
     )
     SELECT
       dw.voting_date,
       dw.winner_id,
       u.name as winner_name
     FROM daily_winners dw
     JOIN users u ON dw.winner_id = u.id
     WHERE dw.rank = 1
     AND (
       SELECT COUNT(*)
       FROM daily_winners dw2
       WHERE dw2.voting_date = dw.voting_date AND dw2.rank = 1
     ) = 1

     UNION ALL

     SELECT
       tr.voting_date,
       tr.winner_id,
       u.name as winner_name
     FROM tie_resolutions tr
     JOIN users u ON tr.winner_id = u.id
     ORDER BY voting_date DESC`
  );

  // Get total votes per employee
  const totalVotesResult = await query(
    `SELECT
       u.id,
       u.name,
       COUNT(v.id) as total_votes
     FROM users u
     LEFT JOIN votes v ON u.id = v.voted_for_id AND v.is_null_vote = FALSE
     WHERE u.is_admin = FALSE
     GROUP BY u.id, u.name`
  );

  const standings = standingsResult.rows.map(row => ({
    id: row.id,
    name: row.name,
    wins: parseInt(row.wins)
  }));

  return res.status(200).json({
    success: true,
    standings: standings,
    dailyWinners: dailyWinnersResult.rows.map(row => ({
      date: row.voting_date.toISOString().split('T')[0],
      winnerId: row.winner_id,
      winnerName: row.winner_name
    })),
    totalVotes: totalVotesResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      totalVotes: parseInt(row.total_votes)
    }))
  });
}));

/**
 * GET /api/admin/progress/:dateOrAll
 * Get voting progress for specific date or all dates
 */
router.get('/progress/:dateOrAll', asyncHandler(async (req, res) => {
  const { dateOrAll } = req.params;

  // Get total employees
  const totalEmployeesResult = await query(
    'SELECT COUNT(*) as count FROM users WHERE is_admin = FALSE'
  );
  const totalEmployees = parseInt(totalEmployeesResult.rows[0].count);

  // Check if requesting all dates or specific date
  if (dateOrAll === 'all') {
    // Get progress for all dates
    const progressResult = await query(
      `SELECT
         vd.date,
         COUNT(DISTINCT v.voter_id) as voted
       FROM voting_dates vd
       LEFT JOIN votes v ON vd.date = v.voting_date
       GROUP BY vd.date
       ORDER BY vd.date ASC`
    );

    const progress = {};
    progressResult.rows.forEach(row => {
      const dateKey = row.date.toISOString().split('T')[0];
      const voted = parseInt(row.voted);
      progress[dateKey] = {
        voted: voted,
        total: totalEmployees,
        percentage: totalEmployees > 0 ? Math.round((voted / totalEmployees) * 100) : 0
      };
    });

    return res.status(200).json({
      success: true,
      progress: progress
    });
  } else {
    // Get progress for specific date
    const date = dateOrAll;

    const progressResult = await query(
      `SELECT COUNT(DISTINCT voter_id) as count
       FROM votes
       WHERE voting_date = $1`,
      [date]
    );

    const voted = parseInt(progressResult.rows[0].count);
    const percentage = totalEmployees > 0 ? Math.round((voted / totalEmployees) * 100) : 0;

    // Get list of who hasn't voted
    const notVotedResult = await query(
      `SELECT u.id, u.name
       FROM users u
       WHERE u.is_admin = FALSE
       AND NOT EXISTS (
         SELECT 1 FROM votes v
         WHERE v.voter_id = u.id AND v.voting_date = $1
       )
       ORDER BY u.name ASC`,
      [date]
    );

    return res.status(200).json({
      success: true,
      date: date,
      voted: voted,
      total: totalEmployees,
      percentage: percentage,
      notVoted: notVotedResult.rows
    });
  }
}));

/**
 * GET /api/admin/export
 * Export all voting data as JSON
 */
router.get('/export', asyncHandler(async (req, res) => {
  // Get all votes with names
  const votesResult = await query(
    `SELECT
       v.id,
       v.voter_id,
       voter.name as voter_name,
       v.voting_date,
       v.voted_for_id,
       candidate.name as voted_for_name,
       v.is_null_vote,
       v.voted_at
     FROM votes v
     JOIN users voter ON v.voter_id = voter.id
     LEFT JOIN users candidate ON v.voted_for_id = candidate.id
     ORDER BY v.voting_date ASC, v.voted_at ASC`
  );

  // Get all tie resolutions
  const tiesResult = await query(
    `SELECT
       tr.id,
       tr.voting_date,
       tr.winner_id,
       u.name as winner_name,
       tr.resolved_at,
       tr.resolved_by,
       resolver.name as resolved_by_name
     FROM tie_resolutions tr
     JOIN users u ON tr.winner_id = u.id
     LEFT JOIN users resolver ON tr.resolved_by = resolver.id
     ORDER BY tr.voting_date ASC`
  );

  // Format votes data
  const votes = votesResult.rows.map(row => ({
    id: row.id,
    voterId: row.voter_id,
    voterName: row.voter_name,
    date: row.voting_date.toISOString().split('T')[0],
    votedForId: row.voted_for_id,
    votedForName: row.voted_for_name,
    isNullVote: row.is_null_vote,
    votedAt: row.voted_at
  }));

  // Format tie resolutions data
  const tieResolutions = tiesResult.rows.map(row => ({
    id: row.id,
    date: row.voting_date.toISOString().split('T')[0],
    winnerId: row.winner_id,
    winnerName: row.winner_name,
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by,
    resolvedByName: row.resolved_by_name
  }));

  return res.status(200).json({
    success: true,
    exportedAt: new Date().toISOString(),
    data: {
      votes: votes,
      tieResolutions: tieResolutions,
      summary: {
        totalVotes: votes.length,
        totalTiesResolved: tieResolutions.length
      }
    }
  });
}));

// ============================================================================
// TIE MANAGEMENT
// ============================================================================

/**
 * GET /api/admin/ties/unresolved
 * Get unresolved ties
 */
router.get('/ties/unresolved', asyncHandler(async (req, res) => {
  // Find dates with ties (multiple candidates with same highest vote count)
  const tiesResult = await query(
    `SELECT
       v.voting_date,
       v.voted_for_id,
       u.name,
       COUNT(*) as votes
     FROM votes v
     JOIN users u ON v.voted_for_id = u.id
     WHERE v.voted_for_id IS NOT NULL
     AND v.voting_date NOT IN (SELECT voting_date FROM tie_resolutions)
     GROUP BY v.voting_date, v.voted_for_id, u.name
     HAVING COUNT(*) = (
       SELECT MAX(vote_count)
       FROM (
         SELECT COUNT(*) as vote_count
         FROM votes v2
         WHERE v2.voting_date = v.voting_date
         AND v2.voted_for_id IS NOT NULL
         GROUP BY v2.voted_for_id
       ) AS counts
     )
     ORDER BY v.voting_date DESC`
  );

  // Group by date to identify actual ties
  const tiesByDate = {};
  tiesResult.rows.forEach(row => {
    const dateKey = row.voting_date.toISOString().split('T')[0];
    if (!tiesByDate[dateKey]) {
      tiesByDate[dateKey] = [];
    }
    tiesByDate[dateKey].push({
      id: row.voted_for_id,
      name: row.name,
      votes: parseInt(row.votes)
    });
  });

  // Filter to only actual ties (more than 1 candidate with max votes)
  const unresolvedTies = Object.entries(tiesByDate)
    .filter(([date, candidates]) => candidates.length > 1)
    .map(([date, candidates]) => ({
      date: date,
      candidates: candidates
    }));

  return res.status(200).json({
    success: true,
    unresolvedTies: unresolvedTies
  });
}));

/**
 * POST /api/admin/ties/resolve
 * Resolve a tie
 */
router.post('/ties/resolve', asyncHandler(async (req, res) => {
  const { date, winnerId } = req.body;

  if (!date || !winnerId) {
    return res.status(400).json({
      success: false,
      message: 'Date and winnerId are required'
    });
  }

  try {
    // Insert tie resolution
    const result = await query(
      `INSERT INTO tie_resolutions (voting_date, winner_id, resolved_by)
       VALUES ($1, $2, $3)
       RETURNING id, resolved_at`,
      [date, winnerId, req.user.id]
    );

    // Get winner name
    const winnerResult = await query(
      'SELECT name FROM users WHERE id = $1',
      [winnerId]
    );

    return res.status(201).json({
      success: true,
      message: 'Tie resolved successfully',
      resolution: {
        id: result.rows[0].id,
        date: date,
        winnerId: winnerId,
        winnerName: winnerResult.rows[0].name,
        resolvedAt: result.rows[0].resolved_at
      }
    });
  } catch (error) {
    // Handle duplicate tie resolution
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'This tie has already been resolved'
      });
    }
    throw error;
  }
}));

module.exports = router;
