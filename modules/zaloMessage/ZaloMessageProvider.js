const { ObjectId, Long } = require('mongodb');
const moment = require('moment');
const ZaloMessage = require('./ZaloMessage');
const { ResourceNotFoundError } = require('../errors');

class ZaloMessageProvider {
  /**
   *
   * @param {Collection} zaloMessages
   */
  constructor(zaloMessages) {
    this.messages = zaloMessages;
  }

  /**
   *
   * @param {String} id
   * @returns {PromiseLike<any> | Promise<any>}
   */
  findById(id) {
    return this.messages.findOne({ _id: ObjectId(id) })
      .then(ZaloMessageProvider.factory);
  }

  /**
   *
   * @param id
   * @returns {Promise<void> | * | PromiseLike<any> | Promise<any>}
   */
  findByZaloMessageId(id) {
    return this.messages.findOne({ zaloMessageId: id })
      .then(ZaloMessageProvider.factory);
  }

  /**
   *
   * @param id
   * @param messageUpdate
   * @returns {Promise<null|Message>}
   */
  async update(id, messageUpdate) {
    const message = await this.findById(id);
    if (!message) {
      throw new ResourceNotFoundError('message', `id: ${id}`);
    }
    const lastModified = moment().format();
    await this.messages
      .updateOne({ _id: ObjectId(id) }, { $set: { ...messageUpdate, lastModified } });
    return ZaloMessageProvider.factory(Object.assign(message.toJson(), messageUpdate, { lastModified }));
  }


  /**
   *
   * @param {Object} message
   * @returns {Promise<null|ZaloMessage>}
   */
  async create(message) {
    const inserted = await this.messages.insertOne({
      content: message.content,
      attachments: message.attachments,
      from: message.from,
      to: message.to,
      timestamp: Long.fromNumber(parseInt(message.timestamp, 10)),
      zaloMessageId: message.zaloMessageId,
      lastModified: moment().format(),
    });
    return ZaloMessageProvider.factory(inserted.ops[0]);
  }

  /**
   *
   * @param {Object} condition
   * @returns {Promise<*>}
   */
  async find(condition = { page: { limit: 10, skip: 0 }, query: {} }) {
    let { query } = condition;
    query = { 'from.id': { $in: query.from }, 'to.id': { $in: query.to } };
    const messages = await this.messages
      .find(query)
      .limit(condition.page.limit + 1)
      .skip(condition.page.skip).sort({ timestamp: -1 })
      .toArray();
    const hasNext = (messages.length === condition.page.limit + 1);
    if (hasNext) {
      messages.pop();
    }
    return {
      hasNext,
      items: messages.map(ZaloMessageProvider.factory),
      total: messages.length,
    };
  }


  /**
   *
   * @param rawData
   * @returns {null|ZaloMessage}
   */
  static factory(rawData) {
    if (!rawData) {
      return null;
    }
    // convert all objectId type attribute to string type to decouple from mongodb layer
    const data = {};
    Object.keys(rawData).forEach((key) => {
      if (rawData[key] instanceof ObjectId) {
        data[key] = rawData[key].toString();
      } else {
        data[key] = rawData[key];
      }
    });

    const message = new ZaloMessage(data._id || data.id);
    message.content = data.content;
    message.from = data.from;
    message.to = data.to;
    message.timestamp = data.timestamp;
    message.attachments = data.attachments;
    return message;
  }
}

module.exports = ZaloMessageProvider;
