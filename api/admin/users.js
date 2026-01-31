/**
 * User Management API Endpoint
 * GET /api/admin/users - Get all users
 * POST /api/admin/users - Create new user
 * PUT /api/admin/users/:id - Update user
 * DELETE /api/admin/users/:id - Delete user
 */

const { query } = require('../../lib/db');
const { authenticateUser, requireAdmin } = require('../../lib/middleware');

module.exports = async (req, res) => {
  // Authenticate and require admin
  authenticateUser(req, res, () => {
    requireAdmin(req, res, async () => {
      try {
        // GET - List all users
        if (req.method === 'GET') {
          const result = await query(
            `SELECT id, name, username, is_admin, created_at, updated_at
             FROM users
             ORDER BY is_admin DESC, name ASC`
          );

          return res.status(200).json({
            success: true,
            users: result.rows.map(row => ({
              id: row.id,
              name: row.name,
              username: row.username,
              isAdmin: row.is_admin,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            }))
          });
        }

        // POST - Create new user
        if (req.method === 'POST') {
          const { name, username, password, isAdmin } = req.body;

          // Validate input
          if (!name || !username || !password) {
            return res.status(400).json({
              success: false,
              message: 'Name, username, and password are required'
            });
          }

          // Insert new user
          const result = await query(
            `INSERT INTO users (name, username, password, is_admin)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, username, is_admin, created_at`,
            [name.trim(), username.toLowerCase().trim(), password, isAdmin || false]
          );

          return res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
              id: result.rows[0].id,
              name: result.rows[0].name,
              username: result.rows[0].username,
              isAdmin: result.rows[0].is_admin,
              createdAt: result.rows[0].created_at
            }
          });
        }

        // PUT - Update user
        if (req.method === 'PUT') {
          // Extract user ID from URL
          const pathParts = req.url.split('/');
          const userId = parseInt(pathParts[pathParts.length - 1]);

          if (!userId) {
            return res.status(400).json({
              success: false,
              message: 'User ID is required'
            });
          }

          const { name, username, password, isAdmin } = req.body;

          // Build dynamic update query
          const updates = [];
          const values = [];
          let paramCount = 1;

          if (name !== undefined) {
            updates.push(`name = $${paramCount++}`);
            values.push(name.trim());
          }
          if (username !== undefined) {
            updates.push(`username = $${paramCount++}`);
            values.push(username.toLowerCase().trim());
          }
          if (password !== undefined) {
            updates.push(`password = $${paramCount++}`);
            values.push(password);
          }
          if (isAdmin !== undefined) {
            updates.push(`is_admin = $${paramCount++}`);
            values.push(isAdmin);
          }

          if (updates.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'No fields to update'
            });
          }

          values.push(userId);

          const result = await query(
            `UPDATE users
             SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
             WHERE id = $${paramCount}
             RETURNING id, name, username, is_admin, updated_at`,
            values
          );

          if (result.rows.length === 0) {
            return res.status(404).json({
              success: false,
              message: 'User not found'
            });
          }

          return res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: {
              id: result.rows[0].id,
              name: result.rows[0].name,
              username: result.rows[0].username,
              isAdmin: result.rows[0].is_admin,
              updatedAt: result.rows[0].updated_at
            }
          });
        }

        // DELETE - Delete user
        if (req.method === 'DELETE') {
          // Extract user ID from URL
          const pathParts = req.url.split('/');
          const userId = parseInt(pathParts[pathParts.length - 1]);

          if (!userId) {
            return res.status(400).json({
              success: false,
              message: 'User ID is required'
            });
          }

          // Prevent deleting yourself
          if (userId === req.user.id) {
            return res.status(400).json({
              success: false,
              message: 'You cannot delete your own account'
            });
          }

          const result = await query(
            'DELETE FROM users WHERE id = $1 RETURNING id, name',
            [userId]
          );

          if (result.rows.length === 0) {
            return res.status(404).json({
              success: false,
              message: 'User not found'
            });
          }

          return res.status(200).json({
            success: true,
            message: `User "${result.rows[0].name}" deleted successfully`
          });
        }

        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });

      } catch (error) {
        console.error('User management error:', error);

        // Handle unique constraint violation
        if (error.code === '23505') {
          return res.status(409).json({
            success: false,
            message: 'Username already exists'
          });
        }

        return res.status(500).json({
          success: false,
          message: 'Failed to manage user'
        });
      }
    });
  });
};
