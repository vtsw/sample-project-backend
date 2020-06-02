const { asFunction } = require('awilix');
const ServiceProvider = require('../../ServiceProvider');
const zaloSocialAccount = require('./model/ZaloSocialAccount');

class ZaloOfficialAccountServiceProvider extends ServiceProvider {
  register() {
    const { container } = this;
    container.register('zaloSocialProvider', asFunction(() => container.resolve('db')
      .model('ZaloSocialAccount', zaloSocialAccount, 'zaloSocialAccounts'))
      .singleton());
  }
}

module.exports = ZaloOfficialAccountServiceProvider;
