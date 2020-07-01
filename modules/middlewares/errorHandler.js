const { ValidationError } = require('@hapi/joi');

/**
 * This middleware is applied for all resolvers
 * @param resolve
 * @param parent
 * @param args
 * @param context
 * @param info
 * @returns {Promise<*>}
 */
// eslint-disable-next-line consistent-return
module.exports = async (resolve, parent, args, context, info) => {
  const { container, req } = context;
  const config = container.resolve('config');
  try {
    return await resolve(parent, args, context, info);
  } catch (e) {
    if (config.app.env === 'development') {
      req.errors.push(e);
    }
    if (e instanceof ValidationError) {
      return e;
    }
  }
};
