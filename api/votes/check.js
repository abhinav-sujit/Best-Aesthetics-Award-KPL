/**
 * Check Vote API Endpoint
 * GET /api/votes/check/:userId/:date
 * Check if user has voted on a specific date
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
      // Extract userId and date from URL path
      const pathParts = req.url.split('/');
      const userId = parseInt(pathParts[pathParts.length - 2]);
      const date = pathParts[pathParts.length - 1];

      if (!userId || !date) {
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
        [userId, date]
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

    } catch (error) {
      console.error('Check vote error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check vote status'
      });
    }
  });
};
