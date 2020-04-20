const { ObjectId } = require('mongodb');
const moment = require('moment');
const { ResourceNotFoundError, ResourceAlreadyExist } = require('../../errors');
const CleverZaloBinding = require('./CleverZaloBinding');

class CleverZaloBindingProvider {
  /**
   *
   * @param {Collection} cleverZaloBinding
   */
  constructor(cleverZaloBinding) {
    this.cleverZaloBinding = cleverZaloBinding;
  }

  /**
   *
   * @param {Object} cleverZB
   * @returns {Promise<Customer>}
   */
  async create(cleverZB) {
    const inserted = await this.cleverZaloBinding.insertOne({
      userId: cleverZB.userId,
      zaloOAId: cleverZB.zaloOAId,
    });

    return CleverZaloBindingProvider.factory(inserted.ops[0]);
  }

  /**
   *
   * @param {Object} rawData
   * @returns {null|cleverZB}
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

    const customer = new CleverZaloBinding(data._id || data.id);
    customer.userId = data.userId;
    customer.zaloOAId = data.zaloOAId;
    return customer;
  }
}

module.exports = CleverZaloBindingProvider;

