const { asClass, asValue, asFunction } = require('awilix');
const container = require('./container');
const mongodb = require('./services/mongodb');
const minio = require('./services/minio');
const UserProvider = require('./modules/user/UserProvider');
const MessageProvider = require('./modules/message/MessageProvider');
const CustomerProvider = require('./modules/customer/CustomerProvider');
const ClerverZaloBindingProvider = require('./modules/zalo/clever-zalo-binding/CleverZaloBindingProvider');
const ZaloCleverAppProvider = require('./modules/zalo/zalo-clever-app/ZaloCleverAppProvider');
const ZaloOAProvider = require('./modules/zalo/zalo-oa/ZaloOAProvider');
const zaloSocialAccountProvider = require('./modules/customer/zalo-social-account/zaloSocialAccountProvider');
const ZaloProvider = require('./modules/zalo/ZaloProvider');
const Bcrypt = require('./services/bcrypt');
const JWT = require('./services/jwt');
const config = require('./config');
const Authenticator = require('./modules/user/Authenticator');
const winston = require('./services/winston');


/**
 * ensures all essential modules are already available before lunching app.
 * @returns {Promise<container>}
 */
module.exports = async () => {
  const db = (await mongodb(config)).db('simple_db');

  const baseContainer = {
    db: asValue(db),
    config: asValue(config),
    minio: asFunction(minio).singleton(),
    jwt: asClass(JWT).singleton(),
    bcrypt: asClass(Bcrypt).singleton(),
    authService: asClass(Authenticator).singleton(),
    logger: asValue(winston),
  };

  const daoContainer = {
    userProvider: asClass(UserProvider).inject((injectedContainer) => ({ users: injectedContainer.resolve('db').collection('users') })).singleton(),
    messageProvider: asClass(MessageProvider)
      .inject((injectedContainer) => ({ messages: injectedContainer.resolve('db').collection('messages') })).singleton(),
    zaloOAProvider: asClass(ZaloOAProvider)
      .inject((injectedContainer) => ({ zaloOA: injectedContainer.resolve('db').collection('zaloOA') })).singleton(),
    cleverZaloBindingProvider: asClass(ClerverZaloBindingProvider)
      .inject((injectedContainer) => ({ cleverZaloBinding: injectedContainer.resolve('db').collection('cleverZaloBinding') })).singleton(),
    zaloCleverAppProvider: asClass(ZaloCleverAppProvider)
      .inject((injectedContainer) => ({ zaloCleverApp: injectedContainer.resolve('db').collection('zaloCleverApp') })).singleton(),
    zaloSocialAccountProvider: asClass(zaloSocialAccountProvider)
      .inject((injectedContainer) => ({ zaloSocialAccount: injectedContainer.resolve('db').collection('zaloSocialAccount ') })).singleton(),
  };

  const repositoryContainer = {
    zaloProvider: asClass(ZaloProvider)
      .inject((injectedContainer) => ({
        zalos: injectedContainer.resolve('db').collection('zalo'),
        zaloOAs: container.resolve('zaloOAProvider'),
        cleverZaloBindings: container.resolve('cleverZaloBindingProvider'),
        zaloCleverApps: container.resolve('zaloCleverAppProvider'),
      })).transient,
    customerProvider: asClass(CustomerProvider)
      .inject((injectedContainer) => ({
        customers: injectedContainer.resolve('db').collection('customers'),
        zaloSocialAccount: container.resolve('zaloSocialAccountProvider'),
      })).singleton(),
  }
  container.register({
    ...baseContainer,
    ...daoContainer,
    ...repositoryContainer,
  });

  return container;
};
