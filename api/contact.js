// Vercel Serverless Function for Contact Form
const { validationResult } = require('express-validator');

// Validation rules
const validateContact = [
    { name: 'name', notEmpty: true, isLength: { options: { min: 2, max: 50 } },
      errorMessage: 'Name must be between 2 and 50 characters' },
    { name: 'email', notEmpty: true, isEmail: true,
      errorMessage: 'Please provide a valid email address' },
    { name: 'subject', notEmpty: true, isLength: { options: { min: 3, max: 100 } },
      errorMessage: 'Subject must be between 3 and 100 characters' },
    { name: 'message', notEmpty: true, isLength: { options: { min: 10, max: 1000 } },
      errorMessage: 'Message must be between 10 and 1000 characters' }
];

// Main handler function
module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        // Parse request body
        const body = JSON.parse(req.body);
        const { name, email, phone, subject, message, newsletter } = body;

        // Basic validation
        const errors = [];
        
        if (!name || name.trim().length < 2) {
            errors.push('Name is required and must be at least 2 characters');
        }
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Valid email address is required');
        }
        
        if (!subject || subject.trim().length < 3) {
            errors.push('Subject is required and must be at least 3 characters');
        }
        
        if (!message || message.trim().length < 10) {
            errors.push('Message is required and must be at least 10 characters');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        // Create contact submission
        const contactData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : '',
            subject: subject.trim(),
            message: message.trim(),
            newsletter: newsletter === 'on' || newsletter === true,
            timestamp: new Date().toISOString(),
            id: Date.now(),
            ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown'
        };

        // In production, you would:
        // 1. Save to database (MongoDB, PostgreSQL, etc.)
        // 2. Send email notification using services like SendGrid, AWS SES
        // 3. Store in analytics
        
        // For now, we'll just log and return success
        console.log('New contact submission:', {
            ...contactData,
            timestamp: new Date().toISOString()
        });

        // Send email notification (placeholder - implement with your email service)
        try {
            // Example: await sendEmailNotification(contactData);
            console.log('Email notification would be sent here');
        } catch (emailError) {
            console.error('Email notification failed:', emailError);
            // Don't fail the request if email fails
        }

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!',
            data: {
                id: contactData.id,
                name: contactData.name,
                email: contactData.email,
                subject: contactData.subject,
                timestamp: contactData.timestamp
            }
        });

    } catch (error) {
        console.error('Contact form submission error:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
