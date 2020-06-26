const { withFilter } = require('apollo-server-express');
const { Types: { ObjectId } } = require('mongoose');
const sizeOf = require('buffer-image-size');
const sharp = require('sharp');

const { ZALO_MESSAGE_SENT, ZALO_MESSAGE_RECEIVED, ZALO_MESSAGE_CREATED } = require('../events');


module.exports = {
  Query: {
    zaloMessage: (_, { id }, { container }) => container.resolve('zaloMessageProvider').findOne({ zaloMessageId: id }),
    zaloMessageList: async (_, { query }, { container, req }) => {
      const { zaloIntegrationId: firstParticipant } = req.user;
      const {
        secondParticipant, limit, offset,
      } = query;
      const customLabels = {
        totalDocs: 'itemCount',
        docs: 'items',
        limit: 'perPage',
        page: 'currentPage',
        nextPage: 'next',
        prevPage: 'prev',
        totalPages: 'pageCount',
        pagingCounter: 'slNo',
        meta: 'paginator',
      };
      return container.resolve('zaloMessageProvider').paginate({
        'from.id': { $in: [ObjectId(firstParticipant), ObjectId(secondParticipant)] },
        'to.id': { $in: [ObjectId(firstParticipant), ObjectId(secondParticipant)] },
      }, {
        limit, offset, customLabels, sort: { timestamp: -1 },
      });
    },
  },
  Mutation: {
    createZaloMessage: async (_, { message }, { container }) => {
      const {
        from, to, content,
      } = message;
      const [OAUser, interestedUser] = await Promise.all([
        container.resolve('zaloOAProvider').findById(from),
        container.resolve('zaloSAProvider').findById(to),
      ]);
      const response = await container.resolve('zaloMessageSender').sendText({
        text: message.content,
      }, interestedUser, OAUser);
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
          zaloId: interestedUser.getFollowingByCleverOAId(OAUser._id).zaloIdByOA,
        },
        type: 'text',
        zaloMessageId: response.data.message_id,
      };
    },
    createZaloMessageAttachment: async (_, { message }, { container }) => {
      const {
        attachmentFile, content, fileType, from, to,
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
        ({ onZaloMessageCreated }, { filter }) => {
          if (filter && filter.to) {
            return onZaloMessageCreated.from.id === filter.oaId && filter.to === onZaloMessageCreated.to.id;
          }
          return onZaloMessageCreated.from.id === filter.oaId;
        },
      ),
    },
    onZaloMessageReceived: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_RECEIVED),
        ({ onZaloMessageReceived }, { filter }) => onZaloMessageReceived.to.id === filter.oaId,
      ),
    },
    onZaloMessageCreated: {
      subscribe: withFilter(
        (_, __, { container }) => container.resolve('pubsub').asyncIterator(ZALO_MESSAGE_CREATED),
        ({ onZaloMessageCreated }, { filter }) => {
          const participants = [filter.saId, filter.oaId];
          return (participants.includes(onZaloMessageCreated.from.id) && participants.includes(onZaloMessageCreated.to.id));
        },
      ),
    },
  },
  ZaloMessage: {
    id: (message) => message.zaloMessageId,
  },
};
