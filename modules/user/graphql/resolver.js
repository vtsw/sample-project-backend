const { isEmpty, pickBy, identity } = require('lodash');
const Joi = require('@hapi/joi');

module.exports = {
  Query: {
    user: (_, { id }, { userProvider }) => userProvider.findById(id),
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
      validationSchema: Joi.object({
        user: Joi.object({
          email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
          password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
          name: Joi.string().alphanum().min(3).max(255)
            .required(),
        }),
      }),
      resolve: (_, { user }, { authService }) => authService.register(user),
    },
    login: {
      validationSchema: Joi.object({
        user: Joi.object({
          email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
          password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        }),
      }),
      resolve: (_, { user }, { authService }) => authService.login(user.email, user.password),
    },
    updateUser: {
      validationSchema: Joi.object({
        user: Joi.object({
          id: Joi.string().required(),
          email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
          name: Joi.string().alphanum().min(3).max(255),
          password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        }),
      }),
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
