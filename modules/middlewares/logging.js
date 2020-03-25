/**
 * This middleware is applied for all resolvers
 * @param resolve
 * @param parent
 * @param args
 * @param context
 * @param info
 * @returns {Promise<*>}
 */
module.exports = async (resolve, parent, args, context, info) => {
  context.logger.log({
    level: 'info',
    message: info,
  });
  try {
    return await resolve(parent, args, context, info);
  } catch (e) {
    context.logger.log({
      level: 'error',
      message: e,
    });
    return e;
  }
};
