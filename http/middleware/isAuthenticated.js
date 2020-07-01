const get = require('lodash.get');
const { AuthenticationError } = require('../../modules/errors');

const isAuthenticated = async (req, res, next) => {
  const token = get(req, 'headers.authorization', '').replace('Bearer ', '');
  if (!token) {
    res.send('You must supply a JWT for authorization!');
    return;
  }
  try {
    const authService = req.container.resolve('authService');
    const decodedUserClaims = await authService.verify(token);
    req.user = decodedUserClaims;
    next();
  } catch (e) {
    if (e instanceof AuthenticationError) {
      res.send('User not authenticated');
    }
    throw e;
  }
};

module.exports = isAuthenticated;
