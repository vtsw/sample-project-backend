const { ObjectId } = require('mongodb');
const { pickBy, identity } = require('lodash');
const moment = require('moment');
const { ResourceNotFoundError } = require('../errors');
const Message = require('./Message');

class MessageProvider {
  /**
   *
   * @param {Collection} messages
   */
  constructor(messages) {
    this.messages = messages;
  }

  /**
   *
   * @param {String} id
   * @returns {PromiseLike<any> | Promise<any>}
   */
  findById(id) {
    return this.messages.findOne({ _id: ObjectId(id), deleted: false })
      .then(MessageProvider.factory);
  }

  /**
   *
   * @param {Object} message
   * @returns {Promise<null|Message>}
   */
  async create(message) {
    const inserted = await this.messages.insertOne({
      content: message.content,
      userId: ObjectId(message.userId),
      lastModified: moment().format(),
      deleted: false,
    });
    return MessageProvider.factory(inserted.ops[0]);
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
    return MessageProvider.factory(Object.assign(message.toJson(), messageUpdate, { lastModified }));
  }

  /**
   *
   * @param {String} id
   * @returns {Promise<null|Message>}
   */
  delete(id) {
    return this.update(id, {
      deleted: true,
    });
  }

  /**
   *
   * @param {Object} condition
   * @returns {Promise<*>}
   */
  async find(condition = { page: { limit: 10, skip: 0 }, query: {} }) {
    const messages = await this.messages
      .find(Object.assign(condition.query, { deleted: false },
        pickBy({ userId: condition.query.userId ? ObjectId(condition.query.userId) : null }, identity)))
      .limit(condition.page.limit + 1)
      .skip(condition.page.skip).sort({ lastModified: -1 })
      .toArray();
    const hasNext = (messages.length === condition.page.limit + 1);
    if (hasNext) {
      messages.pop();
    }
    return {
      hasNext,
      items: messages.map(MessageProvider.factory),
      total: messages.length,
    };
  }

  /**
   *
   * @param {Object} rawData
   * @returns {null|Message}
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

    const message = new Message(data._id || data.id);
    message.content = data.content;
    message.userId = data.userId;
    message.lastModified = data.lastModified;
    return message;
  }
}

module.exports = MessageProvider;
