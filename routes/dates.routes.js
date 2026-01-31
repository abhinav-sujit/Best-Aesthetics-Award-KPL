/**
 * Voting Dates Routes
 * Handles voting date operations
 */

const express = require('express');
const router = express.Router();
const { query } = require('../lib/db');
const { asyncHandler } = require('../lib/middleware');

/**
 * GET /api/dates
 * Returns all voting dates
 */
router.get('/', asyncHandler(async (req, res) => {
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
}));

module.exports = router;
