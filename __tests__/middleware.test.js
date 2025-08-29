const request = require('supertest');
const app = require('../src/index');
const vroomRequests = require('./mocks/vroom-requests');
const MockOsrmServer = require('./mocks/mock-osrm-server');

describe('VROOM Middleware Integration', () => {
  let mockOsrmServer;

  beforeAll(async () => {
    // Start mock OSRM server for fallback scenarios
    mockOsrmServer = new MockOsrmServer(5000);
    await mockOsrmServer.start();
  });

  afterAll(async () => {
    await mockOsrmServer.stop();
  });

  beforeEach(async () => {
    // Reset middleware state before each test
    await request(app)
      .post('/api/v1/vroom/reset')
      .expect(200);
  });

  describe('Middleware Initialization', () => {
    it('should initialize with valid VROOM request', async () => {
      const response = await request(app)
        .post('/api/v1/vroom/initialize')
        .send(vroomRequests.sampleVroomRequest)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Middleware initialized successfully');
      expect(response.body).toHaveProperty('locationMappings');
      expect(response.body).toHaveProperty('hasMatrix', true);
      expect(response.body.locationMappings).toBeGreaterThan(0);
    });

    it('should reject invalid VROOM request', async () => {
      const invalidRequest = { invalid: 'data' };

      const response = await request(app)
        .post('/api/v1/vroom/initialize')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid VROOM request data');
    });

    it('should handle simple VROOM request without matrices', async () => {
      const response = await request(app)
        .post('/api/v1/vroom/initialize')
        .send(vroomRequests.simpleVroomRequest)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Middleware initialized successfully');
      expect(response.body).toHaveProperty('hasMatrix', false);
    });
  });

  describe('OSRM Table Endpoint', () => {
    beforeEach(async () => {
      // Initialize middleware with sample data
      await request(app)
        .post('/api/v1/vroom/initialize')
        .send(vroomRequests.sampleVroomRequest)
        .expect(200);
    });

    it('should handle table request with cached matrix data', async () => {
      // Use coordinates that match the sample request (3x3 matrix)
      const coordinates = '42.35570180784958,-71.05633638012095;42.357,-71.056;42.358,-71.057';

      const response = await request(app)
        .get(`/osrm/table/v1/driving/${coordinates}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 'Ok');
      expect(response.body).toHaveProperty('durations');
      expect(response.body).toHaveProperty('distances');
      expect(response.body.durations).toBeInstanceOf(Array);
      expect(response.body.distances).toBeInstanceOf(Array);
    });

    it('should handle table request with sources and destinations', async () => {
      // Use coordinates that exist in our cached matrix (3x3 matrix)
      const coordinates = '42.35570180784958,-71.05633638012095;42.357,-71.056;42.358,-71.057';

      const response = await request(app)
        .get(`/osrm/table/v1/car/${coordinates}`)
        .query({ sources: '0;1', destinations: '1;2' })
        .expect(200);

      expect(response.body).toHaveProperty('code', 'Ok');
      expect(response.body.durations).toHaveLength(2); // 2 sources
      expect(response.body.durations[0]).toHaveLength(2); // 2 destinations
    });

    it('should fallback to real OSRM for unmapped coordinates', async () => {
      // Use coordinates not in our cached data
      const unknownCoordinates = '13.388860,52.517037;13.385983,52.496891';

      const response = await request(app)
        .get(`/osrm/table/v1/driving/${unknownCoordinates}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 'Ok');
      expect(response.body).toHaveProperty('durations');
    });
  });

  describe('Middleware State Management', () => {
    it('should reset middleware state', async () => {
      // Initialize first
      await request(app)
        .post('/api/v1/vroom/initialize')
        .send(vroomRequests.sampleVroomRequest)
        .expect(200);

      // Reset
      const response = await request(app)
        .post('/api/v1/vroom/reset')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Middleware reset successfully');
    });

    it('should handle table request without initialization (fallback)', async () => {
      // Don't initialize, should fallback to OSRM
      const coordinates = '13.388860,52.517037;13.385983,52.496891';

      const response = await request(app)
        .get(`/osrm/table/v1/driving/${coordinates}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 'Ok');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid coordinates format', async () => {
      await request(app)
        .post('/api/v1/vroom/initialize')
        .send(vroomRequests.sampleVroomRequest)
        .expect(200);

      const invalidCoordinates = 'invalid-format';

      const response = await request(app)
        .get(`/osrm/table/v1/driving/${invalidCoordinates}`)
        .expect(500);

      expect(response.body).toHaveProperty('code', 'InternalError');
    });

    it('should handle OSRM server unavailable', async () => {
      // Stop the mock OSRM server to simulate unavailability
      await mockOsrmServer.stop();

      const coordinates = '13.388860,52.517037;13.385983,52.496891';

      const response = await request(app)
        .get(`/osrm/table/v1/driving/${coordinates}`)
        .expect(500);

      expect(response.body).toHaveProperty('code', 'InternalError');

      // Start a new mock server for remaining tests
      mockOsrmServer = new MockOsrmServer(5001); // Use different port
      await mockOsrmServer.start();
    }, 10000); // Increase timeout for this test
  });

  describe('Matrix Coordinate Mapping', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/vroom/initialize')
        .send(vroomRequests.sampleVroomRequest)
        .expect(200);
    });

    it('should correctly map coordinates to location indices', async () => {
      // Test with exact coordinates from the sample request
      const startCoords = '42.35570180784958,-71.05633638012095';

      const response = await request(app)
        .get(`/osrm/table/v1/driving/${startCoords};${startCoords}`)
        .expect(200);

      expect(response.body.durations[0][0]).toBe(0); // Same location should have 0 duration
      expect(response.body.distances[0][0]).toBe(0); // Same location should have 0 distance
    });

    it('should handle precision differences in coordinates', async () => {
      // Use slightly different precision for the same coordinates
      const coords1 = '42.355702,-71.056336'; // Rounded version
      const coords2 = '42.35570180784958,-71.05633638012095'; // Exact version

      const response = await request(app)
        .get(`/osrm/table/v1/driving/${coords1};${coords2}`)
        .expect(200);

      // Should either map to cached data or fallback gracefully
      expect(response.body).toHaveProperty('code', 'Ok');
    });
  });
});