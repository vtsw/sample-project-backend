const { asClass } = require('awilix');
const ServiceProvider = require('../../ServiceProvider');
const ZaloMessageProvider = require('./ZaloMessageProvider');

class ZaloMessageServiceProvider extends ServiceProvider {
  register() {
    this.container.register({
      zaloMessageProvider: asClass(ZaloMessageProvider)
        .inject((injectedContainer) => ({ messages: injectedContainer.resolve('db').collection('zaloMessages') })).singleton(),
    });
  }
}

module.exports = ZaloMessageServiceProvider;
