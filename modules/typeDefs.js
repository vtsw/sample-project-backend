const gql = require('graphql-tag');
const { mergeTypes } = require('merge-graphql-schemas');

const UserTypeDefs = require('./user/graphql/typedef');
const MessageTypeDefs = require('./message/graphql/typedef');
const CustomerTypeDefs = require('./customer/graphql/typedef');
const CleverZaloBindingTypeDefs = require('./zalo/clever-zalo-binding/graphql/typedef');
const ZaloCleverAppTypeDefs = require('./zalo/zalo-clever-app/graphql/typedef');
// const UserGroupTypeDefs =   require('./user-group/graphql/typedef');
// const UserGroupsBindingTypeDefs =   require('./user-groups-binding/graphql/typedef');
const ZaloOATypeDefs =   require('./zalo/zalo-oa/graphql/typedef');
const ZaloSocialAccountTypeDefs = require('./customer/zalo-social-account/graphql/typedef');

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
  baseTypeDefs, UserTypeDefs, MessageTypeDefs, CustomerTypeDefs, CleverZaloBindingTypeDefs,
  ZaloCleverAppTypeDefs, ZaloOATypeDefs,
  ZaloSocialAccountTypeDefs
];

module.exports = mergeTypes(typeDefs, { all: true });
