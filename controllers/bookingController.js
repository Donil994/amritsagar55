const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');
const emailService = require('../utils/emailService');

// @desc    Create new booking
// @route    POST /api/bookings
// @access   Public
exports.createBooking = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
                message: 'Please fix the errors and try again'
            });
        }

        const bookingData = {
            ...req.body,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };

        // Create booking
        const booking = await Booking.create(bookingData);

        // Send email notifications
        try {
            await emailService.sendBookingConfirmation(booking);
            await emailService.sendNewBookingNotification(booking);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Booking submitted successfully! We will contact you soon to confirm your reservation.',
            data: {
                id: booking._id,
                bookingReference: `BK${booking._id.toString().slice(-6).toUpperCase()}`,
                programName: booking.program.name,
                startDate: booking.program.startDate,
                totalParticipants: booking.totalParticipants
            }
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// @desc    Get all bookings (admin)
// @route    GET /api/bookings
// @access   Private/Admin
exports.getBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { status, programType, startDate, endDate, search } = req.query;
        
        // Build query
        let query = {};
        
        if (status) query.status = status;
        if (programType) query['program.type'] = programType;
        if (startDate || endDate) {
            query['program.startDate'] = {};
            if (startDate) query['program.startDate'].$gte = new Date(startDate);
            if (endDate) query['program.startDate'].$lte = new Date(endDate);
        }
        if (search) {
            query.$or = [
                { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
                { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
                { 'personalInfo.email': { $regex: search, $options: 'i' } }
            ];
        }

        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Booking.countDocuments(query);

        res.json({
            success: true,
            data: bookings,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single booking
// @route    GET /api/bookings/:id
// @access   Private/Admin
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: booking
        });

    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update booking status
// @route    PUT /api/bookings/:id
// @access   Private/Admin
exports.updateBooking = async (req, res) => {
    try {
        const { status, payment, note } = req.body;
        
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Update booking
        const updateData = {};
        if (status) updateData.status = status;
        if (payment) {
            updateData.payment = { ...booking.payment, ...payment };
            if (payment.status === 'paid') {
                updateData.payment.paidAt = new Date();
            }
        }
        
        // Add note if provided
        if (note) {
            updateData.$push = {
                notes: {
                    content: note,
                    author: req.user ? req.user.fullName : 'Admin',
                    timestamp: new Date()
                }
            };
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        // Send email notification if status changed
        if (status && status !== booking.status) {
            try {
                await emailService.sendBookingStatusUpdate(updatedBooking);
            } catch (emailError) {
                console.error('Status update email failed:', emailError);
            }
        }

        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: updatedBooking
        });

    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Cancel booking
// @route    PUT /api/bookings/:id/cancel
// @access   Public
exports.cancelBooking = async (req, res) => {
    try {
        const { reason } = req.body;
        
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking can be cancelled
        if (booking.status === 'cancelled' || booking.status === 'checked-out') {
            return res.status(400).json({
                success: false,
                message: 'This booking cannot be cancelled'
            });
        }

        // Update booking status
        booking.status = 'cancelled';
        booking.notes.push({
            content: `Cancelled by user. Reason: ${reason || 'No reason provided'}`,
            author: 'Customer',
            timestamp: new Date()
        });

        await booking.save();

        // Send cancellation email
        try {
            await emailService.sendBookingCancellation(booking);
        } catch (emailError) {
            console.error('Cancellation email failed:', emailError);
        }

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get booking statistics
// @route    GET /api/bookings/stats
// @access   Private/Admin
exports.getBookingStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const stats = await Booking.getStats();
        const upcomingBookings = await Booking.getUpcomingBookings(7);
        
        let revenueStats = [];
        if (startDate && endDate) {
            revenueStats = await Booking.getRevenueStats(
                new Date(startDate),
                new Date(endDate)
            );
        }

        res.json({
            success: true,
            data: {
                stats,
                upcomingBookings,
                revenueStats
            }
        });

    } catch (error) {
        console.error('Get booking stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Check availability
// @route    POST /api/bookings/check-availability
// @access   Public
exports.checkAvailability = async (req, res) => {
    try {
        const { programType, startDate, endDate, participants } = req.body;
        
        // Check if dates are valid
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start >= end) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        // Check for conflicting bookings
        const conflictingBookings = await Booking.find({
            'program.type': programType,
            'program.startDate': { $lte: end },
            'program.endDate': { $gte: start },
            status: { $in: ['confirmed', 'checked-in'] }
        });

        // Calculate total participants for conflicting bookings
        const totalParticipants = conflictingBookings.reduce(
            (total, booking) => total + booking.totalParticipants,
            0
        );

        // Maximum capacity is 25
        const isAvailable = totalParticipants + participants <= 25;

        res.json({
            success: true,
            data: {
                available: isAvailable,
                currentBookings: conflictingBookings.length,
                totalParticipants,
                remainingCapacity: 25 - totalParticipants
            }
        });

    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
