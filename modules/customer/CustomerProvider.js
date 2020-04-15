const { ObjectId } = require('mongodb');
const moment = require('moment');
const { ResourceNotFoundError, ResourceAlreadyExist } = require('../errors');
const Customer = require('./Customer');

class CustomerProvider {
  /**
   *
   * @param {Collection} customers
   */
  constructor(customers) {
    this.customers = customers;
  }

  /**
   *
   * @param {Object} customer
   * @returns {Promise<User>}
   */
  async create(customer) {
    // const inserted = await this.users.insertOne({
    //   email: user.email,
    //   name: user.name,
    //   password: user.password,
    //   deleted: false,
    //   lastModified: moment().format(),
    // });
    // return UserProvider.factory(inserted.ops[0]);

    return '11111';
  }

  /**
   *
   * @param {Object} rawData
   * @returns {null|User}
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
    const user = new User(data._id || data.id);
    user.password = data.password;
    user.email = data.email;
    user.name = data.name;
    user.lastModified = data.lastModified;
    user.image = data.image;
    return user;
  }
}

module.exports = CustomerProvider;
