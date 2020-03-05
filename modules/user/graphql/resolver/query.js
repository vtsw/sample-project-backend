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
};
