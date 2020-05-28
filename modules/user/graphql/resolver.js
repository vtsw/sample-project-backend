const { isEmpty, pickBy, identity } = require('lodash');
const { createUser, updateUser, login } = require('../validationSchema');

module.exports = {
  Query: {
    user: (_, { id }, { container }) => container.resolve('userProvider').findById(id),
    me: (_, args, { container, req }) => container.resolve('userProvider').findById(req.user.id),
    userList: async (_, args, { container }) => {
      const userProvider = container.resolve('userProvider');
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
      resolve: (_, { user }, { container }) => container.resolve('authService').register(user),
    },
    login: {
      validationSchema: login,
      resolve: (_, { user }, { container }) => container.resolve('authService').login(user.email, user.password),
    },
    updateUser: {
      validationSchema: updateUser,
      resolve: async (_, args, { container }) => {
        const { user } = args;
        if (user.password) {
          user.password = await container.resolve('authService').createPassword(user.password);
        }
        return container.resolve('userProvider').update(user.id, user);
      },
    },
    deleteUser: (_, { id }, { container }) => container.resolve('userProvider').delete(id),
  },
  User: {
    followers: (user, args, { container }) => {
      const zaloInterestedUserProvider = container.resolve('zaloInterestedUserProvider');
      if (isEmpty(args)) {
        return zaloInterestedUserProvider
          .find({ query: { following: user.id }, page: { limit: 10, skip: 0 } });
      }
      const { query: { limit, skip } } = args;
      return zaloInterestedUserProvider.find({ query: { following: user.id }, page: { limit, skip } });
    },
  },
};
