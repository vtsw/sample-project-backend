const UserProvider = require('./UserProvider');
const { AuthenticationError } = require('../errors');

class Authenticator {
  /**
   *
   * @param {Bcrypt} bcrypt
   * @param {UserProvider} userProvider
   * @param {JWT} jwt
   */
  constructor(bcrypt, userProvider, jwt) {
    this.bcrypt = bcrypt;
    this.userProvider = userProvider;
    this.jwt = jwt;
  }

  /**
   *
   * @param {String} email
   * @param {String} password
   * @returns {Promise<{token: string | Uint8Array}>}
   */
  async login(email, password) {
    const user = await this.userProvider.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('User or password is invalid.');
    }
    if (!this.bcrypt.compare(password, user.password)) {
      throw new AuthenticationError('User or password is invalid.');
    }
    return {
      token: this.jwt.encode(user.toJson()),
    };
  }

  /**
   *
   * @param {String} token
   * @returns {Promise<User>}
   */
  async verify(token) {
    const payload = this.jwt.decode(token);
    if (!payload) {
      throw new AuthenticationError('Invalid token');
    }
    return UserProvider.factory(payload);
  }

  /**
   *
   * @param {Object} user
   * @returns {Promise<User>}
   */
  async register(user) {
    if (await this.userProvider.findByEmail(user.email)) {
      throw new AuthenticationError('The email already exists.');
    }
    const newUser = { ...user };
    newUser.password = await this.createPassword(newUser.password);
    return this.userProvider.create(newUser);
  }

  createPassword(textPassword) {
    return this.bcrypt.hash(textPassword, 10);
  }
}

module.exports = Authenticator;
