const { asClass } = require('awilix');
const fetch = require('node-fetch');
const ServiceProvider = require('../../ServiceProvider');
const ZaloMessageHandlerProvider = require('../zalo/ZaloEventHandlerProvider');
const UserSendTextEventHandler = require('../zalo/zaloEventHandlers/UserSendTextEventHandler');
const UserSendImageEventHandler = require('../zalo/zaloEventHandlers/UserSendImageEventHandler');
const OASendTextEventHandler = require('../zalo/zaloEventHandlers/OASendTextEventHandler');
const UserFollowOAEventHandler = require('../zalo/zaloEventHandlers/UserFollowOAEventHandler');
const OASendImageEventHandler = require('../zalo/zaloEventHandlers/OASendImageEventHandler');
const OASendFileEventHandler = require('../zalo/zaloEventHandlers/OASendFileEventHandler');
const UserSendFileEventHandler = require('../zalo/zaloEventHandlers/UserSendFileEventHandler');
const UserShareInfoEventHandler = require('../zalo/zaloEventHandlers/UserShareInfoEventHandler');
const ZaloMessageSender = require('./ZaloMessageSender');
const ZaloInterestedUserProvider = require('../zalo/ZaloInterestedUserProvider');
const ZaloUploader = require('../zalo/ZaloUploader');

class ZaloServiceProvider extends ServiceProvider {
  register() {
    this.container.register('userSendTextEventHandler', asClass(UserSendTextEventHandler).singleton());
    this.container.register('userSendImageEventHandler', asClass(UserSendImageEventHandler).singleton());
    this.container.register('oASendTextEventHandler', asClass(OASendTextEventHandler).singleton());
    this.container.register('oASendImageEventHandler', asClass(OASendImageEventHandler).singleton());
    this.container.register('oASendFileEventHandler', asClass(OASendFileEventHandler).singleton());
    this.container.register('userSendFileEventHandler', asClass(UserSendFileEventHandler).singleton());
    this.container.register('userShareInfoEventHandler', asClass(UserShareInfoEventHandler).singleton());
    this.container.register('userFollowOAEventHandler', asClass(UserFollowOAEventHandler).inject((injectedContainer) => ({
      request: fetch,
      zaloInterestedUserProvider: injectedContainer.resolve('zaloInterestedUserProvider'),
      userProvider: injectedContainer.resolve('userProvider'),
      config: injectedContainer.resolve('config'),
    }))
      .singleton());
    this.container.register('zaloMessageHandlerProvider', asClass(ZaloMessageHandlerProvider)
      .singleton());
    this.container.register('zaloMessageSender', asClass(ZaloMessageSender).inject((injectedContainer) => ({
      request: fetch,
      config: injectedContainer.resolve('config'),
    })).singleton());
    this.container.register('zaloInterestedUserProvider', asClass(ZaloInterestedUserProvider)
      .inject((injectedContainer) => ({ zaloInterestedUsers: injectedContainer.resolve('db').collection('zaloInterestedUsers') }))
      .singleton());
    this.container.register('zaloUploader', asClass(ZaloUploader).inject((injectedContainer) => ({
      request: fetch,
      config: injectedContainer.resolve('config'),
    })).singleton());
  }

  async boot() {
    const zaloMessageHandlerProvider = this.container.resolve('zaloMessageHandlerProvider');
    zaloMessageHandlerProvider.register(UserSendTextEventHandler.getEvent(), this.container.resolve('userSendTextEventHandler'));
    zaloMessageHandlerProvider.register(OASendTextEventHandler.getEvent(), this.container.resolve('oASendTextEventHandler'));
    zaloMessageHandlerProvider.register(UserFollowOAEventHandler.getEvent(), this.container.resolve('userFollowOAEventHandler'));
    zaloMessageHandlerProvider.register(UserSendFileEventHandler.getEvent(), this.container.resolve('userSendFileEventHandler'));
    zaloMessageHandlerProvider.register(OASendFileEventHandler.getEvent(), this.container.resolve('oASendFileEventHandler'));
    zaloMessageHandlerProvider.register(UserShareInfoEventHandler.getEvent(), this.container.resolve('userShareInfoEventHandler'));
    zaloMessageHandlerProvider.apply([OASendImageEventHandler.getEvent(), 'oa_send_gif'], this.container.resolve('oASendImageEventHandler'));
    zaloMessageHandlerProvider.apply([UserSendImageEventHandler.getEvent(), 'user_send_gif'], this.container.resolve('userSendImageEventHandler'));
  }
}

module.exports = ZaloServiceProvider;
