const gql = require('graphql-tag');
const { mergeTypes } = require('merge-graphql-schemas');

const UserTypeDefs = require('./user/graphql/typedef');
const MessageTypeDefs = require('./message/graphql/typedef');

const baseTypeDefs = gql`

  directive @isAuthenticated on FIELD_DEFINITION
  
  scalar Date

  interface Paginatable {
    hasNext: Boolean
    total: Int
  }

  type AuthPayload {
    token: String!
  }

  type Query {
    hello: String
  }

  type Mutation {
    hello(name: String): String
  }
`;

const typeDefs = [baseTypeDefs, UserTypeDefs, MessageTypeDefs];
module.exports = mergeTypes(typeDefs, { all: true });
