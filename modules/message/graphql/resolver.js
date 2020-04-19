const { isEmpty, pickBy, identity } = require('lodash');
const { createMessage, updateMessage } = require('../validationSchema');

module.exports = {
  Query: {
    message: (_, { id }, { container }) => container.resolve('messageProvider').findById(id),
    messageList: async (_, args, { container }) => {
      const messageProvider = container.resolve('messageProvider');
      if (isEmpty(args)) {
        return messageProvider
          .find({ query: { }, page: { limit: 10, skip: 0 } });
      }
      const {
        query: {
          searchText, userId, limit, skip,
        },
      } = args;
      const content = !isEmpty(searchText) ? new RegExp(`${searchText}`) : null;
      return messageProvider
        .find({ query: pickBy({ content, userId }, identity), page: { limit, skip } });
    },
  },
  Mutation: {
    createMessage: {
      validationSchema: createMessage,
      resolve: async (source, { message }, { container, req }) => {
        const inputMessage = {
          ...message,
          userId: req.user.id,
        };
        return container.resolve('messageProvider').create(inputMessage);
      },
    },
    updateMessage: {
      validationSchema: updateMessage,
      resolve: async (_, { message }, { container }) => {
        return container.resolve('messageProvider').update(message.id, message);
      },
    },
    deleteMessage: (_, { id }, { container }) => container.resolve('messageProvider').delete(id),
  },
};
