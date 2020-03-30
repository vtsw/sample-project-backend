const get = require('lodash.get');
const { AuthenticationError } = require('../../modules/errors');

const isAuthenticated = async (req, res, next) => {
  const token = get(req, 'headers.authorization', '').replace('Bearer ', '');
  if (!token) {
    res.send('You must supply a JWT for authorization!');
  }
  try {
    const { authService } = req.app.appContenxt;
    req.user = await authService.verify(token);
    return next();
  } catch (e) {
    if (e instanceof AuthenticationError) {
      res.send('User not authenticated');
    }
    throw e;
  }
};

module.exports = isAuthenticated;
