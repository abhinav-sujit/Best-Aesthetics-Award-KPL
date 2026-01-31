/**
 * Voting Progress API Endpoint
 * GET /api/admin/progress/:date - Get progress for specific date
 * GET /api/admin/progress/all - Get progress for all dates
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
        // Extract path
        const pathParts = req.url.split('/');
        const lastPart = pathParts[pathParts.length - 1];

        // Get total employees
        const totalEmployeesResult = await query(
          'SELECT COUNT(*) as count FROM users WHERE is_admin = FALSE'
        );
        const totalEmployees = parseInt(totalEmployeesResult.rows[0].count);

        // Check if requesting all dates or specific date
        if (lastPart === 'all') {
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
          const date = lastPart;

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

      } catch (error) {
        console.error('Get progress error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve voting progress'
        });
      }
    });
  });
};
