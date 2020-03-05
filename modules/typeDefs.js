const gql = require('graphql-tag');
const { makeExecutableSchema } = require('graphql-tools');
const UserTypeDefs = require( './user/graphql/typedef');
const MessageTypeDefs = require( './message/graphql/typedef');

const baseTypeDefs = `

  directive @isAuthenticated on FIELD_DEFINITION
  
  scalar Date

  type AuthPayload {
    token: String!
  }

  type Query {
    me: User @isAuthenticated
  }

  type Mutation {
  }
`;

const typeDefs = [baseTypeDefs, UserTypeDefs, MessageTypeDefs];
const mergedTypeDefs = [].concat.apply([], typeDefs);
module.exports = mergedTypeDefs;

