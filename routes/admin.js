const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin', 'manager'));

// @desc    Get admin dashboard data
// @route    GET /api/admin/dashboard
// @access   Private/Admin
router.get('/dashboard', async (req, res) => {
    try {
        const Contact = require('../models/Contact');
        const Booking = require('../models/Booking');
        
        // Get statistics
        const contactStats = await Contact.getStats();
        const bookingStats = await Booking.getStats();
        const recentContacts = await Contact.getRecentContacts(7);
        const upcomingBookings = await Booking.getUpcomingBookings(7);
        
        // Calculate totals
        const totalContacts = contactStats.reduce((sum, stat) => sum + stat.count, 0);
        const totalBookings = bookingStats.reduce((sum, stat) => sum + stat.count, 0);
        const pendingContacts = contactStats.find(s => s._id === 'pending')?.count || 0;
        const pendingBookings = bookingStats.find(s => s._id === 'inquiry')?.count || 0;
        
        res.json({
            success: true,
            data: {
                overview: {
                    totalContacts,
                    totalBookings,
                    pendingContacts,
                    pendingBookings
                },
                contactStats,
                bookingStats,
                recentContacts,
                upcomingBookings
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get system settings
// @route    GET /api/admin/settings
// @access   Private/Admin
router.get('/settings', (req, res) => {
    try {
        const settings = {
            site: {
                name: 'Amrit Sagar',
                email: 'info@amritsagar.org',
                phone: '+91 88875 33641',
                address: 'Mahesh Nagar Colony, Samne Ghat, Varanasi, UP, 221005'
            },
            booking: {
                maxCapacity: 25,
                advanceBookingDays: 90,
                cancellationPolicy: '24 hours before check-in'
            },
            email: {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                user: process.env.EMAIL_USER,
                from: process.env.FROM_EMAIL
            },
            features: {
                onlineBooking: true,
                emailNotifications: true,
                autoReply: true,
                analytics: true
            }
        };
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Update system settings
// @route    PUT /api/admin/settings
// @access   Private/Admin
router.put('/settings', (req, res) => {
    try {
        // In a real application, this would update settings in database
        // For now, just return success
        res.json({
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
