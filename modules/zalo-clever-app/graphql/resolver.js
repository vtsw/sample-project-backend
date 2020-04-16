
const { createZaloCleverApp } = require('../validationSchema');

module.exports = {
  Query: {
  
  },

  Mutation: {
    createCustomer: {
      // validationSchema: createCustomer,
      // resolve: (_, { user }, { container }) => container.resolve('authService').register(user),
      resolve: (_, { zaloCleverApp }, { container }) => container.resolve('zaloCleverAppProvider').create(zaloCleverApp),
    }
  },
};
