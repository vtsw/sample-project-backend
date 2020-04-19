const moment = require('moment');

const mutationLogging = {
  Mutation: async (resolve, parent, args, context, info) => {
    const result = await resolve(parent, args, context, info);
    console.log(result);
    context.container.resolve('mutationRecorder').log({
      level: 'info',
      record: {
        timestamp: moment().format('x'),
        root: parent,
        args,
        fieldName: info.fieldName,
        result,
        req: context.req,
      },
    });
    return result;
  },
};

module.exports = mutationLogging;
