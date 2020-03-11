const { merge } = require('lodash');

const userResolver = require('./user/graphql/resolver');
const messageResolver = require('./message/graphql/resolver');

const baseResolver = {
  Mutation: {
    hello: (_, { name }) => `hello ${name}`,
  },
  Query: {
    hello: () => 'world',
  },
};

module.exports = merge(baseResolver, userResolver, messageResolver);
