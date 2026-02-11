const express = require('express');
const router = express.Router();

// @desc    Get API information
// @route    GET /api
// @access   Public
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Amrit Sagar API',
        version: '1.0.0',
        description: 'Backend API for Amrit Sagar Ashram Retreat Website',
        endpoints: {
            contact: '/api/contact',
            bookings: '/api/bookings',
            admin: '/api/admin',
            pages: '/api/pages'
        },
        documentation: 'https://github.com/amrit-sagar/backend/docs',
        status: 'operational'
    });
});

// @desc    Get system health
// @route    GET /api/health
// @access   Public
router.get('/health', (req, res) => {
    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        memory: process.memoryUsage(),
        version: process.version,
        platform: process.platform
    };

    res.json(healthCheck);
});

module.exports = router;
