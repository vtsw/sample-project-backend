const Dataloaders = require('dataloader');
const mongodb = require('./services/mongodb');
const minio = require('./services/minio');
const UserProvider = require('./modules/user/userProvider');
const MessageProvider = require('./modules/message/messageProvider');
const Bcrypt = require('./services/bcrypt');
const JWT = require('./services/jwt');
const config = require('./config');
const AuthenticationService = require('./modules/user/authenticationService');

module.exports = async () => {
  const context = {};
  context.db = (await mongodb(config)).db('simple_db');
  context.minio = minio(config);
  context.userProvider = new UserProvider(context.db);
  context.messageProvider = new MessageProvider(context.db);
  context.bcrypt = new Bcrypt(config);
  context.jwt = new JWT(config);
  context.authenService = new AuthenticationService(context.bcrypt, context.userProvider, context.jwt);
  context.dataloaders = {
    messages: new Dataloaders((messageIds) => context.messageProvider
      .find({ _id: { $in: messageIds } })
      .then((messages) => messageIds.map((id) => messages.find((message) => message._id.equals(id))))),
    getMessageByUser: new Dataloaders(async (userIds) => {
      const messages = await context.messageProvider.find({ userId: { $in: userIds } });
      return userIds.map((id) => messages.filter((message) => message.userId.equals(id)));
    }),
    users: new Dataloaders((userIds) => context.userProvider
      .find({ _id: { $in: userIds } })
      .then((users) => userIds.map((id) => users.find((user) => user._id.equals(id))))),
  };

  return context;
};
