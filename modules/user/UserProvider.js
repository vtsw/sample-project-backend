const { ObjectId } = require('mongodb');
const moment = require('moment');
const { ResourceNotFoundError } = require('../errors');
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
    const { result } = await this.users
      .updateOne({ _id: ObjectId(id) }, { $set: userUpdate, $currentDate: { lastModified: true } });
    if (result.ok !== 1) {
      throw new Error(`Update fail with id: ${id}`);
    }
    return UserProvider.factory({ ...user.toJson(), ...userUpdate });
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
    const user = new User(rawData._id || rawData.id);
    user.password = rawData.password;
    user.email = rawData.email;
    user.name = rawData.name;
    user.lastModified = rawData.lastModified;
    user.avatar = rawData.avatar;
    return user;
  }
}

module.exports = UserProvider;
