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
    foo: String
  }

  type Mutation {
    bar: String
  }
`;

const typeDefs = [baseTypeDefs, UserTypeDefs, MessageTypeDefs];
module.exports = mergeTypes(typeDefs, { all: true });
