
const { createCustomer } = require('../validationSchema');

module.exports = {
  Query: {

  },

  Mutation: {
    createZaloOA: {
      validationSchema: createCustomer,
      resolve: (_, { zaloOA }, { container }) => container.resolve('zaloOAProvider').create(zaloOA),
    },
  },
};
