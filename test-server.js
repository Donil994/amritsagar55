const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// Middleware
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname)));

// Routes for serving HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// About pages
app.get('/about-aghor-foundation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about-aghor-foundation.html'));
});

app.get('/about-bal-ashram.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about-bal-ashram.html'));
});

app.get('/about-holistic-farm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about-holistic-farm.html'));
});

app.get('/about-team.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about-team.html'));
});

// Programs pages
app.get('/programs-day-visit.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'programs-day-visit.html'));
});

app.get('/programs-retreats.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'programs-retreats.html'));
});

app.get('/programs-yoga.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'programs-yoga.html'));
});

app.get('/programs-treatments.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'programs-treatments.html'));
});

// Other pages
app.get('/amenities.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'amenities.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🌟 Amrit Sagar Test Server Running`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🕐 Started at: ${new Date().toLocaleString()}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
