/**
 * Login API Endpoint
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */

const { query } = require('../../lib/db');
const { generateToken } = require('../../lib/auth');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
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

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
};
