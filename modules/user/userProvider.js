const { ObjectId } = require('mongodb');
const User = require('./user');

class UserProvider {
  constructor(db) {
    this.db = db.collection('users');
  }

  findById(id) {
    return this.db.findOne({ _id: ObjectId(id) }).then(UserProvider.factory);
  }

  findByCredential(credential) {
    return this.db.findOne({ email: credential }).then(UserProvider.factory);
  }

  async create(user) {
    const inserted = await this.db.insertOne({
      email: user.email,
      name: user.name,
      password: user.password,
    });
    return UserProvider.factory(inserted.ops[0]);
  }

  find(condition) {
    return this.db.find(condition).toArray().then((users) => users.map(UserProvider.factory));
  }

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
