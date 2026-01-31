const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const votesRoutes = require('./votes.routes');
const adminRoutes = require('./admin.routes');
const datesRoutes = require('./dates.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/votes', votesRoutes);
router.use('/admin', adminRoutes);
router.use('/dates', datesRoutes);

// 404 handler for API routes
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

module.exports = router;
