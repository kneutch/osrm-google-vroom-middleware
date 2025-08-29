# OSRM Google VROOM Middleware

A Node.js middleware service for integrating OSRM (Open Source Routing Machine), Google Maps API, and VROOM (Vehicle Routing Open-source Optimization Machine) for advanced routing and optimization solutions.

## Features

- **OSRM Integration**: Open-source routing engine
- **Google Maps API**: Commercial routing and geocoding services
- **VROOM Integration**: Vehicle routing optimization
- **Express.js API**: RESTful endpoints for routing and optimization
- **Development Ready**: VS Code debugging configuration included

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd osrm-google-vroom-middleware

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your API keys and configuration
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run with debugging
npm run debug
```

### VS Code Debugging

This project is configured for VS Code debugging:

1. **Launch Node.js App**: Starts the application with debugging enabled
2. **Attach to Running Node.js**: Attach to a running Node.js process
3. **Debug Tests**: Run Jest tests with debugging

To debug:
1. Open VS Code
2. Go to Run and Debug (Ctrl+Shift+D)
3. Select "Launch Node.js App" from the dropdown
4. Press F5 or click the green play button

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### API Status
- `GET /api/v1/status` - Service information

### Routing
- `POST /api/v1/route/osrm` - OSRM routing
- `POST /api/v1/route/google` - Google Maps routing

### Optimization
- `POST /api/v1/optimize/vroom` - VROOM vehicle routing optimization

## Configuration

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=development
PORT=3000
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
OSRM_SERVER_URL=http://localhost:5000
VROOM_SERVER_URL=http://localhost:3001
LOG_LEVEL=info
CORS_ORIGIN=*
```

## Project Structure

```
.
├── src/
│   └── index.js          # Main application file
├── __tests__/
│   └── app.test.js       # Test files
├── .vscode/
│   ├── launch.json       # VS Code debug configuration
│   ├── tasks.json        # VS Code tasks
│   ├── settings.json     # VS Code settings
│   └── extensions.json   # Recommended extensions
├── package.json          # Dependencies and scripts
├── jest.config.js        # Jest test configuration
├── .eslintrc.js         # ESLint configuration
└── .env.example         # Environment variables template
```

## VS Code Extensions

This project recommends the following VS Code extensions:
- ESLint
- Prettier
- Jest
- Path Intellisense
- Auto Rename Tag

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## License

MIT