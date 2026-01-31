/**
 * Tie Management API Endpoint
 * GET /api/admin/ties/unresolved - Get unresolved ties
 * POST /api/admin/ties/resolve - Resolve a tie
 */

const { query } = require('../../lib/db');
const { authenticateUser, requireAdmin } = require('../../lib/middleware');

module.exports = async (req, res) => {
  // Authenticate and require admin
  authenticateUser(req, res, () => {
    requireAdmin(req, res, async () => {
      try {
        // GET - Unresolved ties
        if (req.method === 'GET') {
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
        }

        // POST - Resolve tie
        if (req.method === 'POST') {
          const { date, winnerId } = req.body;

          if (!date || !winnerId) {
            return res.status(400).json({
              success: false,
              message: 'Date and winnerId are required'
            });
          }

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
        }

        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });

      } catch (error) {
        console.error('Tie management error:', error);

        // Handle duplicate tie resolution
        if (error.code === '23505') {
          return res.status(409).json({
            success: false,
            message: 'This tie has already been resolved'
          });
        }

        return res.status(500).json({
          success: false,
          message: 'Failed to manage tie'
        });
      }
    });
  });
};
