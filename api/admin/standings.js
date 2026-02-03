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
