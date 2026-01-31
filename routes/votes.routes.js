/**
 * Voting Routes
 * Handles vote casting and vote checking
 */

const express = require('express');
const router = express.Router();
const { query } = require('../lib/db');
const { authenticateUser, asyncHandler } = require('../lib/middleware');

/**
 * POST /api/votes/cast
 * Cast a vote for a specific date
 */
router.post('/cast', authenticateUser, asyncHandler(async (req, res) => {
  const { voterId, date, votedForId, isNullVote } = req.body;

  // Validate input
  if (!voterId || !date) {
    return res.status(400).json({
      success: false,
      message: 'Voter ID and date are required'
    });
  }

  // Ensure user can only vote for themselves
  if (req.user.id !== voterId) {
    return res.status(403).json({
      success: false,
      message: 'You can only cast votes for yourself'
    });
  }

  // Validate vote data
  if (!isNullVote && !votedForId) {
    return res.status(400).json({
      success: false,
      message: 'Must provide votedForId or set isNullVote to true'
    });
  }

  // Check if date exists and is active
  const dateCheck = await query(
    'SELECT is_active FROM voting_dates WHERE date = $1',
    [date]
  );

  if (dateCheck.rows.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid voting date'
    });
  }

  if (!dateCheck.rows[0].is_active) {
    return res.status(400).json({
      success: false,
      message: 'Voting is not active for this date'
    });
  }

  try {
    // Insert vote (UNIQUE constraint will prevent duplicates)
    const result = await query(
      `INSERT INTO votes (voter_id, voting_date, voted_for_id, is_null_vote)
       VALUES ($1, $2, $3, $4)
       RETURNING id, voted_at`,
      [voterId, date, isNullVote ? null : votedForId, isNullVote || false]
    );

    return res.status(201).json({
      success: true,
      message: 'Vote cast successfully!',
      vote: {
        id: result.rows[0].id,
        votedAt: result.rows[0].voted_at
      }
    });
  } catch (error) {
    console.error('Cast vote error:', error);

    // Handle duplicate vote
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'You have already voted for this date.'
      });
    }

    // Handle foreign key violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Invalid voter or candidate ID'
      });
    }

    throw error; // Let asyncHandler catch other errors
  }
}));

/**
 * GET /api/votes/check/:userId/:date
 * Check if user has voted on a specific date
 */
router.get('/check/:userId/:date', authenticateUser, asyncHandler(async (req, res) => {
  const { userId, date } = req.params;
  const userIdNum = parseInt(userId);

  if (!userIdNum || !date) {
    return res.status(400).json({
      success: false,
      message: 'User ID and date are required'
    });
  }

  // Query for vote
  const result = await query(
    `SELECT v.id, v.voted_for_id, v.is_null_vote, v.voted_at,
            u.name as voted_for_name
     FROM votes v
     LEFT JOIN users u ON v.voted_for_id = u.id
     WHERE v.voter_id = $1 AND v.voting_date = $2`,
    [userIdNum, date]
  );

  if (result.rows.length === 0) {
    return res.status(200).json({
      success: true,
      hasVoted: false
    });
  }

  const vote = result.rows[0];

  return res.status(200).json({
    success: true,
    hasVoted: true,
    vote: {
      votedFor: vote.is_null_vote ? null : {
        id: vote.voted_for_id,
        name: vote.voted_for_name
      },
      isNullVote: vote.is_null_vote,
      votedAt: vote.voted_at
    }
  });
}));

/**
 * GET /api/votes/user/:userId
 * Get all votes for a specific user
 */
router.get('/user/:userId', authenticateUser, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const userIdNum = parseInt(userId);

  if (!userIdNum) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  // Query all votes for user
  const result = await query(
    `SELECT v.voting_date as date, v.voted_for_id, v.is_null_vote, v.voted_at,
            u.name as voted_for_name
     FROM votes v
     LEFT JOIN users u ON v.voted_for_id = u.id
     WHERE v.voter_id = $1
     ORDER BY v.voting_date DESC`,
    [userIdNum]
  );

  const votes = result.rows.map(row => ({
    date: row.date.toISOString().split('T')[0],
    votedFor: row.is_null_vote ? null : {
      id: row.voted_for_id,
      name: row.voted_for_name
    },
    isNullVote: row.is_null_vote,
    votedAt: row.voted_at
  }));

  return res.status(200).json({
    success: true,
    votes: votes
  });
}));

module.exports = router;
