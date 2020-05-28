const { ObjectId } = require('mongodb');
const moment = require('moment');
const { ResourceNotFoundError } = require('../errors');
const User = require('./ZaloInterestedUser');
const ZaloIdentifier = require('./ZaloIdentifier');

class ZaloInterestedUserProvider {
  /**
   *
   * @param {Collection} zaloInterestedUsers
   */
  constructor(zaloInterestedUsers) {
    this.zaloInterestedUsers = zaloInterestedUsers;
  }

  /**
   *
   * @param {String} id
   * @returns {PromiseLike<any> | Promise<any>}
   */
  findById(id) {
    return this.zaloInterestedUsers.findOne({ _id: ObjectId(id) })
      .then(ZaloInterestedUserProvider.factory);
  }

  /**
   *
   * @param {ZaloIdentifier} id
   * @returns {Promise<void> | * | PromiseLike<any> | Promise<any>}
   */
  findByZaloId(id) {
    if (id.phoneNumber) {
      return this.zaloInterestedUsers.findOne({ phoneNumber: id.phoneNumber })
        .then(ZaloInterestedUserProvider.factory);
    }
    return this.zaloInterestedUsers.findOne({ 'followings.zaloId': id.toJson() })
      .then(ZaloInterestedUserProvider.factory);
  }

  /**
   *
   * @param {Object} user
   * @returns {Promise<ZaloInterestedUser>}
   */
  async create(user) {
    const { followings } = user;
    const mappedFollowings = followings.map((item) => ({ userId: ObjectId(item.userId), zaloId: item.zaloId }));
    const inserted = await this.zaloInterestedUsers.insertOne({
      displayName: user.displayName,
      dob: user.dob,
      gender: user.gender,
      avatar: user.avatar,
      avatars: user.avatars,
      lastModified: moment().format(),
      timestamp: user.timestamp,
      phoneNumber: user.phoneNumber,
      followings: mappedFollowings,
      info: user.info,
    });
    return ZaloInterestedUserProvider.factory(inserted.ops[0]);
  }

  /**
   *
   * @param condition
   * @returns {Promise<{total: *, hasNext: boolean, items: *}>}
   */
  async find(condition = { page: { limit: 10, skip: 0 }, query: {} }) {
    let { query } = condition;
    if (query.following) {
      query = { ...condition.query, 'followings.userId': ObjectId(query.following) };
      delete query.following;
    }
    const users = await this.zaloInterestedUsers
      .find(query)
      .limit(condition.page.limit + 1).skip(condition.page.skip).toArray();
    const hasNext = (users.length === condition.page.limit + 1);
    if (hasNext) {
      users.pop();
    }
    return {
      hasNext,
      items: users.map((user) => ZaloInterestedUserProvider.factory(user)),
      total: users.length,
    };
  }

  /**
   *
   * @param id
   * @param userUpdate
   * @returns {Promise<ZaloInterestedUser>}
   */
  async update(id, userUpdate) {
    const user = await this.findById(id);
    if (!user) {
      throw new ResourceNotFoundError('User', `id: ${id}`);
    }
    const lastModified = moment().format();
    await this.zaloInterestedUsers
      .updateOne({ _id: ObjectId(id) }, { $set: { ...userUpdate, lastModified } });
    return ZaloInterestedUserProvider.factory(Object.assign(user.toJson(), userUpdate, { lastModified }));
  }

  /**
   *
   * @param {Object} rawData
   * @returns {null|ZaloInterestedUser}
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
    const mappedFollowings = data.followings.map((item) => ({ userId: ObjectId(item.userId), zaloId: ZaloIdentifier.factory(item.zaloId) }));
    const user = new User(data._id || data.id);
    user.displayName = data.displayName;
    user.dob = data.dob;
    user.gender = data.gender;
    user.lastModified = data.lastModified;
    user.avatar = data.avatar;
    user.avatars = data.avatars;
    user.timestamp = data.timestamp;
    user.followings = mappedFollowings;
    user.info = data.info;
    user.phoneNumber = data.phoneNumber;
    return user;
  }
}

module.exports = ZaloInterestedUserProvider;
