const get = require('lodash.get');
const { AuthenticationError } = require('./errors');

module.exports = {
  isAuthenticated: async (next, source, args, context) => {
    const token = get(context, 'req.headers.authorization', '').replace('Bearer ', '');
    if (!token) {
      throw new Error('You must supply a JWT for authorization!');
    }
    try {
      const { authService } = context;
      const { req } = context;
      req.user = await authService.verify(token);
      return next();
    } catch (e) {
      if (e instanceof AuthenticationError) {
        throw new Error('User not authenticated');
      }
      throw e;
    }
  },
};
