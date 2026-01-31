/**
 * Daily Results API Endpoint
 * GET /api/admin/results/:date
 * Get voting results for a specific date (admin only)
 */

const { query } = require('../../lib/db');
const { authenticateUser, requireAdmin } = require('../../lib/middleware');

module.exports = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Authenticate and require admin
  authenticateUser(req, res, () => {
    requireAdmin(req, res, async () => {
      try {
        // Extract date from URL path
        const pathParts = req.url.split('/');
        const date = pathParts[pathParts.length - 1];

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
          notVoted: notVotedResult.rows
        });

      } catch (error) {
        console.error('Get results error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve results'
        });
      }
    });
  });
};
