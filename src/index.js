const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'OSRM Google VROOM Middleware'
    });
});

// Main API routes
app.get('/api/v1/status', (req, res) => {
    res.json({
        message: 'OSRM Google VROOM Middleware is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// OSRM routing endpoint placeholder
app.post('/api/v1/route/osrm', (req, res) => {
    // TODO: Implement OSRM routing logic
    res.json({
        message: 'OSRM routing endpoint',
        data: req.body
    });
});

// Google Maps routing endpoint placeholder
app.post('/api/v1/route/google', (req, res) => {
    // TODO: Implement Google Maps routing logic
    res.json({
        message: 'Google Maps routing endpoint',
        data: req.body
    });
});

// VROOM optimization endpoint placeholder
app.post('/api/v1/optimize/vroom', (req, res) => {
    // TODO: Implement VROOM optimization logic
    res.json({
        message: 'VROOM optimization endpoint',
        data: req.body
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });
}

module.exports = app;
