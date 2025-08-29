const axios = require('axios');

/**
 * OSRM-compatible middleware for VROOM integration
 * This class provides OSRM-compatible endpoints that VROOM can use,
 * while implementing the matrix-backed routing logic described in the requirements
 */
class VroomMiddleware {
  constructor(options = {}) {
    this.options = {
      osrmUrl: options.osrmUrl || 'http://localhost:5000',
      googleApiKey: options.googleApiKey || process.env.GOOGLE_API_KEY,
      enableGoogleCorrections: options.enableGoogleCorrections || false,
      correctionThreshold: options.correctionThreshold || 0.2, // 20% difference threshold
      ...options
    };
    
    // In-memory storage for current VROOM request data
    this.currentVroomData = null;
    this.locationMatrix = new Map(); // Maps GPS coordinates to location IDs
    this.durationMatrix = null;
    this.distanceMatrix = null;
  }

  /**
   * Initialize middleware with VROOM request data
   * This builds the coordinate-to-ID mapping and caches matrices
   */
  initializeFromVroomRequest(vroomRequest) {
    this.currentVroomData = vroomRequest;
    this.buildLocationMatrix(vroomRequest);
    this.cacheDurationMatrix(vroomRequest);
    this.cacheDistanceMatrix(vroomRequest);
  }

  /**
   * Build mapping between GPS coordinates and location IDs
   */
  buildLocationMatrix(vroomRequest) {
    this.locationMatrix.clear();
    
    // Add vehicle start/end locations
    if (vroomRequest.vehicles) {
      vroomRequest.vehicles.forEach(vehicle => {
        if (vehicle.start && vehicle.start_index !== undefined) {
          const key = this.coordsToKey(vehicle.start);
          this.locationMatrix.set(key, vehicle.start_index);
        }
        if (vehicle.end && vehicle.end_index !== undefined) {
          const key = this.coordsToKey(vehicle.end);
          this.locationMatrix.set(key, vehicle.end_index);
        }
      });
    }
    
    // Add job locations
    if (vroomRequest.jobs) {
      vroomRequest.jobs.forEach(job => {
        if (job.location && job.location_index !== undefined) {
          const key = this.coordsToKey(job.location);
          this.locationMatrix.set(key, job.location_index);
        }
      });
    }
    
    // Add shipment pickup/delivery locations
    if (vroomRequest.shipments) {
      vroomRequest.shipments.forEach(shipment => {
        if (shipment.pickup && shipment.pickup.location && shipment.pickup.location_index !== undefined) {
          const key = this.coordsToKey(shipment.pickup.location);
          this.locationMatrix.set(key, shipment.pickup.location_index);
        }
        if (shipment.delivery && shipment.delivery.location && shipment.delivery.location_index !== undefined) {
          const key = this.coordsToKey(shipment.delivery.location);
          this.locationMatrix.set(key, shipment.delivery.location_index);
        }
      });
    }

    // Handle cases where end_index points to a location not explicitly defined
    // This typically happens when end_index references start location for round trips
    if (vroomRequest.vehicles) {
      vroomRequest.vehicles.forEach(vehicle => {
        if (vehicle.end_index !== undefined && vehicle.start_index !== undefined) {
          if (vehicle.end_index === vehicle.start_index && vehicle.start) {
            // End is same as start - no additional mapping needed
            return;
          }
          
          // Check if we have coordinates for the end_index
          const endKey = Array.from(this.locationMatrix.entries())
            .find(([key, index]) => index === vehicle.end_index);
          
          if (!endKey && vehicle.end) {
            // Add end location mapping if coordinates are provided
            const key = this.coordsToKey(vehicle.end);
            this.locationMatrix.set(key, vehicle.end_index);
          }
        }
      });
    }
  }

  /**
   * Cache duration matrix from VROOM request
   */
  cacheDurationMatrix(vroomRequest) {
    if (vroomRequest.matrices && vroomRequest.matrices.car && vroomRequest.matrices.car.durations) {
      this.durationMatrix = vroomRequest.matrices.car.durations;
    } else if (vroomRequest.matrix) {
      // Legacy format support
      this.durationMatrix = vroomRequest.matrix;
    }
  }

  /**
   * Cache distance matrix from VROOM request
   */
  cacheDistanceMatrix(vroomRequest) {
    if (vroomRequest.matrices && vroomRequest.matrices.car && vroomRequest.matrices.car.distances) {
      this.distanceMatrix = vroomRequest.matrices.car.distances;
    } else {
      // Generate mock distances based on durations if not provided
      this.distanceMatrix = this.generateDistancesFromDurations();
    }
  }

