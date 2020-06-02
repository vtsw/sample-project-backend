const { merge } = require('lodash');
const { GraphQLUpload } = require('graphql-upload');
const zaloOAResolvers = require('./zaloOfficialAccount/graphql/resolver');
const zaloMessageResolver = require('./zaloMessage/graphql/resolver');
const zaloResolver = require('./zalo/graphql/resolver');

const baseResolver = {
  Upload: GraphQLUpload,
  Mutation: {
    hello: (_, { name }) => `hello ${name}`,
  },
  Query: {
    hello: () => 'world',
  },
};

module.exports = merge(baseResolver, zaloOAResolvers, zaloMessageResolver, zaloResolver);
