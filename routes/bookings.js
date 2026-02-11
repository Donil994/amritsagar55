const express = require('express');
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules for booking creation
const bookingValidation = [
    body('personalInfo.firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('personalInfo.lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('personalInfo.email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('personalInfo.phone')
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
    body('personalInfo.country')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Country must be between 2 and 50 characters'),
    body('program.type')
        .isIn(['day-visit', 'retreat', 'yoga-class', 'private-yoga', 'treatment', 'custom'])
        .withMessage('Invalid program type'),
    body('program.name')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Program name must be between 5 and 100 characters'),
    body('program.duration')
        .isInt({ min: 1, max: 30 })
        .withMessage('Duration must be between 1 and 30 days'),
    body('program.startDate')
        .isISO8601()
        .withMessage('Please provide a valid start date'),
    body('program.endDate')
        .isISO8601()
        .withMessage('Please provide a valid end date'),
    body('program.participants.adults')
        .isInt({ min: 1, max: 25 })
        .withMessage('Adults must be between 1 and 25'),
    body('program.participants.children')
        .optional()
        .isInt({ min: 0, max: 10 })
        .withMessage('Children must be between 0 and 10'),
    body('payment.amount')
        .isFloat({ min: 0 })
        .withMessage('Amount must be a positive number')
];

// Validation rules for availability check
const availabilityValidation = [
    body('programType')
        .isIn(['day-visit', 'retreat', 'yoga-class', 'private-yoga', 'treatment', 'custom'])
        .withMessage('Invalid program type'),
    body('startDate')
        .isISO8601()
        .withMessage('Please provide a valid start date'),
    body('endDate')
        .isISO8601()
        .withMessage('Please provide a valid end date'),
    body('participants')
        .isInt({ min: 1, max: 25 })
        .withMessage('Participants must be between 1 and 25')
];

// Public routes
router.post('/', bookingValidation, bookingController.createBooking);
router.post('/check-availability', availabilityValidation, bookingController.checkAvailability);
router.put('/:id/cancel', bookingController.cancelBooking);

// Protected admin routes
router.get('/', protect, bookingController.getBookings);
router.get('/stats', protect, bookingController.getBookingStats);
router.get('/:id', protect, bookingController.getBooking);
router.put('/:id', protect, bookingController.updateBooking);

module.exports = router;
