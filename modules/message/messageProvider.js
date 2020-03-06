const { ObjectId } = require('mongodb');
const moment = require('moment');
const { ResourceNotFoundError } = require('../errors');
const Message = require('./message');

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
   * @param id
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

  delete(id) {
    return this.update(id, {
      deleted: true,
    });
  }

  async find(condition) {
    const messages = await this.messages.find(condition).toArray();
    return messages.map(MessageProvider.factory);
  }

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
