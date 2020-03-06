const { merge } = require('lodash');

const userResolver = require('./user/graphql/resolver');
const messageResolver = require('./message/graphql/resolver');

const baseResolver = {
  Mutation: {
    login: (_, { user }, { authService }) => authService.login(user.email, user.password),
  },
  Query: {
    me: (_, args, { req }) => req.user,
  },
};

module.exports = merge(baseResolver, userResolver, messageResolver);
