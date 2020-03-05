const gql = require('graphql-tag');
const { mergeTypes } = require('merge-graphql-schemas');

const UserTypeDefs = require('./user/graphql/typedef');
const MessageTypeDefs = require('./message/graphql/typedef');

const baseTypeDefs = gql`

  directive @isAuthenticated on FIELD_DEFINITION
  
  scalar Date

  type AuthPayload {
    token: String!
  }

  type Query {
    me: User @isAuthenticated
  }

  type Mutation {
    _empty: String
  }
`;

const typeDefs = [baseTypeDefs, UserTypeDefs, MessageTypeDefs];
const mergedTypeDefs = [].concat.apply([], typeDefs);
module.exports = mergeTypes(mergedTypeDefs, { all: true });
