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
        
        // Store in localStorage (in production, this would go to a database)
        const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
        submissions.push(contactData);
        localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
        
        // Log the submission
        console.log('New contact submission:', contactData);
        
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
        const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
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

// Handle 404
app.use('*', (req, res) => {
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
