const { AuthenticationError } = require('../errors');

class Authenticator {
  /**
   *
   * @param {JWT} jwt
   */
  constructor(jwt) {
    this.jwt = jwt;
  }

  /**
   *
   * @param token
   * @returns {User}
   */
  verify(token) {
    try {
      return this.jwt.decode(token);
    } catch (err) {
      throw new AuthenticationError('Invalid token', err);
    }
  }
}

module.exports = Authenticator;
