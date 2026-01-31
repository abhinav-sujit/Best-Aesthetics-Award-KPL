/**
 * Data Export API Endpoint
 * GET /api/admin/export
 * Export all voting data as JSON (admin only)
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

      } catch (error) {
        console.error('Export data error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to export data'
        });
      }
    });
  });
};
