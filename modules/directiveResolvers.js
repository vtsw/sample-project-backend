const get = require('lodash.get');
const { AuthenticationError } = require('./errors');

module.exports = {
  isAuthenticated: async (next, source, args, { container, req }) => {
    const token = get(req, 'headers.authorization', '').replace('Bearer ', '');
    if (!token) {
      throw new Error('You must supply a JWT for authorization!');
    }
    try {
      req.user = await container.resolve('authService').verify(token);

      return next();
    } catch (e) {
      if (e instanceof AuthenticationError) {
        throw new Error('User not authenticated');
      }
      throw e;
    }
  },
};
