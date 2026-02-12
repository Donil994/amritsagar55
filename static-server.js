const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname)));

// Serve HTML files for all routes
app.get(['/about-aghor-foundation', '/about-bal-ashram', '/about-holistic-farm', '/about-team', 
         '/programs-day-visit', '/programs-retreats', '/programs-yoga', '/programs-treatments',
         '/amenities', '/contact'], (req, res) => {
    const filePath = req.path.slice(1) + '.html';
    res.sendFile(path.join(__dirname, filePath));
});

// Serve homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: 'development'
    });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message, newsletter } = req.body;
        
        // Basic validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }
        
        // Create contact submission
        const contactData = {
            name,
            email,
            phone: phone || '',
            subject,
            message,
            newsletter: newsletter === 'on',
            timestamp: new Date().toISOString(),
            id: Date.now(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };
        
        // Log the submission (in production, save to database)
        console.log('New contact submission:', contactData);
        
        // Store in memory for demo (in production, use database)
        if (!global.contactSubmissions) {
            global.contactSubmissions = [];
        }
        global.contactSubmissions.push(contactData);
        
        // In a real application, you would:
        // 1. Save to database
        // 2. Send email notification
        // 3. Send auto-reply to user
        
        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon!',
            data: {
                id: contactData.id,
                name: contactData.name,
                email: contactData.email,
                subject: contactData.subject
            }
        });
        
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// Get contact submissions (admin endpoint)
app.get('/api/contact', (req, res) => {
    try {
        const submissions = global.contactSubmissions || [];
        res.json({
            success: true,
            data: submissions.reverse() // Most recent first
        });
    } catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Donation endpoint
app.post('/api/donate', async (req, res) => {
    try {
        const { 
            currency, 
            amount, 
            donationType, 
            name, 
            email, 
            phone, 
            purpose, 
            message, 
            paymentMethod 
        } = req.body;
        
        // Basic validation
        const errors = [];
        
        if (!currency || !['USD', 'INR'].includes(currency)) {
            errors.push('Valid currency (USD or INR) is required');
        }
        
        if (!amount || amount < 1) {
            errors.push('Donation amount must be at least 1');
        }
        
        if (!name || name.trim().length < 2) {
            errors.push('Name is required and must be at least 2 characters');
        }
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Valid email address is required');
        }
        
        if (!donationType || !['one-time', 'monthly'].includes(donationType)) {
            errors.push('Valid donation type is required');
        }
        
        if (!paymentMethod || !['card', 'paypal', 'upi', 'bank'].includes(paymentMethod)) {
            errors.push('Valid payment method is required');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        // Create donation record
        const donationData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : '',
            currency: currency.toUpperCase(),
            amount: parseFloat(amount),
            donationType,
            purpose: purpose || 'general',
            message: message ? message.trim() : '',
            paymentMethod,
            status: 'pending',
            timestamp: new Date().toISOString(),
            id: 'DON' + Date.now(),
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };
        
        // Store in memory (in production, save to database)
        if (!global.donations) {
            global.donations = [];
        }
        global.donations.push(donationData);
        
        // Log the donation
        console.log('New donation submission:', donationData);
        
        // Generate payment URL
        const paymentUrl = generatePaymentUrl(donationData);
        
        res.status(201).json({
            success: true,
            message: 'Thank you for your donation! Redirecting to payment...',
            data: {
                id: donationData.id,
                name: donationData.name,
                email: donationData.email,
                amount: donationData.amount,
                currency: donationData.currency,
                paymentUrl: paymentUrl,
                transactionId: donationData.id
            }
        });
        
    } catch (error) {
        console.error('Donation processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// Get donations (admin endpoint)
app.get('/api/donate', (req, res) => {
    try {
        const donations = global.donations || [];
        res.json({
            success: true,
            data: donations.reverse() // Most recent first
        });
    } catch (error) {
        console.error('Get donations error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Generate payment URL helper function
function generatePaymentUrl(donationData) {
    const baseUrl = 'http://localhost:5000';
    
    const params = new URLSearchParams({
        amount: donationData.amount,
        currency: donationData.currency,
        transactionId: donationData.id,
        name: donationData.name,
        email: donationData.email,
        donationType: donationData.donationType
    });

    switch (donationData.paymentMethod) {
        case 'paypal':
            // PayPal URL (sandbox for development)
            const paypalUrl = donationData.currency === 'USD' 
                ? 'https://www.sandbox.paypal.com/cgi-bin/webscr'
                : 'https://www.paypal.com/cgi-bin/webscr';
            
            return `${paypalUrl}?cmd=_donations&business=donations@amritsagar.org&item_name=Donation&amount=${donationData.amount}&currency_code=${donationData.currency}&return=${baseUrl}/donate/success&cancel_return=${baseUrl}/donate/cancel`;

        case 'upi':
            // UPI payment URL (for INR only)
            if (donationData.currency !== 'INR') {
                throw new Error('UPI is only available for INR donations');
            }
            return `upi://pay?pa=amritsagar@upi&pn=Amrit%20Sagar&am=${donationData.amount}&cu=INR&tn=Donation`;

        case 'bank':
            // Bank transfer instructions page
            return `${baseUrl}/donate/bank-transfer?${params.toString()}`;

        case 'card':
        default:
            // Credit/debit card payment (Stripe or similar)
            return `${baseUrl}/donate/card-payment?${params.toString()}`;
    }
}

// Handle 404
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Page Not Found</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                h1 { color: #10b881; }
                a { color: #10b881; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/">Go back to homepage</a>
        </body>
        </html>
    `);
});

const server = app.listen(PORT, () => {
    console.log(`
🌟 Amrit Sagar Static Server Running 🌟
📍 Port: ${PORT}
🌍 Environment: development
🕐 Started at: ${new Date().toLocaleString()}
📡 Health check: http://localhost:${PORT}/health
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

module.exports = app;
