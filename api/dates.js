/**
 * Voting Dates API Endpoint
 * GET /api/dates
 * Returns all voting dates
 */

const { query } = require('../lib/db');

module.exports = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const result = await query(
      'SELECT date, is_active FROM voting_dates ORDER BY date ASC'
    );

    return res.status(200).json({
      success: true,
      dates: result.rows.map(row => ({
        date: row.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        isActive: row.is_active
      }))
    });

  } catch (error) {
    console.error('Get dates error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve voting dates'
    });
  }
};
