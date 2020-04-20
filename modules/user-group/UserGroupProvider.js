const { ObjectId } = require('mongodb');
const moment = require('moment');
const { ResourceNotFoundError, ResourceAlreadyExist } = require('../errors');
const UserGroup = require('./UserGroup');

class UserGroupProvider {
  /**
   *
   * @param {Collection} userGroup
   */
  constructor(userGroup) {
    this.userGroup = userGroup;
  }

  /**
   *
   * @param {Object} userGroup
   * @returns {Promise<userGroup>}
   */
  async create(userGroup) {

    console.log('1111', userGroup);
    const inserted = await this.userGroup.insertOne({
      name: userGroup.name,
    });


    return UserGroupProvider.factory(inserted.ops[0]);
  }

  /**
   *
   * @param {Object} rawData
   * @returns {null|userGroup}
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

    const userGroup = new UserGroup(data._id || data.id);
    userGroup.name = data.name;
    return userGroup;
  }
}

module.exports = UserGroupProvider;

