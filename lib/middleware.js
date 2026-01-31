/**
 * Authentication Middleware
 * Verifies JWT tokens and enforces authorization
 */

const { verifyToken, extractTokenFromHeader } = require('./auth');
const { query } = require('./db');

/**
 * Middleware to authenticate user via JWT token
 * Adds user object to request if valid
 */
async function authenticateUser(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from database to ensure they still exist
    const result = await query(
      'SELECT id, name, username, is_admin FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request object
    req.user = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      username: result.rows[0].username,
      isAdmin: result.rows[0].is_admin
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
}

/**
 * Middleware to require admin privileges
 * Must be used after authenticateUser middleware
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required'
    });
  }

  next();
}

/**
 * Middleware to handle async route handlers
 * Catches errors and passes to error handler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Handle specific error types
  if (err.code === '23505') {
    // PostgreSQL unique constraint violation
    return res.status(409).json({
      success: false,
      message: 'Resource already exists'
    });
  }

  if (err.code === '23503') {
    // PostgreSQL foreign key violation
    return res.status(400).json({
      success: false,
      message: 'Invalid reference'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}

/**
 * Middleware to validate request body fields
 */
function validateFields(requiredFields) {
  return (req, res, next) => {
    const missingFields = [];

    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    next();
  };
}

module.exports = {
  authenticateUser,
  requireAdmin,
  asyncHandler,
  errorHandler,
  validateFields
};
