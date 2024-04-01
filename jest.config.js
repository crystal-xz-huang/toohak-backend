module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  maxWorkers: 1,

  transform: {
    '^.+\\.(ts|tsx|js)$': 'ts-jest' 
  },

  testMatch: ['**/tests/**/*.test.(ts)'], // only run tests in the tests folder
  testPathIgnorePatterns: ['newecho.test.ts'],
};
