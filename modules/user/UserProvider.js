const { ObjectId } = require('mongodb');
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
    return this.users.findOne({ email })
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
    });
    return UserProvider.factory(inserted.ops[0]);
  }

  /**
   *
   * @param {Object} condition
   * @returns {Promise<T>}
   */
  find(condition = { page: { limit: 10, skip: 0 }, query: {} }) {
    return this.users
      .find(Object.assign(condition.query, { deleted: false }))
      .limit(condition.page.limit).skip(condition.page.skip)
      .toArray()
      .then((users) => users.map(UserProvider.factory));
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
   * @param condition
   * @returns {Promise<{total: *, hasNext: boolean, items: T}>}
   */
  async findWithPagination(condition = { page: { limit: 10, skip: 0 }, query: {} }) {
    let hasNext = false;
    const users = await this.find({ ...condition, page: { limit: condition.page.limit + 1, skip: condition.page.skip } });
    if (users.length > condition.page.limit) {
      hasNext = true;
      users.pop();
    }
    return {
      items: users,
      total: users.length,
      hasNext,
    };
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
    return user;
  }
}

module.exports = UserProvider;
