const request = require('supertest');
const app = require('../src/index');

describe('API Endpoints', () => {
    describe('GET /health', () => {
        it('should return health status', async () => {
            const res = await request(app)
                .get('/health')
                .expect(200);

            expect(res.body).toHaveProperty('status', 'OK');
            expect(res.body).toHaveProperty('timestamp');
            expect(res.body).toHaveProperty('service');
        });
    });

    describe('GET /api/v1/status', () => {
        it('should return service status', async () => {
            const res = await request(app)
                .get('/api/v1/status')
                .expect(200);

            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('version');
            expect(res.body).toHaveProperty('environment');
        });
    });

    describe('POST /api/v1/route/osrm', () => {
        it('should handle OSRM routing request', async () => {
            const requestData = {
                coordinates: [[13.388860, 52.517037], [13.385983, 52.496891]]
            };

            const res = await request(app)
                .post('/api/v1/route/osrm')
                .send(requestData)
                .expect(200);

            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('data');
        });
    });

    describe('404 Handler', () => {
        it('should return 404 for unknown routes', async () => {
            const res = await request(app)
                .get('/unknown-route')
                .expect(404);

            expect(res.body).toHaveProperty('error', 'Route not found');
            expect(res.body).toHaveProperty('path', '/unknown-route');
        });
    });
});
