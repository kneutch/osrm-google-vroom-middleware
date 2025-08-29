// Mock VROOM responses for testing
module.exports = {
  // Response for the sample request
  sampleVroomResponse: {
    code: 0,
    summary: {
      cost: 3399,
      routes: 1,
      unassigned: 0,
      setup: 0,
      service: 0,
      duration: 3399,
      waiting_time: 0,
      priority: 0,
      delivery: [],
      pickup: []
    },
    unassigned: [],
    routes: [
      {
        vehicle: 0,
        cost: 3399,
        setup: 0,
        service: 0,
        duration: 3399,
        waiting_time: 0,
        priority: 0,
        delivery: [],
        pickup: [],
        steps: [
          {
            type: 'start',
            location: [42.35570180784958, -71.05633638012095],
            arrival: 1756558242,
            duration: 0,
            setup: 0,
            service: 0,
            waiting_time: 0
          },
          {
            type: 'job',
            id: 1414,
            location_index: 1,
            arrival: 1756560346,
            duration: 2104,
            setup: 0,
            service: 0,
            waiting_time: 1496
          },
          {
            type: 'job',
            id: 1515,
            location_index: 2,
            arrival: 1756562601,
            duration: 2359,
            setup: 0,
            service: 0,
            waiting_time: 1241
          },
          {
            type: 'end',
            location: [42.35570180784958, -71.05633638012095],
            arrival: 1756559641,
            duration: 3399,
            setup: 0,
            service: 0,
            waiting_time: 0
          }
        ]
      }
    ]
  },

  // Simple response for basic testing
  simpleVroomResponse: {
    code: 0,
    summary: {
      cost: 1200,
      routes: 1,
      unassigned: 0,
      setup: 0,
      service: 0,
      duration: 1200,
      waiting_time: 0,
      priority: 0,
      delivery: [],
      pickup: []
    },
    unassigned: [],
    routes: [
      {
        vehicle: 0,
        cost: 1200,
        setup: 0,
        service: 0,
        duration: 1200,
        waiting_time: 0,
        priority: 0,
        delivery: [],
        pickup: [],
        steps: [
          {
            type: 'start',
            location: [13.388860, 52.517037],
            arrival: 0,
            duration: 0,
            setup: 0,
            service: 0,
            waiting_time: 0
          },
          {
            type: 'job',
            id: 1,
            location: [13.385983, 52.496891],
            arrival: 600,
            duration: 600,
            setup: 0,
            service: 0,
            waiting_time: 0
          },
          {
            type: 'job',
            id: 2,
            location: [13.394421, 52.512802],
            arrival: 1000,
            duration: 1000,
            setup: 0,
            service: 0,
            waiting_time: 0
          },
          {
            type: 'end',
            location: [13.388860, 52.517037],
            arrival: 1200,
            duration: 1200,
            setup: 0,
            service: 0,
            waiting_time: 0
          }
        ]
      }
    ]
  },

  // Error response for testing error handling
  errorVroomResponse: {
    code: 2,
    error: 'Input error: Invalid vehicle configuration'
  },

  // Response with unassigned jobs
  partialVroomResponse: {
    code: 0,
    summary: {
      cost: 800,
      routes: 1,
      unassigned: 1,
      setup: 0,
      service: 0,
      duration: 800,
      waiting_time: 0,
      priority: 0,
      delivery: [1, 10],
      pickup: []
    },
    unassigned: [
      {
        id: 103,
        type: 'job',
        location: [13.397953, 52.520325]
      }
    ],
    routes: [
      {
        vehicle: 1,
        cost: 800,
        setup: 0,
        service: 0,
        duration: 800,
        waiting_time: 0,
        priority: 0,
        delivery: [3, 30],
        pickup: [],
        steps: [
          {
            type: 'start',
            location: [13.388860, 52.517037],
            arrival: 28800,
            duration: 0,
            setup: 0,
            service: 0,
            waiting_time: 0
          },
          {
            type: 'job',
            id: 101,
            location: [13.394421, 52.512802],
            arrival: 29200,
            duration: 400,
            setup: 0,
            service: 0,
            waiting_time: 3200
          },
          {
            type: 'job',
            id: 102,
            location: [13.380776, 52.508523],
            arrival: 29600,
            duration: 800,
            setup: 0,
            service: 0,
            waiting_time: 6400
          },
          {
            type: 'end',
            location: [13.388860, 52.517037],
            arrival: 29600,
            duration: 800,
            setup: 0,
            service: 0,
            waiting_time: 0
          }
        ]
      }
    ]
  }
};