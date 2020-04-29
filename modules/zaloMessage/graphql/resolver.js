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
      const loggedUser = await container.resolve('userProvider').findById(user.id);
      const messageProvider = container.resolve('zaloMessageProvider');
      const {
        query: {
          interestedUserId, limit, skip,
        },
      } = args;
      const interestedUser = await container.resolve('zaloInterestedUserProvider').findById(interestedUserId);
      if (!interestedUser) {
        throw new UserInputError('InterestedUserId is invalid');
      }
      const result = await messageProvider
        .find({ query: { from: [loggedUser.id, interestedUserId], to: [loggedUser.id, interestedUserId] }, page: { limit, skip } });
      const { items } = result;
      result.items = items.map((message) => message.toJson()).map((message) => {
        if (message.from === loggedUser.id) {
          const from = {
            id: loggedUser.id,
            avatar: loggedUser.image.link,
            displayName: loggedUser.name,
          };
          const to = {
            id: interestedUser.id,
            displayName: interestedUser.displayName,
            avatar: interestedUser.avatar,
          };
          return {
            ...message,
            from,
            to,
          };
        }
        const to = {
          id: loggedUser.id,
          avatar: loggedUser.image.link,
          displayName: loggedUser.name,
        };
        const from = {
          id: interestedUserId,
          displayName: interestedUser.displayName,
          avatar: interestedUser.avatar,
        };
        return {
          ...message,
          from,
          to,
        };
      });
      return result;
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
      const createdMessage = await handler.handle(await handler.mapDataFromZalo({
        event_name: OASendTextEventHandler.getEvent(),
        message: {
          text: message.content,
        },
        timestamp,
      }, loggedUser, interestedUser));
      createdMessage.to = {
        id: interestedUser.id,
        displayName: interestedUser.displayName,
        avatar: interestedUser.avatar,
      };
      createdMessage.from = {
        id: loggedUser.id,
        displayName: loggedUser.name,
        avatar: loggedUser.image.link,
      };
      return createdMessage;
    },
  },
  Subscription: {
    onZaloMessageSent: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_SENT),
        ({ onZaloMessageCreated }, { filter }, { subContext }) => {
          const { loggedUser } = subContext;
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
        ({ onZaloMessageReceived }, args, { subContext }) => {
          const { loggedUser } = subContext;
          return onZaloMessageReceived.to.id === loggedUser.id;
        },
      ),
    },
    onZaloMessageCreated: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_CREATED),
        ({ onZaloMessageCreated }, { filter }, { subContext }) => {
          const participants = [subContext.loggedUser.id, filter.interestedUserId];
          return (participants.includes(onZaloMessageCreated.from.id) && participants.includes(onZaloMessageCreated.to.id));
        },
      ),
    },
  },
};
