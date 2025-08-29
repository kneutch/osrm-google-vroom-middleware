module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  testPathIgnorePatterns: [
    '__tests__/mocks/'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
