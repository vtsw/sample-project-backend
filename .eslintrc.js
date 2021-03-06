module.exports = { 
  extends: 'airbnb-base',
  env: {
    es6: true,
    node: true
  },
  rules:{
    'linebreak-style': 0,
    'no-underscore-dangle': ["error", { "allow": ["_id"] }], // allow MongoDb ObjectId
    'max-len': ["error", { "code": 150 }],
    'no-tabs': 0
  },
  plugins: [
    'graphql', 'jest'
  ],
  globals: {
    "it": "readonly",
    "describe": "readonly",
    "test": "readonly",
    "expect": "readonly",
    "jest": "readonly",
    "beforeEach": "readonly",
    "afterEach": "readonly",
    "beforeAll": "readonly",
    "afterAll": "readonly",
  }
};