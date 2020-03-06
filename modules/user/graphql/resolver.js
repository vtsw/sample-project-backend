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
    me: (_, args, { req }) => req.user,
  },
  Mutation: {
    createUser: (_, { user }, { authService }) => authService.register(user),
    login: (_, { user }, { authService }) => authService.login(user.email, user.password),
  },
  User: {
    messages: (user, _, { messageProvider }) => {
      messageProvider.find({ userId: user.id });
    },
  },
};
