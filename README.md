# OSRM Google VROOM Middleware

A Node.js middleware service that provides OSRM-compatible endpoints for VROOM integration with matrix-backed routing and optional Google Maps API corrections.

## Features

- **OSRM-compatible API**: Exposes endpoints that VROOM can use as a routing backend
- **Matrix-backed routing**: Uses cached distance/duration matrices for fast responses
- **Coordinate mapping**: Maps GPS coordinates to location IDs with configurable precision
- **Fallback support**: Falls back to real OSRM when cached data is unavailable
- **Google API integration**: Optional traffic-aware corrections using Google Maps API
- **Comprehensive testing**: Mock-based and Docker integration testing strategies

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Tests (Mock-based)
```bash
npm test
```

### 3. Start the Middleware
```bash
npm start
```

The middleware will be available at `http://localhost:3000`

## Testing Strategies

This project implements two complementary testing approaches:

### Mock-Based Testing (Default)
- **Fast execution** with no external dependencies
- **Deterministic results** for CI/CD pipelines
- **Comprehensive coverage** of middleware functionality

```bash
npm test                    # Run all tests
npm run test:mock          # Test mock servers
npm run test:middleware    # Test middleware logic
npm run test:watch         # Watch mode for development
```

### Docker Integration Testing (Optional)
- **Real VROOM and OSRM servers** for realistic testing
- **Network communication validation**
- **Production-like environment**

```bash
./scripts/test-setup.sh setup-docker    # Set up Docker services
./scripts/test-setup.sh integration     # Run integration tests
./scripts/test-setup.sh stop-docker     # Stop services
```

For detailed testing documentation, see [docs/TESTING-STRATEGY.md](docs/TESTING-STRATEGY.md).

## API Endpoints

### Middleware Management
- `POST /api/v1/vroom/initialize` - Initialize with VROOM request data
- `POST /api/v1/vroom/reset` - Reset middleware state
- `GET /health` - Health check
- `GET /api/v1/status` - Service status

### OSRM-Compatible Endpoints (for VROOM)
- `GET /osrm/table/v1/driving/:coordinates` - Distance/duration matrix
- `GET /osrm/table/v1/:profile/:coordinates` - Profile-specific matrix

### Example Usage

1. **Initialize the middleware** with your VROOM request:
```bash
curl -X POST -H "Content-Type: application/json" \
  -d @docs/vroom-test.json \
  http://localhost:3000/api/v1/vroom/initialize
```

2. **Configure VROOM** to use the middleware:
```bash
vroom --router http://localhost:3000/osrm
```

3. **Send VROOM requests** normally - the middleware will intercept OSRM calls and use cached matrix data.

## Configuration

Set environment variables to configure the middleware:

```bash
# Server configuration
PORT=3000
NODE_ENV=development

# External service URLs
OSRM_URL=http://localhost:5000        # Fallback OSRM server
VROOM_URL=http://localhost:3001       # VROOM server (for testing)

# Google Maps API (optional)
GOOGLE_API_KEY=your_api_key
ENABLE_GOOGLE_CORRECTIONS=true

# Middleware behavior
CORRECTION_THRESHOLD=0.2              # 20% difference threshold
```

## Docker Setup

For integration testing with real VROOM and OSRM servers:

### 1. Set up OSRM data:
```bash
# Download sample data
wget http://download.geofabrik.de/north-america/us/massachusetts-latest.osm.pbf

# Process with OSRM
docker run --rm -v "${PWD}:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/massachusetts-latest.osm.pbf
docker run --rm -v "${PWD}:/data" osrm/osrm-backend osrm-partition /data/massachusetts-latest.osrm
docker run --rm -v "${PWD}:/data" osrm/osrm-backend osrm-customize /data/massachusetts-latest.osrm

# Place processed files in docker/osrm-data/ (see README there for details)
```

### 2. Start services:
```bash
docker-compose up -d
```

### 3. Test integration:
```bash
./scripts/test-setup.sh integration
```

## Development

### Running Tests
```bash
npm run test:watch         # Watch mode
npm run test:mock          # Mock servers only
npm run test:middleware    # Middleware functionality
```

### Code Quality
```bash
npm run lint               # Check code style
npm run lint:fix           # Fix auto-fixable issues
```

### Debugging
```bash
npm run debug              # Start with debugger
npm run dev                # Development mode with auto-reload
```

## Architecture

The middleware implements the workflow described in [docs/Project requirements.md](docs/Project%20requirements.md):

1. **OSRM Proxy**: Exposes OSRM-compatible endpoints for VROOM
2. **Matrix Mapping**: Maps GPS coordinates to location IDs
3. **Cached Responses**: Uses pre-computed matrices for fast responses
4. **Fallback Logic**: Falls back to real OSRM when needed
5. **Google Corrections**: Optional traffic-aware improvements

## Testing Features

### Mock Servers
- **Mock VROOM Server**: Simulates VROOM API responses
- **Mock OSRM Server**: Provides OSRM-compatible routing
- **Mock Google APIs**: Simulates Google Maps responses

### Test Data
- **Sample VROOM requests**: Based on real-world scenarios
- **Matrix data**: Pre-computed distance/duration matrices
- **Coordinate mappings**: GPS to location ID correlations

### Integration Testing
- **Docker Compose**: Real VROOM and OSRM services
- **Automated setup**: Sample data preparation
- **Service validation**: Health checks and API tests

## Contributing

1. **Use mock tests** for fast development feedback
2. **Test integration scenarios** when adding new features
3. **Follow the existing code style** (ESLint configuration)
4. **Update tests** when modifying functionality
5. **Document changes** in the appropriate README files

## License

MIT