/**
 * Overall Standings API Endpoint
 * GET /api/admin/standings
 * Get overall standings/rankings (admin only)
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

        const standings = standingsResult.rows.map(row => ({
          id: row.id,
          name: row.name,
          wins: parseInt(row.wins)
        }));

        return res.status(200).json({
          success: true,
          standings: standings
        });

      } catch (error) {
        console.error('Get standings error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve standings'
        });
      }
    });
  });
};
