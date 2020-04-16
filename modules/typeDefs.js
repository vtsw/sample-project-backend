const gql = require('graphql-tag');
const { mergeTypes } = require('merge-graphql-schemas');

const UserTypeDefs = require('./user/graphql/typedef');
const MessageTypeDefs = require('./message/graphql/typedef');
const CustomerTypeDefs = require('./customer/graphql/typedef');
const CleverZaloBindingTypeDefs = require('./clever-zalo-binding/graphql/typedef');
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
`;

const typeDefs = [
  baseTypeDefs, UserTypeDefs, MessageTypeDefs, CustomerTypeDefs, CleverZaloBindingTypeDefs
];
module.exports = mergeTypes(typeDefs, { all: true });
