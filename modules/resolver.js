const { merge } = require('lodash');

const userResolver = require('./user/graphql/resolver');
const messageResolver = require('./message/graphql/resolver');

const baseResolver = {
  Mutation: {

  },
  Query: {
    foo: () => 'Bar',
  },
};

module.exports = merge(baseResolver, userResolver, messageResolver);
