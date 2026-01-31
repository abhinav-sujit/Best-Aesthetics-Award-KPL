/**
 * User Votes API Endpoint
 * GET /api/votes/user/:userId
 * Get all votes for a specific user
 */

const { query } = require('../../lib/db');
const { authenticateUser } = require('../../lib/middleware');

module.exports = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Authenticate user
  authenticateUser(req, res, async () => {
    try {
      // Extract userId from URL path
      const pathParts = req.url.split('/');
      const userId = parseInt(pathParts[pathParts.length - 1]);

      if (!userId) {
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
        [userId]
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

    } catch (error) {
      console.error('Get user votes error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user votes'
      });
    }
  });
};
