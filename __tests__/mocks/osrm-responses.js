// Mock OSRM responses for testing the middleware's OSRM-compatible endpoints
module.exports = {
  // Mock response for OSRM table endpoint
  tableResponse: {
    code: 'Ok',
    durations: [
      [0, 2104, 197, 1299],
      [2103, 0, 2255, 3152],
      [197, 2256, 0, 1102],
      [1299, 3153, 1102, 0]
    ],
    distances: [
      [0, 5420, 680, 3180],
      [5410, 0, 5780, 8230],
      [680, 5790, 0, 2690],
      [3180, 8240, 2690, 0]
    ],
    sources: [
      {
        hint: 'abc123',
        distance: 0,
        location: [42.35570180784958, -71.05633638012095],
        name: ''
      },
      {
        hint: 'def456',
        distance: 0,
        location: [42.357, -71.056],
        name: ''
      },
      {
        hint: 'ghi789',
        distance: 0,
        location: [42.358, -71.057],
        name: ''
      },
      {
        hint: 'jkl012',
        distance: 0,
        location: [42.359, -71.058],
        name: ''
      }
    ],
    destinations: [
      {
        hint: 'abc123',
        distance: 0,
        location: [42.35570180784958, -71.05633638012095],
        name: ''
      },
      {
        hint: 'def456',
        distance: 0,
        location: [42.357, -71.056],
        name: ''
      },
      {
        hint: 'ghi789',
        distance: 0,
        location: [42.358, -71.057],
        name: ''
      },
      {
        hint: 'jkl012',
        distance: 0,
        location: [42.359, -71.058],
        name: ''
      }
    ]
  },

  // Simple table response for basic testing
  simpleTableResponse: {
    code: 'Ok',
    durations: [
      [0, 600],
      [650, 0]
    ],
    distances: [
      [0, 2500],
      [2600, 0]
    ],
    sources: [
      {
        hint: 'simple1',
        distance: 0,
        location: [13.388860, 52.517037],
        name: ''
      },
      {
        hint: 'simple2',
        distance: 0,
        location: [13.385983, 52.496891],
        name: ''
      }
    ],
    destinations: [
      {
        hint: 'simple1',
        distance: 0,
        location: [13.388860, 52.517037],
        name: ''
      },
      {
        hint: 'simple2',
        distance: 0,
        location: [13.385983, 52.496891],
        name: ''
      }
    ]
  },

  // Route response for testing route endpoint
  routeResponse: {
    code: 'Ok',
    routes: [
      {
        geometry: 'gfp_I~ps|OlBuMdEaVfFq^~EcVlTaB?C',
        legs: [
          {
            steps: [
              {
                geometry: 'gfp_I~ps|Ol@{G',
                maneuver: {
                  bearing_after: 356,
                  bearing_before: 0,
                  location: [13.388860, 52.517037],
                  modifier: 'straight',
                  type: 'depart'
                },
                mode: 'driving',
                driving_side: 'right',
                name: 'Friedrichstraße',
                intersections: [
                  {
                    out: 0,
                    entry: [true],
                    bearings: [356],
                    location: [13.388860, 52.517037]
                  }
                ],
                weight: 15.3,
                duration: 15.3,
                distance: 132.8
              }
            ],
            summary: 'Friedrichstraße',
            weight: 600.2,
            duration: 600,
            distance: 2500
          }
        ],
        weight_name: 'routability',
        weight: 600.2,
        duration: 600,
        distance: 2500
      }
    ],
    waypoints: [
      {
        hint: 'abc123',
        distance: 0,
        name: 'Friedrichstraße',
        location: [13.388860, 52.517037]
      },
      {
        hint: 'def456',
        distance: 0,
        name: 'Unter den Linden',
        location: [13.385983, 52.496891]
      }
    ]
  },

  // Error responses for testing error handling
  errorResponses: {
    invalidInput: {
      code: 'InvalidInput',
      message: 'Query string malformed close to position 42'
    },
    noRoute: {
      code: 'NoRoute',
      message: 'No route found between points'
    },
    invalidCoordinate: {
      code: 'InvalidInput',
      message: 'Invalid coordinate value'
    }
  }
};