module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testPathIgnorePatterns: ['/node_modules', '/test/'],
  testEnvironment: './test/GanacheEnvironment.js',
  collectCoverageFrom: ['src/**/*.js', '!src/setupJest.js'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
