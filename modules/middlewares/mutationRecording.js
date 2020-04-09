const moment = require('moment');

const mutationLogging = {
  Mutation: async (resolve, parent, args, context, info) => {
    try {
      const result = await resolve(parent, args, context, info);
      const record = {
        timestamp: moment().format('x'),
        root: parent,
        args,
        fieldName: info.fieldName,
        result,
      }
      context.mutationRecorder.log({
        level: 'info',
        message: record,
      });
      return result;
    } catch (e) {
      context.logger.log({
        level: 'error',
        message: `Cannot record mutation\n${e}`,
      });
      return e;
    }
  },
};

module.exports = mutationLogging;
