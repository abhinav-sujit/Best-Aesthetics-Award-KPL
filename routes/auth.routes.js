/**
 * Authentication Routes
 * Handles user login and token verification
 */

const express = require('express');
const router = express.Router();
const { query } = require('../lib/db');
const { generateToken } = require('../lib/auth');
const { authenticateUser, asyncHandler } = require('../lib/middleware');

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  // Query user from database
  const result = await query(
    'SELECT id, name, username, password, is_admin FROM users WHERE username = $1',
    [username.toLowerCase().trim()]
  );

  // Check if user exists
  if (result.rows.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }

  const user = result.rows[0];

  // Compare password (plain text comparison per requirements)
  if (user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    username: user.username,
    isAdmin: user.is_admin
  });

  // Return success response
  return res.status(200).json({
    success: true,
    token: token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      isAdmin: user.is_admin
    }
  });
}));

/**
 * POST /api/auth/verify
 * Verifies JWT token and returns user info
 */
router.post('/verify', authenticateUser, (req, res) => {
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

module.exports = router;
