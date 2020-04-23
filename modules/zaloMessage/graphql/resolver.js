const { ZALO_MESSAGE_SENT, ZALO_MESSAGE_RECEIVED } = require('../events');
const OASendTextEventHandler = require('../../zalo/zaloEventHandlers/OASendTextEventHandler');

module.exports = {
  Query: {
    zaloMessage: () => {

    },
    zaloMessageList: () => {

    },
  },
  Mutation: {
    createZaloMessage: async (_, { message }, { container, req }) => {
      const { user } = req;
      const loggedUser = await container.resolve('userProvider').findById(user.id);
      const timestamp = new Date().getTime();
      container.resolve('zaloMessageBroker').send(message.content, message.to, loggedUser);
      return container.resolve('ZaloMessageHandlerProvider')
        .provide(OASendTextEventHandler.getEvent())
        .handle({
          sender: {
            id: loggedUser.zaloOA.OAID,
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
      subscribe: (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_SENT),
    },
    onZaloMessageReceived: {
      subscribe: (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_RECEIVED),
    },
  },
};
