const express = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const contactValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
    body('subject')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Subject must be between 5 and 200 characters'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Message must be between 10 and 2000 characters')
];

// Public routes
router.post('/', contactValidation, contactController.submitContact);

// Protected admin routes
router.get('/', protect, contactController.getContacts);
router.get('/stats', protect, contactController.getContactStats);
router.get('/:id', protect, contactController.getContact);
router.put('/:id', protect, contactController.updateContact);
router.delete('/:id', protect, contactController.deleteContact);

module.exports = router;
