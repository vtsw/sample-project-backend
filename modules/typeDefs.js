const gql = require('graphql-tag');
const { mergeTypes } = require('merge-graphql-schemas');

const UserTypeDefs = require('./user/graphql/typedef');
const MessageTypeDefs = require('./message/graphql/typedef');
const ZaloMessageTypeDefs = require('./zaloMessage/graphql/typedef');
const ZaloTypeDefs = require('./zalo/graphql/typedef');
const ZaloReservationTypeDefs = require('./reservation/graphql/typedef');

const baseTypeDefs = gql`

  directive @isAuthenticated on FIELD_DEFINITION
  scalar Upload
  scalar Date
  
  type File {
    filename: String!
    mimetype: String
    encoding: String
    link: String!
    etag: String
  }

  input DefaultPaginationInput {
    skip: Int = 0
    limit: Int = 10
  }

  interface Paginatable {
    hasNext: Boolean
    total: Int
  }

  type AuthPayload {
    token: String!
	  user: User
  }

  type Query {
    hello: String
  }

  type Mutation {
    hello(name: String): String
    uploadImage (file: Upload!): File! @isAuthenticated
  }

  type Subscription {
      onHello: String
  }
`;

const typeDefs = [baseTypeDefs, UserTypeDefs, MessageTypeDefs, ZaloMessageTypeDefs, ZaloTypeDefs, ZaloReservationTypeDefs];
module.exports = mergeTypes(typeDefs, { all: true });
