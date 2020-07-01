const { asClass } = require('awilix');
const fetch = require('node-fetch');
const shajs = require('sha.js');
const ServiceProvider = require('../../ServiceProvider');
const ZaloMessageHandlerProvider = require('./ZaloEventHandlerProvider');
const UserSendTextEventHandler = require('./zaloEventHandlers/UserSendTextEventHandler');
const UserSendImageEventHandler = require('./zaloEventHandlers/UserSendImageEventHandler');
const OASendTextEventHandler = require('./zaloEventHandlers/OASendTextEventHandler');
const UserFollowOAEventHandler = require('./zaloEventHandlers/UserFollowOAEventHandler');
const UserUnfollowOAEventHandler = require('./zaloEventHandlers/UserUnfollowOAEventHandler');
const OASendImageEventHandler = require('./zaloEventHandlers/OASendImageEventHandler');
const OASendFileEventHandler = require('./zaloEventHandlers/OASendFileEventHandler');
const UserSendFileEventHandler = require('./zaloEventHandlers/UserSendFileEventHandler');
const UserShareInfoEventHandler = require('./zaloEventHandlers/UserShareInfoEventHandler');
const ZaloMessageSender = require('./ZaloMessageSender');
const ZaloUploader = require('./ZaloUploader');
const ZaloAuthenticator = require('./ZaloAuthenticator');

class ZaloServiceProvider extends ServiceProvider {
  register() {
    this.container.register('userSendTextEventHandler', asClass(UserSendTextEventHandler).singleton());
    this.container.register('userSendImageEventHandler', asClass(UserSendImageEventHandler).singleton());
    this.container.register('oASendTextEventHandler', asClass(OASendTextEventHandler).singleton());
    this.container.register('oASendImageEventHandler', asClass(OASendImageEventHandler).singleton());
    this.container.register('oASendFileEventHandler', asClass(OASendFileEventHandler).singleton());
    this.container.register('userSendFileEventHandler', asClass(UserSendFileEventHandler).singleton());
    this.container.register('userShareInfoEventHandler', asClass(UserShareInfoEventHandler).singleton());
    this.container.register('userFollowOAEventHandler', asClass(UserFollowOAEventHandler).inject(() => ({
      request: fetch,
    }))
      .singleton());
    this.container.register('userUnfollowOAEventHandler', asClass(UserUnfollowOAEventHandler).singleton());
    this.container.register('zaloMessageHandlerProvider', asClass(ZaloMessageHandlerProvider)
      .singleton());
    this.container.register('zaloMessageSender', asClass(ZaloMessageSender).inject((injectedContainer) => ({
      request: fetch,
      config: injectedContainer.resolve('config'),
    })).singleton());
    this.container.register('zaloUploader', asClass(ZaloUploader).inject((injectedContainer) => ({
      request: fetch,
      config: injectedContainer.resolve('config'),
    })).singleton());
    this.container.register('zaloAuthenticator', asClass(ZaloAuthenticator).inject(() => ({
      sha: shajs,
    })).singleton());
  }

  async boot() {
    const zaloMessageHandlerProvider = this.container.resolve('zaloMessageHandlerProvider');
    zaloMessageHandlerProvider.register(UserSendTextEventHandler.getEvent(), this.container.resolve('userSendTextEventHandler'));
    zaloMessageHandlerProvider.register(OASendTextEventHandler.getEvent(), this.container.resolve('oASendTextEventHandler'));
    zaloMessageHandlerProvider.register(UserFollowOAEventHandler.getEvent(), this.container.resolve('userFollowOAEventHandler'));
    zaloMessageHandlerProvider.register(UserUnfollowOAEventHandler.getEvent(), this.container.resolve('userUnfollowOAEventHandler'));
    zaloMessageHandlerProvider.register(UserSendFileEventHandler.getEvent(), this.container.resolve('userSendFileEventHandler'));
    zaloMessageHandlerProvider.register(OASendFileEventHandler.getEvent(), this.container.resolve('oASendFileEventHandler'));
    zaloMessageHandlerProvider.register(UserShareInfoEventHandler.getEvent(), this.container.resolve('userShareInfoEventHandler'));
    zaloMessageHandlerProvider.apply([OASendImageEventHandler.getEvent(), 'oa_send_gif'], this.container.resolve('oASendImageEventHandler'));
    zaloMessageHandlerProvider.apply([UserSendImageEventHandler.getEvent(), 'user_send_gif'], this.container.resolve('userSendImageEventHandler'));
  }
}

module.exports = ZaloServiceProvider;
