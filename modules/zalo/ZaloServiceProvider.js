const { asClass } = require('awilix');
const fetch = require('node-fetch');
const ServiceProvider = require('../../ServiceProvider');
const ZaloMessageHandlerProvider = require('../zalo/ZaloEventHandlerProvider');
const UserSendTextEventHandler = require('../zalo/zaloEventHandlers/UserSendTextEventHandler');
const OASendTextEventHandler = require('../zalo/zaloEventHandlers/OASendTextEventHandler');
const ZaloMessageBroker = require('../zalo/ZaloMessageBroker');

class ZaloServiceProvider extends ServiceProvider {
  register() {
    this.container.register('userSendTextEventHandler', asClass(UserSendTextEventHandler).singleton());
    this.container.register('oASendTextEventHandler', asClass(OASendTextEventHandler).singleton());
    this.container.register('ZaloMessageHandlerProvider', asClass(ZaloMessageHandlerProvider).singleton());
    this.container.register('zaloMessageBroker', asClass(ZaloMessageBroker).inject((injectedContainer) => ({
      http: fetch,
      config: injectedContainer.resolve('config'),
    })));
  }

  async boot() {
    const zaloMessageHandlerProvider = this.container.resolve('ZaloMessageHandlerProvider');
    zaloMessageHandlerProvider.register(UserSendTextEventHandler.getEvent(), this.container.resolve('userSendTextEventHandler'));
    zaloMessageHandlerProvider.register(OASendTextEventHandler.getEvent(), this.container.resolve('oASendTextEventHandler'));
  }
}

module.exports = ZaloServiceProvider;
