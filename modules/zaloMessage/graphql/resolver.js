const { withFilter } = require('apollo-server-express');
const lodash = require('lodash');
const {
  UserInputError,
} = require('apollo-server-express');

const { ZALO_MESSAGE_SENT, ZALO_MESSAGE_RECEIVED, ZALO_MESSAGE_CREATED } = require('../events');


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
      const pubsub = container.resolve('pubsub');
      const loggedUser = await container.resolve('userProvider').findById(user.id);
      const interestedUser = await container.resolve('zaloInterestedUserProvider').findById(message.to);
      const response = await container.resolve('zaloMessageSender').send({
        text: message.content,
      }, interestedUser, loggedUser);
      const createdMessage = await container.resolve('zaloMessageProvider').create({
        timestamp: new Date().getTime(),
        from: {
          id: loggedUser.id,
          displayName: loggedUser.name,
          avatar: loggedUser.image.link,
        },
        content: message.content,
        to: {
          id: interestedUser.id,
          displayName: interestedUser.displayName,
          avatar: interestedUser.avatar,
        },
        zaloMessageId: response.data.message_id,
      });
      await Promise.all([
        pubsub.publish(ZALO_MESSAGE_SENT, { onZaloMessageSent: createdMessage.toJson() }),
        pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: createdMessage.toJson() }),
      ]);
      return createdMessage;
    },
    createZaloMessageAttachment: async (_, { message }, { container, req }) => {
      const { attachmentFile, content } = message;
      const { user } = req;
      const loggedUser = await container.resolve('userProvider').findById(user.id);
      const interestedUser = await container.resolve('zaloInterestedUserProvider').findById(message.to);
      const {
        filename, mimetype, encoding,
        createReadStream,
      } = await attachmentFile;
      const readable = createReadStream();
      const data = await new Promise((resolve, reject) => {
        const bufs = [];
        readable.on('error', (err) => {
          reject(err);
        });
        readable.on('data', (d) => { bufs.push(d); });
        readable.on('end', () => {
          resolve(Buffer.concat(bufs));
        });
      });
      const uploadResult = await container.resolve('zaloUploader').uploadImage({
        readableSteam: data,
        mimetype,
        filename,
        encoding,
      }, loggedUser);
      const response = await container.resolve('zaloMessageSender').send({
        text: content,
        attachment: {
          type: 'template',
          payload: {
            template_type: 'media',
            elements: [{
              media_type: 'image',
              attachment_id: uploadResult.data.attachment_id,
            }],
          },
        },
      }, interestedUser, loggedUser);

      return container.resolve('zaloMessageProvider').create(lodash.pickBy({
        timestamp: new Date().getTime(),
        from: {
          id: loggedUser.id,
          displayName: loggedUser.name,
          avatar: loggedUser.image.link,
        },
        content,
        attachments: [],
        to: {
          id: interestedUser.id,
          displayName: interestedUser.displayName,
          avatar: interestedUser.avatar,
        },
        zaloMessageId: response.data.message_id,
      }, lodash.identity));
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
