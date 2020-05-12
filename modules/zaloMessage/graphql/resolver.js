const { withFilter } = require('apollo-server-express');
const sizeOf = require('buffer-image-size');
const sharp = require('sharp');
const {
  UserInputError,
} = require('apollo-server-express');

const { ZALO_MESSAGE_SENT, ZALO_MESSAGE_RECEIVED, ZALO_MESSAGE_CREATED } = require('../events');


module.exports = {
  Query: {
    zaloMessage: (_, { id }, { container }) => container.resolve('zaloMessageProvider').findByZaloMessageId(id),
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
      const response = await container.resolve('zaloMessageSender').send({
        text: message.content,
      }, interestedUser, loggedUser);
      return {
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
      };
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
      let data = await new Promise((resolve, reject) => {
        const bufs = [];
        readable.on('error', (err) => {
          reject(err);
        });
        readable.on('data', (d) => { bufs.push(d); });
        readable.on('end', () => {
          resolve(Buffer.concat(bufs));
        });
      });
      if (data.length > 1000000) {
        const { height, width } = sizeOf(data);
        const ratio = width / height;
        const sizePerPixel = data.length / (height * width);
        const residePixel = 1000000 / sizePerPixel;
        const resideHeight = Math.sqrt(residePixel / ratio);
        const resideWeight = residePixel / resideHeight;
        data = await sharp(data)
          .resize({
            width: Math.round(resideWeight),
            height: Math.round(resideHeight),
          }).toBuffer();
      }
      const uploadResult = await container.resolve('zaloUploader').uploadImage({
        readableSteam: data,
        mimetype,
        filename,
        encoding,
      }, loggedUser);
      if (uploadResult.error) {
        throw new Error(uploadResult.message);
      }
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
      console.log(response.data.message_id, 'send');
      return {
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
      };
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
  ZaloMessage: {
    id: (message) => message.zaloMessageId,
  },
};