  /**
   * Generate distance matrix from duration matrix (rough estimation)
   */
  generateDistancesFromDurations() {
    if (!this.durationMatrix) return null;
    
    return this.durationMatrix.map(row => 
      row.map(duration => Math.floor(duration * 15)) // Assume ~15 m/s average speed
    );
  }

  /**
   * Convert coordinates to a string key for mapping
   */
  coordsToKey(coords, precision = 6) {
    if (!coords || coords.length !== 2) return null;
    return `${coords[0].toFixed(precision)},${coords[1].toFixed(precision)}`;
  }

  /**
   * Parse coordinates from OSRM-style coordinate string
   */
  parseCoordinates(coordString) {
    return coordString.split(';').map(coord => {
      const [lng, lat] = coord.split(',').map(Number);
      return [lng, lat];
    });
  }

  /**
   * Find location index for given coordinates
   */
  findLocationIndex(coords) {
    const key = this.coordsToKey(coords);
    return this.locationMatrix.get(key);
  }

  /**
   * Handle OSRM table request using cached matrix data
   */
  async handleTableRequest(coordinates, sources, destinations) {
    const coords = this.parseCoordinates(coordinates);
    
    // If we don't have cached matrix data, fall back to real OSRM
    if (!this.durationMatrix) {
      return this.fallbackToOsrm('table', coordinates, { sources, destinations });
    }
    
    // Map coordinates to location indices
    const locationIndices = coords.map(coord => this.findLocationIndex(coord));
    
    // Check if all coordinates can be mapped
    if (locationIndices.some(idx => idx === undefined)) {
      console.warn('Some coordinates could not be mapped to location indices, falling back to OSRM');
      return this.fallbackToOsrm('table', coordinates, { sources, destinations });
    }
    
    // Build response from cached matrix
    const response = this.buildTableResponse(coords, locationIndices, sources, destinations);
    return response;
  }

  /**
   * Build OSRM-compatible table response from cached matrix data
   */
  buildTableResponse(coords, locationIndices, sources, destinations) {
    const sourceIndices = sources ? sources.split(';').map(Number) : locationIndices.map((_, i) => i);
    const destIndices = destinations ? destinations.split(';').map(Number) : locationIndices.map((_, i) => i);
    
    const durations = sourceIndices.map(srcIdx => 
      destIndices.map(destIdx => {
        const srcLocationIdx = locationIndices[srcIdx];
        const destLocationIdx = locationIndices[destIdx];
        return this.durationMatrix[srcLocationIdx][destLocationIdx];
      })
    );
    
    const distances = sourceIndices.map(srcIdx => 
      destIndices.map(destIdx => {
        const srcLocationIdx = locationIndices[srcIdx];
        const destLocationIdx = locationIndices[destIdx];
        return this.distanceMatrix ? this.distanceMatrix[srcLocationIdx][destLocationIdx] : durations[srcIdx - sourceIndices[0]][destIdx - destIndices[0]] * 15;
      })
    );
    
    return {
      code: 'Ok',
      durations,
      distances,
      sources: sourceIndices.map(idx => ({
        hint: `cached_${idx}`,
        distance: 0,
        location: coords[idx],
        name: ''
      })),
      destinations: destIndices.map(idx => ({
        hint: `cached_${idx}`,
        distance: 0,
        location: coords[idx],
        name: ''
      }))
    };
  }

  /**
   * Fallback to real OSRM when cached data is not available
   */
  async fallbackToOsrm(endpoint, coordinates, params = {}) {
    try {
      const url = `${this.options.osrmUrl}/${endpoint}/v1/driving/${coordinates}`;
      const queryParams = new URLSearchParams(params).toString();
      const fullUrl = queryParams ? `${url}?${queryParams}` : url;
      
      const response = await axios.get(fullUrl);
      return response.data;
    } catch (error) {
      console.error('OSRM fallback failed:', error.message);
      throw error;
    }
  }

  /**
   * Handle Google Maps API corrections (future implementation)
   */
  async applyGoogleCorrections(routes) {
    if (!this.options.enableGoogleCorrections || !this.options.googleApiKey) {
      return routes;
    }
    
    // TODO: Implement Google Maps API corrections
    // This would iterate through route legs, query Google Directions API,
    // compare durations, and update the matrix if discrepancies are found
    console.log('Google corrections not yet implemented');
    return routes;
  }

  /**
   * Reset middleware state
   */
  reset() {
    this.currentVroomData = null;
    this.locationMatrix.clear();
    this.durationMatrix = null;
    this.distanceMatrix = null;
  }
}

module.exports = VroomMiddleware;