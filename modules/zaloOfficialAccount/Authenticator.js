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
      console.log('jwt', this.jwt);
      const decodedToken = this.jwt.decode(token);
      console.log('decodedToken', decodedToken);
      return decodedToken;
    } catch (err) {
      console.log(err);
      throw new AuthenticationError('Invalid token', err);
    }
  }
}

module.exports = Authenticator;
