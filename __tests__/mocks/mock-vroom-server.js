const express = require('express');
const vroomRequests = require('./vroom-requests');
const vroomResponses = require('./vroom-responses');

/**
 * Mock VROOM server for testing
 * Provides endpoints that simulate VROOM behavior without requiring a real VROOM installation
 */
class MockVroomServer {
  constructor(port = 3001) {
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
      res.json({ status: 'OK', service: 'Mock VROOM Server' });
    });

    // Main VROOM optimization endpoint
    this.app.post('/', (req, res) => {
      this.handleVroomRequest(req, res);
    });

    // Alternative endpoint path
    this.app.post('/vroom', (req, res) => {
      this.handleVroomRequest(req, res);
    });
  }

  handleVroomRequest(req, res) {
    const request = req.body;

    // Validate request structure
    if (!request || !request.vehicles || !Array.isArray(request.vehicles)) {
      return res.status(400).json(vroomResponses.errorVroomResponse);
    }

    // Determine which mock response to return based on request characteristics
    const response = this.selectMockResponse(request);
    
    // Simulate some processing time
    setTimeout(() => {
      res.json(response);
    }, Math.random() * 100 + 50); // 50-150ms delay
  }

  selectMockResponse(request) {
    // If request matches our sample test data, return corresponding response
    if (this.isMatchingSampleRequest(request)) {
      return vroomResponses.sampleVroomResponse;
    }

    // If it's a simple request with minimal jobs
    if (request.jobs && request.jobs.length <= 2) {
      return vroomResponses.simpleVroomResponse;
    }

    // If it's a complex request with many jobs, might have unassigned items
    if (request.jobs && request.jobs.length > 2) {
      return vroomResponses.partialVroomResponse;
    }

    // Default to simple response
    return vroomResponses.simpleVroomResponse;
  }

  isMatchingSampleRequest(request) {
    const sample = vroomRequests.sampleVroomRequest;
    
    // Check if vehicle and job counts match
    return request.vehicles &&
           request.jobs &&
           request.vehicles.length === sample.vehicles.length &&
           request.jobs.length === sample.jobs.length &&
           request.matrices &&
           request.matrices.car;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`Mock VROOM server started on port ${this.port}`);
          resolve();
        }
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Mock VROOM server stopped');
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

module.exports = MockVroomServer;