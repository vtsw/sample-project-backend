const jwt = require('jsonwebtoken');
const get = require('lodash.get');

module.exports = class Jwt {
  constructor(config) {
    this.authConfig = config.auth;
    this.options = {
      expiresIn: get(this.authConfig, 'jwt.expiresIn', '1d'),
    };
  }

  encode(payload) {
    return jwt.sign(payload, get(this.authConfig, 'jwt.privateKey'), 'privateKey');
  }

  decode(token) {
    return jwt.verify(token, this.authConfig.jwt.privateKey);
  }
};
