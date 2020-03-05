module.exports = {
  User: {
    messages: (user, _, { dataloaders }) => dataloaders.getMessageByUser.load(user.id),
  },
};
