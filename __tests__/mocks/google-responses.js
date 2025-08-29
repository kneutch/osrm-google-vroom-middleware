// Mock Google Maps API responses for testing
module.exports = {
  // Distance Matrix API response
  distanceMatrixResponse: {
    destination_addresses: [
      'Boston, MA, USA',
      'Cambridge, MA, USA',
      'Somerville, MA, USA',
      'Boston, MA, USA'
    ],
    origin_addresses: [
      'Boston, MA, USA',
      'Cambridge, MA, USA',
      'Somerville, MA, USA',
      'Boston, MA, USA'
    ],
    rows: [
      {
        elements: [
          {
            distance: { text: '0 m', value: 0 },
            duration: { text: '0 mins', value: 0 },
            duration_in_traffic: { text: '0 mins', value: 0 },
            status: 'OK'
          },
          {
            distance: { text: '5.4 km', value: 5420 },
            duration: { text: '35 mins', value: 2104 },
            duration_in_traffic: { text: '42 mins', value: 2520 },
            status: 'OK'
          },
          {
            distance: { text: '0.7 km', value: 680 },
            duration: { text: '3 mins', value: 197 },
            duration_in_traffic: { text: '5 mins', value: 315 },
            status: 'OK'
          },
          {
            distance: { text: '3.2 km', value: 3180 },
            duration: { text: '22 mins', value: 1299 },
            duration_in_traffic: { text: '28 mins', value: 1680 },
            status: 'OK'
          }
        ]
      }
    ],
    status: 'OK'
  },

  // Directions API response
  directionsResponse: {
    geocoded_waypoints: [
      {
        geocoder_status: 'OK',
        place_id: 'ChIJGVtI4by3t4kRr51d_Qm_x58',
        types: ['establishment', 'point_of_interest']
      },
      {
        geocoder_status: 'OK',
        place_id: 'ChIJrTLr-GyuEmsRBfy61i59si0',
        types: ['establishment', 'point_of_interest']
      }
    ],
    routes: [
      {
        bounds: {
          northeast: { lat: 42.3612, lng: -71.0542 },
          southwest: { lat: 42.3547, lng: -71.0578 }
        },
        copyrights: 'Map data ©2024 Google',
        legs: [
          {
            distance: { text: '2.5 km', value: 2500 },
            duration: { text: '10 mins', value: 600 },
            duration_in_traffic: { text: '12 mins', value: 720 },
            end_address: 'Cambridge, MA, USA',
            end_location: { lat: 42.3612, lng: -71.0542 },
            start_address: 'Boston, MA, USA',
            start_location: { lat: 42.3547, lng: -71.0578 },
            steps: [
              {
                distance: { text: '0.1 km', value: 133 },
                duration: { text: '1 min', value: 15 },
                end_location: { lat: 42.3548, lng: -71.0576 },
                html_instructions: 'Head <b>northeast</b> on <b>Main St</b>',
                polyline: { points: 'gfp_I~ps|OlBuM' },
                start_location: { lat: 42.3547, lng: -71.0578 },
                travel_mode: 'DRIVING'
              }
            ],
            traffic_speed_entry: [],
            via_waypoint: []
          }
        ],
        overview_polyline: { points: 'gfp_I~ps|OlBuMdEaVfFq^~EcVlTaB?C' },
        summary: 'Main St',
        warnings: [],
        waypoint_order: []
      }
    ],
    status: 'OK'
  },

  // Error responses for Google APIs
  errorResponses: {
    overQueryLimit: {
      error_message: 'You have exceeded your daily request quota for this API.',
      status: 'OVER_QUERY_LIMIT'
    },
    invalidRequest: {
      error_message: 'Invalid request. Missing required parameters.',
      status: 'INVALID_REQUEST'
    },
    requestDenied: {
      error_message: 'The provided API key is invalid.',
      status: 'REQUEST_DENIED'
    },
    unknownError: {
      error_message: 'Unknown error occurred.',
      status: 'UNKNOWN_ERROR'
    },
    zeroResults: {
      status: 'ZERO_RESULTS'
    }
  },

  // Simple responses for basic testing
  simpleDistanceMatrix: {
    destination_addresses: ['Berlin, Germany', 'Hamburg, Germany'],
    origin_addresses: ['Berlin, Germany', 'Hamburg, Germany'],
    rows: [
      {
        elements: [
          {
            distance: { text: '0 m', value: 0 },
            duration: { text: '0 mins', value: 0 },
            duration_in_traffic: { text: '0 mins', value: 0 },
            status: 'OK'
          },
          {
            distance: { text: '2.5 km', value: 2500 },
            duration: { text: '10 mins', value: 600 },
            duration_in_traffic: { text: '15 mins', value: 900 },
            status: 'OK'
          }
        ]
      },
      {
        elements: [
          {
            distance: { text: '2.6 km', value: 2600 },
            duration: { text: '11 mins', value: 650 },
            duration_in_traffic: { text: '16 mins', value: 950 },
            status: 'OK'
          },
          {
            distance: { text: '0 m', value: 0 },
            duration: { text: '0 mins', value: 0 },
            duration_in_traffic: { text: '0 mins', value: 0 },
            status: 'OK'
          }
        ]
      }
    ],
    status: 'OK'
  }
};