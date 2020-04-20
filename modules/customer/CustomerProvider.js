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
   * @returns {Promise<Customer>}
   */
  async create(customer) {
    const inserted = await this.customers.insertOne({
      name: customer.name,
      phoneNo: customer.phoneNo,
    });

    return CustomerProvider.factory(inserted.ops[0]);

  }

  /**
   *
   * @param {Object} rawData
   * @returns {null|Customer}
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

    const customer = new Customer(data._id || data.id);
    customer.name = data.name;
    customer.phoneNo = data.phoneNo;
    return customer;
  }
}

module.exports = CustomerProvider;
