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
      statements: 95,
      branches: 65,
      functions: 100,
      lines: 95
    }
  }
};
