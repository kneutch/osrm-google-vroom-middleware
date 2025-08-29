const request = require('supertest');
const MockVroomServer = require('./mocks/mock-vroom-server');
const MockOsrmServer = require('./mocks/mock-osrm-server');
const vroomRequests = require('./mocks/vroom-requests');
const vroomResponses = require('./mocks/vroom-responses');
const osrmResponses = require('./mocks/osrm-responses');

describe('Mock VROOM Server', () => {
  let mockVroomServer;

  beforeAll(async () => {
    mockVroomServer = new MockVroomServer(3001);
    await mockVroomServer.start();
  });

  afterAll(async () => {
    await mockVroomServer.stop();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(mockVroomServer.app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        service: 'Mock VROOM Server'
      });
    });
  });

  describe('VROOM Optimization', () => {
    it('should handle sample VROOM request', async () => {
      const response = await request(mockVroomServer.app)
        .post('/')
        .send(vroomRequests.sampleVroomRequest)
        .expect(200);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('routes');
      expect(response.body.routes).toHaveLength(1);
    });

    it('should handle simple VROOM request', async () => {
      const response = await request(mockVroomServer.app)
        .post('/vroom')
        .send(vroomRequests.simpleVroomRequest)
        .expect(200);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('routes');
    });

    it('should return error for invalid request', async () => {
      const invalidRequest = { invalid: 'data' };

      const response = await request(mockVroomServer.app)
        .post('/')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('code', 2);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle complex request with multiple vehicles', async () => {
      const response = await request(mockVroomServer.app)
        .post('/')
        .send(vroomRequests.complexVroomRequest)
        .expect(200);

      expect(response.body).toHaveProperty('code', 0);
      expect(response.body).toHaveProperty('unassigned');
      // Complex requests might have unassigned jobs
    });
  });
});

describe('Mock OSRM Server', () => {
  let mockOsrmServer;

  beforeAll(async () => {
    mockOsrmServer = new MockOsrmServer(5000);
    await mockOsrmServer.start();
  });

  afterAll(async () => {
    await mockOsrmServer.stop();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(mockOsrmServer.app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        service: 'Mock OSRM Server'
      });
    });
  });

  describe('Table Endpoint', () => {
    it('should handle table request with coordinates', async () => {
      const coordinates = '13.388860,52.517037;13.385983,52.496891';
      
      const response = await request(mockOsrmServer.app)
        .get(`/table/v1/driving/${coordinates}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 'Ok');
      expect(response.body).toHaveProperty('durations');
      expect(response.body).toHaveProperty('distances');
      expect(response.body.durations).toHaveLength(2);
      expect(response.body.durations[0]).toHaveLength(2);
    });

    it('should handle 4-point matrix request', async () => {
      const coordinates = '42.35570180784958,-71.05633638012095;42.357,-71.056;42.358,-71.057;42.359,-71.058';
      
      const response = await request(mockOsrmServer.app)
        .get(`/table/v1/car/${coordinates}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 'Ok');
      expect(response.body).toHaveProperty('durations');
      expect(response.body.durations).toHaveLength(4);
      expect(response.body.durations[0]).toHaveLength(4);
    });

    it('should return error for invalid coordinates', async () => {
      const invalidCoordinates = 'invalid,coordinates';
      
      const response = await request(mockOsrmServer.app)
        .get(`/table/v1/driving/${invalidCoordinates}`)
        .expect(400);

      expect(response.body).toHaveProperty('code', 'InvalidInput');
    });
  });

  describe('Route Endpoint', () => {
    it('should handle route request', async () => {
      const coordinates = '13.388860,52.517037;13.385983,52.496891';
      
      const response = await request(mockOsrmServer.app)
        .get(`/route/v1/driving/${coordinates}`)
        .expect(200);

      expect(response.body).toHaveProperty('code', 'Ok');
      expect(response.body).toHaveProperty('routes');
      expect(response.body.routes).toHaveLength(1);
    });

    it('should return error for single coordinate route request', async () => {
      const coordinates = '13.388860,52.517037';
      
      const response = await request(mockOsrmServer.app)
        .get(`/route/v1/driving/${coordinates}`)
        .expect(400);

      expect(response.body).toHaveProperty('code', 'NoRoute');
    });
  });

  describe('Invalid Endpoints', () => {
    it('should return error for unknown endpoint', async () => {
      const response = await request(mockOsrmServer.app)
        .get('/unknown/endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('code', 'InvalidUrl');
    });
  });
});

describe('Mock Data Validation', () => {
  describe('VROOM Requests', () => {
    it('should have valid sample request structure', () => {
      const sample = vroomRequests.sampleVroomRequest;
      
      expect(sample).toHaveProperty('vehicles');
      expect(sample).toHaveProperty('jobs');
      expect(sample).toHaveProperty('matrices');
      expect(sample.vehicles).toBeInstanceOf(Array);
      expect(sample.jobs).toBeInstanceOf(Array);
      expect(sample.matrices).toHaveProperty('car');
    });

    it('should have valid simple request structure', () => {
      const simple = vroomRequests.simpleVroomRequest;
      
      expect(simple).toHaveProperty('vehicles');
      expect(simple).toHaveProperty('jobs');
      expect(simple.vehicles).toHaveLength(1);
      expect(simple.jobs).toHaveLength(2);
    });
  });

  describe('VROOM Responses', () => {
    it('should have valid response structure', () => {
      const response = vroomResponses.sampleVroomResponse;
      
      expect(response).toHaveProperty('code', 0);
      expect(response).toHaveProperty('summary');
      expect(response).toHaveProperty('routes');
      expect(response.routes).toBeInstanceOf(Array);
    });

    it('should have valid error response structure', () => {
      const error = vroomResponses.errorVroomResponse;
      
      expect(error).toHaveProperty('code', 2);
      expect(error).toHaveProperty('error');
    });
  });

  describe('OSRM Responses', () => {
    it('should have valid table response structure', () => {
      const response = osrmResponses.tableResponse;
      
      expect(response).toHaveProperty('code', 'Ok');
      expect(response).toHaveProperty('durations');
      expect(response).toHaveProperty('distances');
      expect(response.durations).toBeInstanceOf(Array);
      expect(response.distances).toBeInstanceOf(Array);
    });

    it('should have valid route response structure', () => {
      const response = osrmResponses.routeResponse;
      
      expect(response).toHaveProperty('code', 'Ok');
      expect(response).toHaveProperty('routes');
      expect(response.routes).toBeInstanceOf(Array);
    });
  });
});