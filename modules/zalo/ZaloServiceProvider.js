const { asClass } = require('awilix');
const request = require('request');
const fetch = require('node-fetch');
const ServiceProvider = require('../../ServiceProvider');
const ZaloMessageHandlerProvider = require('../zalo/ZaloEventHandlerProvider');
const UserSendTextEventHandler = require('../zalo/zaloEventHandlers/UserSendTextEventHandler');
const UserSendImageEventHandler = require('../zalo/zaloEventHandlers/UserSendImageEventHandler');
const OASendTextEventHandler = require('../zalo/zaloEventHandlers/OASendTextEventHandler');
const UserFollowOAEventHandler = require('../zalo/zaloEventHandlers/UserFollowOAEventHandler');
const OASendImageEventHandler = require('../zalo/zaloEventHandlers/OASendImageEventHandler');
const ZaloMessageSender = require('./ZaloMessageSender');
const ZaloInterestedUserProvider = require('../zalo/ZaloInterestedUserProvider');
const ZaloUploader = require('../zalo/ZaloUploader');

class ZaloServiceProvider extends ServiceProvider {
  register() {
    this.container.register('userSendTextEventHandler', asClass(UserSendTextEventHandler).singleton());
    this.container.register('userSendImageEventHandler', asClass(UserSendImageEventHandler).singleton());
    this.container.register('oASendTextEventHandler', asClass(OASendTextEventHandler).singleton());
    this.container.register('oASendImageEventHandler', asClass(OASendImageEventHandler).singleton());
    this.container.register('userFollowOAEventHandler', asClass(UserFollowOAEventHandler).inject((injectedContainer) => ({
      http: fetch,
      zaloInterestedUserProvider: injectedContainer.resolve('zaloInterestedUserProvider'),
      userProvider: injectedContainer.resolve('userProvider'),
      config: injectedContainer.resolve('config'),
    }))
      .singleton());
    this.container.register('zaloMessageHandlerProvider', asClass(ZaloMessageHandlerProvider)
      .singleton());
    this.container.register('zaloMessageSender', asClass(ZaloMessageSender).inject((injectedContainer) => ({
      http: fetch,
      config: injectedContainer.resolve('config'),
    })).singleton());
    this.container.register('zaloInterestedUserProvider', asClass(ZaloInterestedUserProvider)
      .inject((injectedContainer) => ({ zaloInterestedUsers: injectedContainer.resolve('db').collection('zaloInterestedUsers') }))
      .singleton());
    this.container.register('zaloUploader', asClass(ZaloUploader).inject((injectedContainer) => ({
      request,
      config: injectedContainer.resolve('config'),
    })).singleton());
  }

  async boot() {
    const zaloMessageHandlerProvider = this.container.resolve('zaloMessageHandlerProvider');
    zaloMessageHandlerProvider.register(UserSendTextEventHandler.getEvent(), this.container.resolve('userSendTextEventHandler'));
    zaloMessageHandlerProvider.register(OASendTextEventHandler.getEvent(), this.container.resolve('oASendTextEventHandler'));
    zaloMessageHandlerProvider.register(UserFollowOAEventHandler.getEvent(), this.container.resolve('userFollowOAEventHandler'));
    zaloMessageHandlerProvider.register(OASendImageEventHandler.getEvent(), this.container.resolve('oASendImageEventHandler'));
    zaloMessageHandlerProvider.register(UserSendImageEventHandler.getEvent(), this.container.resolve('userSendImageEventHandler'));
  }
}

module.exports = ZaloServiceProvider;
