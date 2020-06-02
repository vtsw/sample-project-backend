const gql = require('graphql-tag');
const { mergeTypes } = require('merge-graphql-schemas');

const ZaloOATypeDefs = require('./zaloOfficialAccount/graphql/typedef');
const ZaloMessageTypeDefs = require('./zaloMessage/graphql/typedef');
const ZaloTypeDefs = require('./zalo/graphql/typedef');

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

  type Query {
    hello: String
  }

  type Mutation {
    hello(name: String): String
  }

  type Subscription {
    onHello: String
  }
`;

const typeDefs = [baseTypeDefs, ZaloOATypeDefs, ZaloMessageTypeDefs, ZaloTypeDefs];
module.exports = mergeTypes(typeDefs, { all: true });
