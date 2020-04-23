const { isEmpty, pickBy, identity } = require('lodash');
const { withFilter } = require('apollo-server-express');
const {
  UserInputError,
} = require('apollo-server-express');

const { ZALO_MESSAGE_SENT, ZALO_MESSAGE_RECEIVED } = require('../events');
const OASendTextEventHandler = require('../../zalo/zaloEventHandlers/OASendTextEventHandler');

const shouldReturn = (schema, filter, user) => {
  if (filter.from && filter.to) {
    return (schema.from === filter.from && schema.to === filter.to);
  }
  if (filter.from) {
    return (schema.from === filter.from && schema.to === user.id);
  }
  if (filter.to) {
    return (schema.to === filter.to && schema.from === user.from);
  }

  return true;
};

module.exports = {
  Query: {
    zaloMessage: (_, { id }, { container }) => container.resolve('zaloMessageProvider').findById(id),
    zaloMessageList: async (_, args, { container }) => {
      const messageProvider = container.resolve('zaloMessageProvider');
      if (isEmpty(args)) {
        return messageProvider
          .find({ query: { }, page: { limit: 10, skip: 0 } });
      }
      const {
        query: {
          from, to, limit, skip,
        },
      } = args;
      return messageProvider
        .find({ query: pickBy({ from, to }, identity), page: { limit, skip } });
    },
  },
  Mutation: {
    createZaloMessage: async (_, { message }, { container, req }) => {
      const { user } = req;
      const loggedUser = await container.resolve('userProvider').findById(user.id);
      const timestamp = new Date().getTime();
      const response = await container.resolve('zaloMessageBroker').send(message.content, message.to, loggedUser);
      if (response.error === '-201') {
        throw new UserInputError('Recipient id is invalid');
      }
      return container.resolve('ZaloMessageHandlerProvider')
        .provide(OASendTextEventHandler.getEvent())
        .handle({
          sender: {
            id: loggedUser.id,
          },
          recipient: {
            id: message.to,
          },
          event_name: OASendTextEventHandler.getEvent(),
          message: {
            text: message.content,
          },
          timestamp,
        });
    },
  },
  Subscription: {
    onZaloMessageCreated: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_SENT),
        ({ onZaloMessageCreated }, { filter }, { subContext }) => {
          const { loggedUser } = subContext;
          console.log(onZaloMessageCreated);
          console.log(loggedUser);
          console.log(onZaloMessageCreated.from === loggedUser.id && filter.to === onZaloMessageCreated.to)
          if (filter.to) {
            return onZaloMessageCreated.from === loggedUser.id && filter.to === onZaloMessageCreated.to;
          }
          return onZaloMessageCreated.from === loggedUser.id;
        },
      ),
    },
    onZaloMessageReceived: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_RECEIVED),
        ({ onZaloMessageReceived }, { filter }, { subContext }) => {
          const { loggedUser } = subContext;
          if (filter.from) {
            return onZaloMessageReceived.to === loggedUser.id && filter.from === onZaloMessageReceived.from;
          }
          return onZaloMessageReceived.to === loggedUser.id;
        },
      ),
    },
  },
};
