const { withFilter } = require('apollo-server-express');
const {
  UserInputError,
} = require('apollo-server-express');

const { ZALO_MESSAGE_SENT, ZALO_MESSAGE_RECEIVED, ZALO_MESSAGE_CREATED } = require('../events');
const OASendTextEventHandler = require('../../zalo/zaloEventHandlers/OASendTextEventHandler');


module.exports = {
  Query: {
    zaloMessage: (_, { id }, { container }) => container.resolve('zaloMessageProvider').findById(id),
    zaloMessageList: async (_, args, { container, req }) => {
      const { user } = req;
      const messageProvider = container.resolve('zaloMessageProvider');
      const {
        query: {
          interestedUserId, limit, skip,
        },
      } = args;
      const interestedUser = await container.resolve('zaloInterestedUserProvider').findById(interestedUserId);
      if (!interestedUser) {
        throw new UserInputError('InterestedUserId is invalid!');
      }
      return messageProvider
        .find({ query: { from: [user.id, interestedUserId], to: [user.id, interestedUserId] }, page: { limit, skip } });
    },
  },
  Mutation: {
    createZaloMessage: async (_, { message }, { container, req }) => {
      const { user } = req;
      const loggedUser = await container.resolve('userProvider').findById(user.id);
      const interestedUser = await container.resolve('zaloInterestedUserProvider').findById(message.to);
      const timestamp = new Date().getTime();
      const response = await container.resolve('zaloMessageSender').send(message.content, interestedUser, loggedUser);
      if (response.error) {
        throw new Error(response.message);
      }
      const zaloInterestedUserProvider = container.resolve('zaloMessageHandlerProvider');
      const handler = zaloInterestedUserProvider.provide(OASendTextEventHandler.getEvent());
      return handler.handle(await handler.mapDataFromZalo({
        event_name: OASendTextEventHandler.getEvent(),
        message: {
          text: message.content,
          msg_id: response.data.message_id,
        },
        timestamp,
      }, loggedUser, interestedUser));
    },
  },
  Subscription: {
    onZaloMessageSent: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_SENT),
        ({ onZaloMessageCreated }, { filter }, { loggedUser }) => {
          if (filter && filter.to) {
            return onZaloMessageCreated.from.id === loggedUser.id && filter.to === onZaloMessageCreated.to.id;
          }
          return onZaloMessageCreated.from.id === loggedUser.id;
        },
      ),
    },
    onZaloMessageReceived: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_RECEIVED),
        ({ onZaloMessageReceived }, args, { loggedUser }) => onZaloMessageReceived.to.id === loggedUser.id,
      ),
    },
    onZaloMessageCreated: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_CREATED),
        ({ onZaloMessageCreated }, { filter }, { loggedUser }) => {
          const participants = [loggedUser.id, filter.interestedUserId];
          return (participants.includes(onZaloMessageCreated.from.id) && participants.includes(onZaloMessageCreated.to.id));
        },
      ),
    },
  },
};
