const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Only start server if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
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
}

module.exports = app;
