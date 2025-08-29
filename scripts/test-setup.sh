#!/bin/bash

# VROOM Testing Setup Script
# This script helps set up and run different testing scenarios

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run mock tests
run_mock_tests() {
    print_status "Running mock-based tests..."
    npm test
    print_success "Mock tests completed successfully"
}

# Function to setup Docker environment
setup_docker() {
    print_status "Setting up Docker environment for VROOM/OSRM..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if OSRM data exists
    if [ ! -f "docker/osrm-data/map.osrm" ]; then
        print_warning "OSRM map data not found. You need to set up map data first."
        echo "See docker/osrm-data/README.md for instructions."
        echo "Would you like to download and process sample data? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            setup_sample_data
        else
            print_error "Cannot proceed without OSRM data. Exiting."
            exit 1
        fi
    fi

    print_status "Starting Docker services..."
    docker-compose up -d

    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 30

    # Check if services are running
    if ! curl -s http://localhost:5000/health >/dev/null; then
        print_warning "OSRM service may not be ready yet. Waiting longer..."
        sleep 30
    fi

    print_success "Docker services are running"
}

# Function to setup sample OSRM data
setup_sample_data() {
    print_status "Setting up sample OSRM data (Massachusetts area)..."
    
    cd docker/osrm-data
    
    # Download sample data
    if [ ! -f "massachusetts-latest.osm.pbf" ]; then
        print_status "Downloading Massachusetts OSM data (~30MB)..."
        wget -q http://download.geofabrik.de/north-america/us/massachusetts-latest.osm.pbf
    fi

    # Process with OSRM
    print_status "Processing OSM data with OSRM (this may take a few minutes)..."
    
    # Extract
    docker run --rm -t -v "${PWD}:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/massachusetts-latest.osm.pbf
    
    # Partition
    docker run --rm -t -v "${PWD}:/data" osrm/osrm-backend osrm-partition /data/massachusetts-latest.osrm
    
    # Customize
    docker run --rm -t -v "${PWD}:/data" osrm/osrm-backend osrm-customize /data/massachusetts-latest.osrm

    # Rename to expected format
    for file in massachusetts-latest.osrm*; do
        mv "$file" "${file/massachusetts-latest/map}"
    done

    cd ../..
    print_success "OSRM data setup completed"
}

# Function to run integration tests
run_integration_tests() {
    print_status "Running integration tests with Docker services..."
    
    # Set environment to use Docker services
    export OSRM_URL=http://localhost:5000
    export VROOM_URL=http://localhost:3000
    
    # Run a simple test to verify services
    print_status "Testing OSRM service..."
    if curl -s "http://localhost:5000/table/v1/driving/13.388860,52.517037;13.385983,52.496891" | grep -q "Ok"; then
        print_success "OSRM service is working"
    else
        print_error "OSRM service test failed"
        return 1
    fi

    print_status "Testing VROOM service..."
    if curl -s -X POST -H "Content-Type: application/json" -d '{"vehicles":[{"id":0,"start":[13.388860,52.517037],"end":[13.388860,52.517037]}],"jobs":[{"id":1,"location":[13.385983,52.496891]}]}' http://localhost:3000 | grep -q "routes"; then
        print_success "VROOM service is working"
    else
        print_error "VROOM service test failed"
        return 1
    fi

    # Run the test suite with integration environment
    npm test
    print_success "Integration tests completed successfully"
}

# Function to stop Docker services
stop_docker() {
    print_status "Stopping Docker services..."
    docker-compose down
    print_success "Docker services stopped"
}

# Function to clean up Docker resources
cleanup_docker() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_success "Docker cleanup completed"
}

# Function to show middleware status
show_status() {
    print_status "Checking middleware status..."
    
    # Check if main app is running
    if curl -s http://localhost:3000/health >/dev/null 2>&1; then
        print_success "Middleware is running on http://localhost:3000"
    else
        print_warning "Middleware is not running. Start with 'npm start'"
    fi

    # Check Docker services
    if command_exists docker && docker-compose ps | grep -q "Up"; then
        print_success "Docker services are running"
        docker-compose ps
    else
        print_warning "Docker services are not running"
    fi
}

# Function to run demo
run_demo() {
    print_status "Running VROOM middleware demo..."
    
    # Start the middleware
    npm start &
    MIDDLEWARE_PID=$!
    
    # Wait for it to start
    sleep 5
    
    # Initialize with sample data
    print_status "Initializing middleware with sample VROOM data..."
    curl -s -X POST -H "Content-Type: application/json" \
        -d @docs/vroom-test.json \
        http://localhost:3000/api/v1/vroom/initialize

    # Test OSRM table endpoint
    print_status "Testing OSRM table endpoint..."
    curl -s "http://localhost:3000/osrm/table/v1/driving/42.355702,-71.056336;42.357,-71.056;42.358,-71.057" | jq .

    # Stop middleware
    kill $MIDDLEWARE_PID
    print_success "Demo completed"
}

# Main menu
show_help() {
    echo "VROOM Testing Setup Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  mock-tests      Run mock-based tests (default, fast)"
    echo "  setup-docker    Set up Docker environment with VROOM/OSRM"
    echo "  integration     Run integration tests with Docker services"
    echo "  stop-docker     Stop Docker services"
    echo "  cleanup         Clean up Docker resources"
    echo "  status          Show current service status"
    echo "  demo            Run a quick demo of the middleware"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 mock-tests           # Quick testing with mocks"
    echo "  $0 setup-docker         # Set up real VROOM/OSRM servers"
    echo "  $0 integration          # Run tests against real servers"
    echo ""
}

# Main script logic
case "${1:-help}" in
    "mock-tests")
        run_mock_tests
        ;;
    "setup-docker")
        setup_docker
        ;;
    "integration")
        run_integration_tests
        ;;
    "stop-docker")
        stop_docker
        ;;
    "cleanup")
        cleanup_docker
        ;;
    "status")
        show_status
        ;;
    "demo")
        run_demo
        ;;
    "help"|*)
        show_help
        ;;
esac