module.exports = {
  preset: '@shelf/jest-mongodb',
  testRegex: './tests/.*.js$',
  globals: {
    __DEV__: true,
  },
  testPathIgnorePatterns: [
    './tests/int/client.js',
  ],
};
