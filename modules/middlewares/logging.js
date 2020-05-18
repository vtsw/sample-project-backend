module.exports = {
  Query: async (resolve, parent, args, context, info) => {
    const { container } = context;
    container.resolve('logger').log({
      level: 'info',
      message: info,
    });
    try {
      const result = await resolve(parent, args, context, info);
      return result;
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
      const result = await resolve(parent, args, context, info);
      return result;
    } catch (e) {
      container.resolve('logger').log({
        level: 'error',
        message: e,
      });
      throw e;
    }
  },
};
