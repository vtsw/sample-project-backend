const { ObjectId } = require('mongodb');
const moment = require('moment');
const { ResourceNotFoundError, ResourceAlreadyExist } = require('../errors');
const User = require('./User');

class UserProvider {
  /**
   *
   * @param {Collection} users
   */
  constructor(users) {
    this.users = users;
  }

  /**
   *
   * @param {String} id
   * @returns {PromiseLike<any> | Promise<any>}
   */
  findById(id) {
    return this.users.findOne({ _id: ObjectId(id), deleted: false })
      .then(UserProvider.factory);
  }

  findByZaloOI(id) {
    return this.users.findOne({ 'ZaloOA.oaId': id, deleted: false })
      .then(UserProvider.factory);
  }

  /**
   *
   * @param {String} email
   * @returns {PromiseLike<any> | Promise<any>}
   */
  findByEmail(email) {
    return this.users.findOne({ email, deleted: false })
      .then(UserProvider.factory);
  }

  /**
   *
   * @param {Object} user
   * @returns {Promise<User>}
   */
  async create(user) {
    const inserted = await this.users.insertOne({
      email: user.email,
      name: user.name,
      password: user.password,
      deleted: false,
      lastModified: moment().format(),
      zaloOA: user.zaloOA,
    });
    return UserProvider.factory(inserted.ops[0]);
  }

  /**
   *
   * @param {Object} condition
   * @returns {Promise<T>}
   */
  async find(condition = { page: { limit: 10, skip: 0 }, query: {} }) {
    const users = await this.users
      .find(Object.assign(condition.query, { deleted: false }))
      .limit(condition.page.limit + 1).skip(condition.page.skip).toArray();
    const hasNext = (users.length === condition.page.limit + 1);
    if (hasNext) {
      users.pop();
    }
    return {
      hasNext,
      items: users.map((user) => UserProvider.factory(user)),
      total: users.length,
    };
  }

  /**
   *
   * @param id
   * @param userUpdate
   * @returns {Promise<User>}
   */
  async update(id, userUpdate) {
    const user = await this.findById(id);
    if (!user) {
      throw new ResourceNotFoundError('User', `id: ${id}`);
    }
    if (userUpdate.email && userUpdate.email !== user.email) {
      if (await this.findByEmail(userUpdate.email)) {
        throw new ResourceAlreadyExist('User', `email: ${userUpdate.email}`);
      }
    }
    const lastModified = moment().format();
    await this.users
      .updateOne({ _id: ObjectId(id) }, { $set: { ...userUpdate, lastModified } });
    return UserProvider.factory(Object.assign(user.toJson(), userUpdate, { lastModified }));
  }

  async delete(id) {
    return this.update(id, {
      deleted: true,
    });
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
    user.zaloOA = data.zaloOA;
    return user;
  }
}

module.exports = UserProvider;
