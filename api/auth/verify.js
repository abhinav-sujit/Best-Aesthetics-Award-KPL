/**
 * Verify Token API Endpoint
 * POST /api/auth/verify
 * Verifies JWT token and returns user info
 */

const { authenticateUser } = require('../../lib/middleware');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Use authenticateUser middleware
  authenticateUser(req, res, () => {
    // If we reach here, authentication was successful
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        username: req.user.username,
        isAdmin: req.user.isAdmin
      }
    });
  });
};
