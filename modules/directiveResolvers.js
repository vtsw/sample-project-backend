const get = require('lodash.get');

module.exports = {
  isAuthenticated: async (next, source, args, context) => {
    const token = get(context, 'req.headers.authorization', '').replace('Bearer ', '');
    if (!token) {
      throw new Error('You must supply a JWT for authorization!');
    }
    try {
      const { authenService } = context;
      const { req } = context;
      const user = await authenService.verify(token);
      if (!user) {
        throw new Error('User not authenticated');
      }
      req.user = user;
      return next();
    } catch (err) {
      throw new Error('You are not authorized.');
    }
  },
};
