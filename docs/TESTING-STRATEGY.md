# VROOM Server Testing Strategy

This document outlines the testing strategies implemented for the OSRM-Google-VROOM middleware project.

## Overview

The middleware provides OSRM-compatible endpoints that VROOM can use, implementing matrix-backed routing logic with optional Google Maps API corrections. To enable comprehensive testing without requiring external dependencies, we've implemented both mock-based and integration testing approaches.

## Testing Approaches

### 1. Mock-Based Testing (Default)

**Purpose**: Fast, reliable testing without external dependencies
**Location**: `__tests__/mocks/`
**Usage**: Default for CI/CD and development

#### Components:
- **Mock VROOM Server** (`mock-vroom-server.js`): Simulates VROOM API responses
- **Mock OSRM Server** (`mock-osrm-server.js`): Simulates OSRM routing backend  
- **Mock Google APIs** (`google-responses.js`): Simulates Google Maps API responses
- **Test Data** (`vroom-requests.js`, `vroom-responses.js`, `osrm-responses.js`): Structured test data

#### Advantages:
- Fast execution (no network calls)
- Deterministic results
- No external service dependencies
- Works in offline environments
- Ideal for CI/CD pipelines

#### Running Mock Tests:
```bash
npm test                    # Run all tests with mocks
npm test mock-servers      # Test just the mock servers
npm test middleware        # Test middleware functionality
```

### 2. Integration Testing with Docker (Optional)

**Purpose**: Realistic testing with actual VROOM and OSRM servers
**Location**: `docker-compose.yml`
**Usage**: Optional for integration validation

#### Components:
- **VROOM Server**: Real VROOM instance running in Docker
- **OSRM Backend**: Real OSRM routing engine with map data
- **Network Configuration**: Docker networking for service communication

#### Setup:
```bash
# 1. Set up OSRM data (see docker/osrm-data/README.md)
wget http://download.geofabrik.de/north-america/us/massachusetts-latest.osm.pbf
# Process with OSRM (see README for details)

# 2. Start services
docker-compose up -d

# 3. Run integration tests
npm run test:integration  # (not yet implemented)
```

#### Advantages:
- Tests real VROOM behavior
- Validates actual routing results
- Tests network communication
- Closest to production environment

#### Disadvantages:
- Slower execution
- Requires Docker setup
- Needs map data preparation
- More complex debugging

## Test Categories

### 1. Unit Tests (`__tests__/app.test.js`)
- Basic API endpoint functionality
- Health checks and status endpoints
- Error handling

### 2. Mock Server Tests (`__tests__/mock-servers.test.js`)
- Validates mock VROOM server responses
- Tests mock OSRM endpoint behavior
- Ensures mock data structure validity

### 3. Middleware Tests (`__tests__/middleware.test.js`)
- OSRM table endpoint with matrix caching
- Coordinate to location index mapping
- Sources/destinations parameter handling
- Fallback to real OSRM when needed
- Error handling and resilience

## Test Data Structure

### VROOM Request Data
```javascript
{
  vehicles: [{ id, start, end, start_index, end_index }],
  jobs: [{ id, location, location_index }],
  matrices: {
    car: {
      durations: [[duration_matrix]],
      distances: [[distance_matrix]]
    }
  }
}
```

### OSRM Response Data
```javascript
{
  code: 'Ok',
  durations: [[matrix]],
  distances: [[matrix]], 
  sources: [{ location, hint }],
  destinations: [{ location, hint }]
}
```

## Environment Configuration

Control testing behavior via environment variables:

```bash
# Use mock servers (default)
VROOM_URL=http://localhost:3001  # Mock VROOM
OSRM_URL=http://localhost:5000   # Mock OSRM

# Use real Docker services
VROOM_URL=http://localhost:3000  # Real VROOM
OSRM_URL=http://localhost:5000   # Real OSRM

# Google API configuration
GOOGLE_API_KEY=your_api_key
ENABLE_GOOGLE_CORRECTIONS=true
```

## Test Execution

### Development Workflow
```bash
# Quick feedback loop with mocks
npm test

# Test specific functionality  
npm test -- --testNamePattern="coordinate mapping"
npm test -- __tests__/middleware.test.js

# Watch mode for development
npm test -- --watch
```

### CI/CD Pipeline
```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Run all tests (uses mocks by default)
npm test

# Optional: integration tests (if Docker available)
docker-compose up -d
npm run test:integration
docker-compose down
```

## Adding New Tests

### For New Middleware Features:
1. Add mock data to `__tests__/mocks/`
2. Create test cases in `__tests__/middleware.test.js`
3. Ensure both success and error scenarios

### For New API Endpoints:
1. Add endpoint tests to `__tests__/app.test.js`
2. Create corresponding mock responses
3. Test parameter validation and error handling

### For Integration Scenarios:
1. Add Docker service configuration
2. Create integration test suite
3. Document setup requirements

## Best Practices

1. **Mock First**: Start with mock-based tests for fast feedback
2. **Realistic Data**: Use data structures matching real VROOM/OSRM APIs
3. **Error Scenarios**: Test both success and failure cases
4. **Isolation**: Each test should be independent and repeatable
5. **Documentation**: Keep test documentation up-to-date

## Troubleshooting

### Common Issues:

**Tests fail with connection errors:**
- Ensure mock servers are properly started/stopped
- Check port conflicts (3001 for VROOM mock, 5000 for OSRM mock)

**Coordinate mapping failures:**
- Verify test coordinates match the location matrix
- Check coordinate precision (default 6 decimal places)

**Matrix dimension mismatches:**
- Ensure test data matrices match coordinate counts
- Verify sources/destinations parameter handling

**Docker services won't start:**
- Check Docker is running and has sufficient resources
- Verify OSRM data is properly processed and placed
- Check network port availability

## Future Enhancements

1. **Performance Testing**: Add load testing scenarios
2. **Google API Integration**: Complete Google Maps correction testing
3. **Automated Integration**: Automatically set up test data for Docker
4. **Benchmark Comparison**: Compare mock vs real performance
5. **Visual Testing**: Add route visualization for debugging