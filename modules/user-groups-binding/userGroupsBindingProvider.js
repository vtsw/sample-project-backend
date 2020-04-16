const { ObjectId } = require('mongodb');
const moment = require('moment');
const { ResourceNotFoundError, ResourceAlreadyExist } = require('../errors');
const UserGroupsBinding  = require('./UserGroupsBinding');

class UserGroupsBindingProvider {
  /**
   *
   * @param {Collection} userGroupsBinding 
   */
  constructor(userGroupsBinding ) {
    this.userGroupsBinding  = userGroupsBinding ;
  }

  /**
   *
   * @param {Object} userGroupsBinding 
   * @returns {Promise<userGroupsBinding >}
   */
  async create(userGroupsBinding) {

    console.log(userGroupsBinding);
    const inserted = await this.userGroupsBinding .insertOne({
      userId: userGroupsBinding.userId,
      groupId: userGroupsBinding.groupId,
    });

    return UserGroupsBindingProvider.factory(inserted.ops[0]);

  }

  /**
   *
   * @param {Object} rawData
   * @returns {null|userGroupsBinding}
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

    const userGroupsBinding  = new UserGroupsBinding(data._id || data.id);
    userGroupsBinding.userId = data.userId;
    userGroupsBinding.groupId = data.groupId;
    return userGroupsBinding ;
  }
}

module.exports = UserGroupsBindingProvider;
