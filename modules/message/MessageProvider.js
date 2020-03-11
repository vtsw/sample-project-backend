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
      sender: ObjectId(message.sender),
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
    const { result } = await this.messages
      .updateOne({ _id: ObjectId(id) }, { $set: messageUpdate });
    if (result.ok !== 1) {
      throw new Error(`Update fail with id: ${id}`);
    }
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
    const messageCursor = this.messages
      .find(Object.assign(condition.query, { deleted: false },
        pickBy({ userId: condition.query.userId ? ObjectId(condition.query.userId) : null }, identity)))
      .limit(condition.page.limit + 1)
      .skip(condition.page.skip).sort({ lastModified: -1 });
    const hasNext = messageCursor.hasNext();
    const messages = await messageCursor.toArray();
    return {
      hasNext,
      items: messages.map(MessageProvider.factory),
      total: messages.length,
    };
  }

  /**
   *
   * @param condition
   * @returns {Promise<{total: *, hasNext: boolean, items: *}>}
   */
  async findWithPagination(condition = { page: { limit: 10, skip: 0 }, query: {} }) {
    let hasNext = false;
    const page = {
      limit: condition.page.limit + 1,
      skip: condition.page.skip,
    };
    const messages = await this.find({ page, query: condition.query });
    if (messages.length > condition.page.limit) {
      hasNext = true;
      messages.pop();
    }
    return {
      items: messages,
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
