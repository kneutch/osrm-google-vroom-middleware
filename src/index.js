const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const VroomMiddleware = require('./vroom-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize VROOM middleware
const vroomMiddleware = new VroomMiddleware({
  osrmUrl: process.env.OSRM_URL || 'http://localhost:5000',
  googleApiKey: process.env.GOOGLE_API_KEY,
  enableGoogleCorrections: process.env.ENABLE_GOOGLE_CORRECTIONS === 'true'
});

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

// OSRM-compatible endpoints for VROOM integration
// These endpoints emulate OSRM API structure but use cached matrix data

// Table endpoint - primary endpoint used by VROOM
app.get('/osrm/table/v1/:profile/:coordinates', async (req, res) => {
  try {
    const { coordinates } = req.params;
    const { sources, destinations } = req.query;
    
    console.log(`OSRM table request: ${coordinates}`);
    
    const result = await vroomMiddleware.handleTableRequest(coordinates, sources, destinations);
    res.json(result);
  } catch (error) {
    console.error('OSRM table error:', error);
    res.status(500).json({
      code: 'InternalError',
      message: 'Internal server error processing table request'
    });
  }
});

// Alternative table endpoint format
app.get('/osrm/table/v1/driving/:coordinates', async (req, res) => {
  try {
    const { coordinates } = req.params;
    const { sources, destinations } = req.query;
    
    console.log(`OSRM table request (driving): ${coordinates}`);
    
    const result = await vroomMiddleware.handleTableRequest(coordinates, sources, destinations);
    res.json(result);
  } catch (error) {
    console.error('OSRM table error:', error);
    res.status(500).json({
      code: 'InternalError',
      message: 'Internal server error processing table request'
    });
  }
});

// Initialize middleware with VROOM request data
app.post('/api/v1/vroom/initialize', (req, res) => {
  try {
    const vroomRequest = req.body;
    
    if (!vroomRequest || !vroomRequest.vehicles) {
      return res.status(400).json({
        error: 'Invalid VROOM request data',
        message: 'Request must contain vehicles array'
      });
    }
    
    vroomMiddleware.initializeFromVroomRequest(vroomRequest);
    
    res.json({
      message: 'Middleware initialized successfully',
      locationMappings: vroomMiddleware.locationMatrix.size,
      hasMatrix: !!vroomMiddleware.durationMatrix
    });
  } catch (error) {
    console.error('Initialization error:', error);
    res.status(500).json({
      error: 'Failed to initialize middleware',
      message: error.message
    });
  }
});

// Reset middleware state
app.post('/api/v1/vroom/reset', (req, res) => {
  try {
    vroomMiddleware.reset();
    res.json({
      message: 'Middleware reset successfully'
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({
      error: 'Failed to reset middleware',
      message: error.message
    });
  }
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
app.use((err, req, res, _next) => {
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
