const { asClass, asFunction } = require('awilix');
const ServiceProvider = require('../../ServiceProvider');
const Authenticator = require('./Authenticator');
const zaloOAUser = require('./models/ZaloOAUser');


class ZaloOfficialAccountServiceProvider extends ServiceProvider {
  register() {
    const { container } = this;
    container.register('authService', asClass(Authenticator).singleton());
    container.register('zaloOAProvider', asFunction(() => container.resolve('db')
      .model('ZaloOfficialAccount', zaloOAUser, 'zaloOfficialAccounts'))
      .singleton());
  }
}

module.exports = ZaloOfficialAccountServiceProvider;
