const { ObjectId } = require('mongodb');
const moment = require('moment');
const { ResourceNotFoundError } = require('../errors');
const User = require('./ZaloInterestedUser');

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
   * @param id
   * @returns {Promise<void> | * | PromiseLike<any> | Promise<any>}
   */
  findByZaloId(id) {
    return this.zaloInterestedUsers.findOne({ zaloId: id })
      .then(ZaloInterestedUserProvider.factory);
  }

  /**
   *
   * @param id
   * @returns {Promise<void> | * | PromiseLike<any> | Promise<any>}
   */
  findByOAFollowerId(followId) {
    return this.zaloInterestedUsers.findOne({followings:  { $elemMatch: { OAFollowerId: followId } }})
       .then(ZaloInterestedUserProvider.factory);
  }

  /**
   *
   * @param {Object} user
   * @returns {Promise<ZaloInterestedUser>}
   */
  async create(user) {
    const inserted = await this.zaloInterestedUsers.insertOne({
      zaloId: user.zaloId,
      displayName: user.displayName,
      dob: user.dob,
      gender: user.gender,
      avatar: user.avatar,
      avatars: user.avatars,
      lastModified: moment().format(),
      timestamp: user.timestamp,
      followings: user.followings,
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
      query = { ...condition.query, 'followings.id': query.following };
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
    const user = new User(data._id || data.id);
    user.displayName = data.displayName;
    user.dob = data.dob;
    user.gender = data.gender;
    user.lastModified = data.lastModified;
    user.avatar = data.avatar;
    user.avatars = data.avatars;
    user.timestamp = data.timestamp;
    user.followings = data.followings;
    user.info = data.info;
    user.zaloId = data.zaloId;
    return user;
  }
}

module.exports = ZaloInterestedUserProvider;
