const mongodb = require('../../services/mongodb');
const minio = require('../../services/minio');
const UserProvider = require('../../modules/user/UserProvider');
const MessageProvider = require('../../modules/message/MessageProvider');
const Bcrypt = require('../../services/bcrypt');
const JWT = require('../../services/jwt');
const config = require('../../config');
const Authenticator = require('../../modules/user/Authenticator');
const winston = require('../../services/winston');
const mutationRecorder = require('../../services/mutationRecorder');

module.exports = async () => {
  const context = {};
  context.db = (await mongodb(config)).db(config.mongodb.dbname);
  context.minio = minio(config);
  context.userProvider = new UserProvider(context.db.collection('users'));
  context.messageProvider = new MessageProvider(context.db.collection('messages'));
  context.bcrypt = new Bcrypt(config);
  context.jwt = new JWT(config);
  context.authService = new Authenticator(context.bcrypt, context.userProvider, context.jwt);
  context.logger = winston;
  return context;
};
