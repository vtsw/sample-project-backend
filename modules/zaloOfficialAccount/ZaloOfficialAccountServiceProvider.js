const { asClass, asFunction } = require('awilix');
const ServiceProvider = require('../../ServiceProvider');
const Authenticator = require('./Authenticator');
const zaloOAUser = require('./models/ZaloOAUser');


class ZaloOfficialAccountServiceProvider extends ServiceProvider {
  register() {
    this.container.register('authService', asClass(Authenticator).singleton());
  }

  async boot() {
    const db = this.container.resolve('db');
    this.container.register('zaloOAProvider', asFunction(() => db.model('ZaloOfficialAccount', zaloOAUser, 'zaloOfficialAccounts')).singleton());
  }
}

module.exports = ZaloOfficialAccountServiceProvider;
