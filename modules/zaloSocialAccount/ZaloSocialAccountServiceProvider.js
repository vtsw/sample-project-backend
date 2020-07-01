const { asFunction } = require('awilix');
const ServiceProvider = require('../../ServiceProvider');
const zaloSocialAccount = require('./model/ZaloSocialAccount');

class ZaloSAServiceProvider extends ServiceProvider {
  register() {
    const { container } = this;
    container.register('zaloSAProvider', asFunction(() => container.resolve('db')
      .model('ZaloSocialAccount', zaloSocialAccount, 'zaloSocialAccounts'))
      .singleton());
  }
}

module.exports = ZaloSAServiceProvider;
