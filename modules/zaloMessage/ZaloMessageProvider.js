const { ObjectId } = require('mongodb');
const ZaloMessage = require('./ZaloMessage');

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
   * @param {Object} message
   * @returns {Promise<null|ZaloMessage>}
   */
  async create(message) {
    const inserted = await this.messages.insertOne({
      content: message.content,
      from: message.from,
      to: message.to,
      timestamp: message.timestamp,
    });
    return ZaloMessageProvider.factory(inserted.ops[0]);
  }

  /**
   *
   * @param {Object} condition
   * @returns {Promise<*>}
   */
  async find(condition = { page: { limit: 10, skip: 0 }, query: {} }) {
    const messages = await this.messages
      .find(condition.query)
      .limit(condition.page.limit + 1)
      .skip(condition.page.skip).sort({ lastModified: -1 })
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
    return message;
  }
}

module.exports = ZaloMessageProvider;
