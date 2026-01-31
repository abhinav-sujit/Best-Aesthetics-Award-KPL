/**
 * Cast Vote API Endpoint
 * POST /api/votes/cast
 * Cast a vote for a specific date
 */

const { query } = require('../../lib/db');
const { authenticateUser } = require('../../lib/middleware');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Authenticate user
  authenticateUser(req, res, async () => {
    try {
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

      return res.status(500).json({
        success: false,
        message: 'Failed to cast vote'
      });
    }
  });
};
