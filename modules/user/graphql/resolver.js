const { isEmpty, pickBy, identity } = require('lodash');
const { createUser, updateUser, login } = require('../validationSchema');

module.exports = {
  Query: {
    user: (_, { id }, { userProvider }) => userProvider.findById(id),
    me: (_, args, { userProvider, req }) => userProvider.findById(req.user.id),
    userList: async (_, args, { userProvider }) => {
      if (isEmpty(args)) {
        return userProvider
          .find({ query: { }, page: { limit: 10, skip: 0 } });
      }
      const { query: { searchText, limit, skip } } = args;
      const pattern = !isEmpty(searchText) ? new RegExp(`${searchText}`) : null;
      return userProvider
        .find({ query: pattern ? { $or: [{ name: pattern }, { email: pattern }] } : {}, page: { limit, skip } });
    },
  },
  Mutation: {
    createUser: {
      validationSchema: createUser,
      resolve: (_, { user }, { authService }) => authService.register(user),
    },
    login: {
      validationSchema: login,
      resolve: (_, { user }, { authService }) => authService.login(user.email, user.password),
    },
    updateUser: {
      validationSchema: updateUser,
      resolve: async (_, { user }, { userProvider, authService }) => {
        if (user.password) {
          // eslint-disable-next-line no-param-reassign
          user.password = await authService.createPassword(user.password);
        }
        return userProvider.update(user.id, user);
      },
    },
    deleteUser: (_, { id }, { userProvider }) => userProvider.delete(id),
  },
  User: {
    messages: (user, args, { messageProvider }) => {
      if (isEmpty(args)) {
        return messageProvider
          .find({ query: { userId: user.id }, page: { limit: 10, skip: 0 } });
      }
      const { query: { searchText, limit, skip } } = args;
      const content = !isEmpty(searchText) ? new RegExp(`${searchText}`) : null;
      return messageProvider
        .find({ query: pickBy({ userId: user.id, content }, identity), page: { limit, skip } });
    },
  },
};
