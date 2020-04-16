
const { createCleverZaloBinding } = require('../validationSchema');

module.exports = {
  Query: {
    cleverZB: (() => 'Clever zalo binding')
  },

  Mutation: {
    createCleverZaloBinding: {
      validationSchema: createCleverZaloBinding,
      resolve: (_, { cleverZaloBinding }, { container }) => container.resolve('cleverZaloBindingProvider').create(cleverZaloBinding),
    }
  },
};
