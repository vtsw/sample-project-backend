
const { createCleverZaloBinding } = require('../validationSchema');

module.exports = {
  Query: {

  },

  Mutation: {
    createCleverZaloBinding: {
      validationSchema: createCleverZaloBinding,
      // resolve: (_, { user }, { container }) => container.resolve('authService').register(user),
      resolve: (_, { clerverZB }, { container }) => container.resolve('clerverZaloBindingProvider').create(clerverZB),
    }
  },
};
