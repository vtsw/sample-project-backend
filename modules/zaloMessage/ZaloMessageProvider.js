const { ObjectId } = require('mongodb');
const ZaloMessage = require('./ZaloMessage');

class ZaloMessageProvider {
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
      from: ObjectId(message.from),
      to: ObjectId(message.to),
      lastModified: message.timeStamp,
    });
    return ZaloMessageProvider.factory(inserted.ops[0]);
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
