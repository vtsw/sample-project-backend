module.exports = {
  Mutation: {
    createMessage: (source, { message }, { messageProvider }) => messageProvider.create(message),
    createUser: (_, { user }, { authenService }) => authenService.register(user),
    login: (_, { user }, { authenService }) => authenService.login(user.email, user.password),
    updateMessage: (_, { message }, { messageProvider }) => messageProvider.update(message.id, message),
    deleteMessage: (_, { id }, { messageProvider }) => messageProvider.delete(id),
  },
  Query: {
    user: (_, { id }, { userProvider }) => userProvider.findById(id),
    userList: async (_, args, { userProvider }) => {
      const users = await userProvider.find(args);
      return {
        users,
        total: users.length,
        hasNext: true,
      };
    },
    me: (_, args, { req }) => req.user,
    message: (_, { id }, { messageProvider }) => messageProvider.findById(id),
    messageList: async (args, { messageProvider }) => {
      const messages = await messageProvider.find();
      return {
        messages,
        total: messages.length,
        hasNext: true,
      };
    },
  },
  User: {
    messages: (user, _, { dataloaders }) => dataloaders.getMessageByUser.load(user.id),
  },
};
