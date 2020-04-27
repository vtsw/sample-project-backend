const jwt = require('jsonwebtoken');
const get = require('lodash.get');

module.exports = class Jwt {
  /**
   *
   * @param config
   */
  constructor(config) {
    this.authConfig = config.auth;
    this.options = {
      expiresIn: get(this.authConfig, 'jwt.expiresIn', '1d'),
    };
  }

  /**
   *
   * @param payload
   * @returns {String|*}
   */
  encode(payload) {
    return jwt.sign(payload, get(this.authConfig, 'jwt.privateKey', 'privateKey'));
  }

  /**
   *
   * @param token
   * @returns {*}
   */
  decode(token) {
    return jwt.verify(token, this.authConfig.jwt.privateKey);
  }
};
