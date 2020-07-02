const { withFilter } = require('apollo-server-express');
const { Types: { ObjectId } } = require('mongoose');
const sizeOf = require('buffer-image-size');
const sharp = require('sharp');

const { ZALO_MESSAGE_SENT, ZALO_MESSAGE_RECEIVED, ZALO_MESSAGE_CREATED } = require('../events');

module.exports = {
  Query: {
    zaloMessage: (_, { id }, { container }) => container.resolve('zaloMessageProvider').findOne({ zaloMessageId: id }),
    zaloMessageList: async (_, { query }, { container, req }) => {
      const { zaloIntegrationId } = req.user;
      const {
        secondParticipant, limit, skip,
      } = query;
      const customLabels = {
        totalDocs: 'totalDocs',
        docs: 'items',
        limit: 'limit',
        page: 'page',
        nextPage: 'next',
        prevPage: 'prev',
        totalPages: 'pageCount',
        pagingCounter: 'slNo',
        hasNextPage: 'hasNext',
      };
      return container.resolve('zaloMessageProvider').paginate({
        'from.id': { $in: [ObjectId(zaloIntegrationId), ObjectId(secondParticipant)] },
        'to.id': { $in: [ObjectId(zaloIntegrationId), ObjectId(secondParticipant)] },
      }, {
        limit, offset: skip, customLabels, sort: { timestamp: -1 },
      }).then((data) => ({
        ...data,
        total: data.items.length,
      }));
    },
  },
  Mutation: {
    createZaloMessage: async (_, { message }, { container, req }) => {
      const { zaloIntegrationId: from } = req.user;
      const {
        to, content,
      } = message;
      const [OAUser, interestedUser] = await Promise.all([
        container.resolve('zaloOAProvider').findById(from),
        container.resolve('zaloSAProvider').findById(to),
      ]);
      const response = await container.resolve('zaloMessageSender').sendText({
        text: message.content,
      }, interestedUser, OAUser);
      console.log('zalo send text message response', response);
      return {
        timestamp: new Date().getTime(),
        from: {
          id: OAUser._id,
          displayName: OAUser.name,
          avatar: OAUser.avatar,
          zaloId: OAUser.oaId,
        },
        content,
        to: {
          id: interestedUser._id,
          displayName: interestedUser.name,
          avatar: interestedUser.avatar,
          zaloId: interestedUser.getFollowingByZaloOAId(OAUser.oaId).zaloIdByOA,
        },
        type: 'text',
        zaloMessageId: response.data.message_id,
      };
    },
    createZaloMessageAttachment: async (_, { message }, { container, req }) => {
      const { zaloIntegrationId: from } = req.user;
      const {
        attachmentFile, content, fileType, to,
      } = message;
      const [OAUser, interestedUser] = await Promise.all([
        container.resolve('zaloOAProvider').findById(from),
        container.resolve('zaloSAProvider').findById(to),
      ]);
      const zaloMessageSender = container.resolve('zaloMessageSender');
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
      let sendMessageRespond;
      if (fileType === 'Image') {
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
        sendMessageRespond = await zaloMessageSender.sendImage({
          file: {
            filename, mimetype, encoding, data,
          },
          content,
        }, interestedUser, OAUser);
      } else if (fileType === 'File') {
        sendMessageRespond = await zaloMessageSender.sendFile({
          file: {
            filename, mimetype, encoding, data,
          },
        }, interestedUser, OAUser);
      } else if (fileType === 'Gif') {
        sendMessageRespond = await zaloMessageSender.sendGif({
          file: {
            filename, mimetype, encoding, data,
          },
        }, interestedUser, OAUser);
      }
      if (sendMessageRespond.error) {
        throw new Error(sendMessageRespond.message);
      }
      return {
        timestamp: new Date().getTime(),
        from: {
          id: OAUser._id,
          displayName: OAUser.name,
          avatar: OAUser.avatar,
          zaloId: OAUser.oaId,
        },
        content,
        attachments: [],
        to: {
          id: interestedUser._id,
          displayName: interestedUser.name,
          avatar: interestedUser.avatar,
          zaloId: interestedUser.getFollowingByCleverOAId(OAUser._id).zaloIdByOA,
        },
        type: fileType === 'File' ? fileType : 'Image',
        zaloMessageId: sendMessageRespond.data.message_id,
      };
    },
  },
  Subscription: {
    onZaloMessageSent: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_SENT),
        ({ onZaloMessageSent }, { filter }, { loggedUser }) => {
          if (filter && filter.to) {
            return onZaloMessageSent.from.id === loggedUser.zaloIntegrationId && filter.to === onZaloMessageSent.to.id;
          }
          return onZaloMessageSent.from.id === loggedUser.zaloIntegrationId;
        },
      ),
    },
    onZaloMessageReceived: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_RECEIVED),
        ({ onZaloMessageReceived }, args, { loggedUser }) => onZaloMessageReceived.to.id === loggedUser.zaloIntegrationId,
      ),
    },
    onZaloMessageCreated: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_CREATED),
        ({ onZaloMessageCreated }, { filter }, { loggedUser }) => {
          const participants = [loggedUser.zaloIntegrationId, filter.interestedUserId];
          return (participants.includes(onZaloMessageCreated.from.id) && participants.includes(onZaloMessageCreated.to.id));
        },
      ),
    },
  },
  ZaloMessage: {
    id: (message) => message.zaloMessageId,
  },
};
