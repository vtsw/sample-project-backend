const { isEmpty } = require('lodash');

module.exports = {
  Query: {
    user: (_, { id }, { userProvider }) => userProvider.findById(id),
    userList: async (_, { query: { searchText, limit, skip } }, { userProvider }) => {
      const pattern = isEmpty(searchText) ? new RegExp(`${searchText}`) : {};
      return userProvider.findWithPagination({ query: { $or: [{ name: pattern }, { email: pattern }] }, page: { limit, skip } });
    },
  },
  Mutation: {
    createUser: (_, { user }, { authService }) => authService.register(user),
    login: (_, { user }, { authService }) => authService.login(user.email, user.password),
  },
  User: {
    messages: (user, args, { messageProvider }) => {
      if (isEmpty(args)) {
        return messageProvider
          .findWithPagination({ query: { }, page: { limit: 10, skip: 0 } });
      }
      const { query: { searchText, limit, skip } } = args;
      const content = isEmpty(searchText) ? new RegExp(`${searchText}`) : {};
      return messageProvider
        .findWithPagination({ query: { content }, page: { limit, skip } });
    },
  },
};
