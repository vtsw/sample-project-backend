module.exports = {
  Query: async (resolve, parent, args, context, info) => {
    const { container } = context;
    container.resolve('logger').log({
      level: 'info',
      message: info,
    });
    try {
      return await resolve(parent, args, context, info);
    } catch (e) {
      container.resolve('logger').log({
        level: 'error',
        message: e,
      });
      throw e;
    }
  },
  Mutation: async (resolve, parent, args, context, info) => {
    const { container } = context;
    container.resolve('logger').log({
      level: 'info',
      message: info,
    });
    try {
      return await resolve(parent, args, context, info);
    } catch (e) {
      container.resolve('logger').log({
        level: 'error',
        message: e,
      });
      throw e;
    }
  },
};
