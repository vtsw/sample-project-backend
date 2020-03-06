const Dataloaders = require('dataloader');

module.exports = (req, appContenxt) => ({
  dataloaders: {
    messages: new Dataloaders((messageIds) => appContenxt.messageProvider
      .find({ _id: { $in: messageIds } })
      .then((messages) => messageIds.map((id) => messages.find((message) => message._id.equals(id))))),
    getMessageByUser: new Dataloaders(async (userIds) => {
      const messages = await appContenxt.messageProvider.find({ userId: { $in: userIds } });
      return userIds.map((id) => messages.filter((message) => message.userId.equals(id)));
    }),
    users: new Dataloaders((userIds) => appContenxt.userProvider
      .find({ _id: { $in: userIds } })
      .then((users) => userIds.map((id) => users.find((user) => user._id.equals(id))))),
  },
  req,
  ...appContenxt,
});
