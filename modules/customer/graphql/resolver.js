
const { createCustomer } = require('../validationSchema');

module.exports = {
  Query: {

  },

  Mutation: {
    createCustomer: {
      validationSchema: createCustomer,
      // resolve: (_, { user }, { container }) => container.resolve('authService').register(user),
      resolve: (_, { customer }, { container }) => container.resolve('customerProvider').create(customer),
    },
  },
};
