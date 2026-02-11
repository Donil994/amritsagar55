const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');
const emailService = require('../utils/emailService');

// @desc    Submit contact form
// @route    POST /api/contact
// @access   Public
exports.submitContact = async (req, res) => {
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

        const { name, email, phone, subject, message, source = 'contact-form' } = req.body;

        // Create contact entry
        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message,
            source,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Send email notification
        try {
            await emailService.sendContactNotification(contact);
            
            // Send auto-reply to user
            await emailService.sendAutoReply(contact);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!',
            data: {
                id: contact._id,
                name: contact.name,
                email: contact.email,
                subject: contact.subject
            }
        });

    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// @desc    Get all contacts (admin)
// @route    GET /api/contact
// @access   Private/Admin
exports.getContacts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { status, priority, search } = req.query;
        
        // Build query
        let query = {};
        
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Contact.countDocuments(query);

        res.json({
            success: true,
            data: contacts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single contact
// @route    GET /api/contact/:id
// @access   Private/Admin
exports.getContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            data: contact
        });

    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update contact status
// @route    PUT /api/contact/:id
// @access   Private/Admin
exports.updateContact = async (req, res) => {
    try {
        const { status, priority, assignedTo, note } = req.body;
        
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        // Update contact
        const updateData = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (assignedTo) updateData.assignedTo = assignedTo;
        
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

        const updatedContact = await Contact.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Contact updated successfully',
            data: updatedContact
        });

    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete contact
// @route    DELETE /api/contact/:id
// @access   Private/Admin
exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        await contact.deleteOne();

        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });

    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get contact statistics
// @route    GET /api/contact/stats
// @access   Private/Admin
exports.getContactStats = async (req, res) => {
    try {
        const stats = await Contact.getStats();
        const recentContacts = await Contact.getRecentContacts(7);
        
        res.json({
            success: true,
            data: {
                stats,
                recentContacts
            }
        });

    } catch (error) {
        console.error('Get contact stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
