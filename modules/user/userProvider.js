const { ObjectId } = require('mongodb');
const User = require('../user/user');

class UserProvider {
  /**
   *
   * @param {Collection} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   *
   * @param {String} id
   * @returns {PromiseLike<any> | Promise<any>}
   */
  findById(id) {
    return this.db.findOne({ _id: ObjectId(id) })
      .then(UserProvider.factory);
  }

  /**
   *
   * @param {String} email
   * @returns {PromiseLike<any> | Promise<any>}
   */
  findByEmail(email) {
    return this.db.findOne({ email })
      .then(UserProvider.factory);
  }

  /**
   *
   * @param {Object} user
   * @returns {Promise<User>}
   */
  async create(user) {
    const inserted = await this.db.insertOne({
      email: user.email,
      name: user.name,
      password: user.password,
    });
    return UserProvider.factory(inserted.ops[0]);
  }

  /**
   *
   * @param {Object} condition
   * @returns {Promise<T>}
   */
  find(condition) {
    return this.db.find(condition)
      .toArray()
      .then((users) => users.map(UserProvider.factory));
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
    const user = new User(rawData._id);
    user.password = rawData.password;
    user.email = rawData.email;
    user.name = rawData.name;
    return user;
  }
}

module.exports = UserProvider;
