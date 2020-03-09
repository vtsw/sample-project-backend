const { ObjectId } = require('mongodb');
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
    return this.messages.findOne({ _id: ObjectId(id), $or: [{ deleted: false }, { deleted: { $exists: false } }] })
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
      sender: ObjectId(message.sender),
      lastModified: moment().format(),
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
    const { result } = await this.messages
      .updateOne({ _id: ObjectId(id) }, { $set: messageUpdate, $currentDate: { lastModified: true } });
    if (result.ok !== 1) {
      throw new Error(`Update fail with id: ${id}`);
    }
    return MessageProvider.factory({ ...message.toJson(), ...messageUpdate });
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
    const messages = await this.messages.find(condition.query).limit(condition.page.limit).skip(condition.page.skip).toArray();
    return messages.map(MessageProvider.factory);
  }

  /**
   *
   * @param {Object} condition
   * @returns {Promise<{total: *, messages: *, hasNext: boolean}>}
   */
  async findWithPagination(condition = { page: { limit: 10, skip: 0 }, query: {} }) {
    let hasNext = false;
    const page = {
      limit: condition.page.limit + 1,
      skip: condition.page.skip,
    };
    const messages = await this.find({ page, query: condition.query });
    if (messages.length > condition.limit) {
      hasNext = true;
      messages.pop();
    }
    return {
      messages,
      total: messages.length,
      hasNext,
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
    const message = new Message(rawData._id || rawData.id);
    message.content = rawData.content;
    message.sender = rawData.sender;
    message.lastModified = rawData.lastModified;
    return message;
  }
}

module.exports = MessageProvider;
