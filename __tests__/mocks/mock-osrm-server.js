const express = require('express');
const osrmResponses = require('./osrm-responses');

/**
 * Mock OSRM server for testing
 * Provides OSRM-compatible endpoints that simulate OSRM behavior
 */
class MockOsrmServer {
  constructor(port = 5000) {
    this.app = express();
    this.port = port;
    this.server = null;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', service: 'Mock OSRM Server' });
    });

    // Table endpoint - main endpoint used by VROOM
    this.app.get('/table/v1/:profile/:coordinates', (req, res) => {
      this.handleTableRequest(req, res);
    });

    // Alternative table endpoint format
    this.app.get('/table/v1/driving/:coordinates', (req, res) => {
      this.handleTableRequest(req, res);
    });

    // Route endpoint
    this.app.get('/route/v1/:profile/:coordinates', (req, res) => {
      this.handleRouteRequest(req, res);
    });

    // Generic catch-all for OSRM API structure
    this.app.get('/*', (req, res) => {
      res.status(404).json({
        code: 'InvalidUrl',
        message: 'URL string is invalid.'
      });
    });
  }

  handleTableRequest(req, res) {
    const { coordinates } = req.params;
    const { sources, destinations } = req.query;

    // Validate coordinates
    if (!coordinates || !this.isValidCoordinates(coordinates)) {
      return res.status(400).json(osrmResponses.errorResponses.invalidCoordinate);
    }

    // Parse coordinates
    const coordPairs = this.parseCoordinates(coordinates);

    // Generate appropriate mock response based on coordinate count
    const response = this.generateTableResponse(coordPairs, sources, destinations);
    
    // Simulate processing time
    setTimeout(() => {
      res.json(response);
    }, Math.random() * 50 + 10); // 10-60ms delay
  }

  handleRouteRequest(req, res) {
    const { coordinates } = req.params;

    // Validate coordinates
    if (!coordinates || !this.isValidCoordinates(coordinates)) {
      return res.status(400).json(osrmResponses.errorResponses.invalidCoordinate);
    }

    // Parse coordinates
    const coordPairs = this.parseCoordinates(coordinates);

    if (coordPairs.length < 2) {
      return res.status(400).json(osrmResponses.errorResponses.noRoute);
    }

    // Return mock route response
    setTimeout(() => {
      res.json(osrmResponses.routeResponse);
    }, Math.random() * 100 + 20); // 20-120ms delay
  }

  isValidCoordinates(coordinates) {
    // Basic validation for coordinate string format
    const coordRegex = /^(-?\d+\.?\d*),(-?\d+\.?\d*)(;(-?\d+\.?\d*),(-?\d+\.?\d*))*$/;
    return coordRegex.test(coordinates);
  }

  parseCoordinates(coordinates) {
    return coordinates.split(';').map(coord => {
      const [lng, lat] = coord.split(',').map(Number);
      return [lng, lat];
    });
  }

  generateTableResponse(coordinates, sources, destinations) {
    const count = coordinates.length;

    // For our test data, return the pre-defined response
    if (count === 4) {
      return osrmResponses.tableResponse;
    }

    // For simple 2-point requests
    if (count === 2) {
      return osrmResponses.simpleTableResponse;
    }

    // Generate a basic symmetric matrix for other cases
    return this.generateBasicMatrix(coordinates);
  }

  generateBasicMatrix(coordinates) {
    const count = coordinates.length;
    const durations = [];
    const distances = [];

    for (let i = 0; i < count; i++) {
      const durRow = [];
      const distRow = [];
      
      for (let j = 0; j < count; j++) {
        if (i === j) {
          durRow.push(0);
          distRow.push(0);
        } else {
          // Generate mock durations (in seconds) and distances (in meters)
          const mockDuration = Math.floor(Math.random() * 3000) + 300; // 5min to 55min
          const mockDistance = Math.floor(Math.random() * 50000) + 1000; // 1km to 51km
          durRow.push(mockDuration);
          distRow.push(mockDistance);
        }
      }
      
      durations.push(durRow);
      distances.push(distRow);
    }

    return {
      code: 'Ok',
      durations,
      distances,
      sources: coordinates.map((coord, idx) => ({
        hint: `hint_${idx}`,
        distance: 0,
        location: coord,
        name: ''
      })),
      destinations: coordinates.map((coord, idx) => ({
        hint: `hint_${idx}`,
        distance: 0,
        location: coord,
        name: ''
      }))
    };
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`Mock OSRM server started on port ${this.port}`);
          resolve();
        }
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Mock OSRM server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getUrl() {
    return `http://localhost:${this.port}`;
  }
}

module.exports = MockOsrmServer;