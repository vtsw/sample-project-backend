module.exports = {
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
  },
  Mutation: {
    createMessage: (source, { message }, { messageProvider }) => messageProvider.create(message),
    createUser: (_, { user }, { authenService }) => authenService.register(user),
  },
  User: {
    messages: (user, _, { messageProvider }) => {
      messageProvider.find({ userId: user.id });
    },
  },
};
