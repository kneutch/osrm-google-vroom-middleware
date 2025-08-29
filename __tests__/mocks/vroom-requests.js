// Mock VROOM requests for testing
module.exports = {
  // Sample request based on docs/vroom-test.json but with added location coordinates
  sampleVroomRequest: {
    vehicles: [
      {
        id: 0,
        start_index: 0,
        end_index: 0, // Make it a round trip to the same location
        start: [42.35570180784958, -71.05633638012095],
        end: [42.35570180784958, -71.05633638012095],
        time_window: [1756558242, 1756587042]
      }
    ],
    jobs: [
      {
        id: 1414,
        location_index: 1,
        location: [42.357, -71.056], // Added coordinate for location_index 1
        time_window: [1756561842, 1756563642]
      },
      {
        id: 1515,
        location_index: 2,
        location: [42.358, -71.057], // Added coordinate for location_index 2
        time_window: [1756563842, 1756565642]
      }
    ],
    matrices: {
      car: {
        durations: [
          [0, 2104, 197],
          [2103, 0, 2255],
          [197, 2256, 0]
        ]
      }
    }
  },

  // Additional test cases
  simpleVroomRequest: {
    vehicles: [
      {
        id: 0,
        start: [13.388860, 52.517037],
        end: [13.388860, 52.517037]
      }
    ],
    jobs: [
      {
        id: 1,
        location: [13.385983, 52.496891]
      },
      {
        id: 2,
        location: [13.394421, 52.512802]
      }
    ]
  },

  // Complex scenario with multiple vehicles and jobs
  complexVroomRequest: {
    vehicles: [
      {
        id: 1,
        start: [13.388860, 52.517037],
        end: [13.388860, 52.517037],
        capacity: [10, 100],
        time_window: [28800, 64800]
      },
      {
        id: 2,
        start: [13.385983, 52.496891],
        end: [13.385983, 52.496891],
        capacity: [15, 150],
        time_window: [32400, 68400]
      }
    ],
    jobs: [
      {
        id: 101,
        location: [13.394421, 52.512802],
        delivery: [1, 10],
        time_windows: [[32400, 36000]]
      },
      {
        id: 102,
        location: [13.380776, 52.508523],
        delivery: [2, 20],
        time_windows: [[36000, 39600]]
      },
      {
        id: 103,
        location: [13.397953, 52.520325],
        delivery: [1, 15],
        time_windows: [[39600, 43200]]
      }
    ]
  }
};