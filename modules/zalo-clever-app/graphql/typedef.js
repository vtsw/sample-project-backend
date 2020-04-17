const gql = require('graphql-tag');

module.exports = gql`
  type ZaloCleverApp {
    id: ID!
    appId: String
    appSecret: String
    appCallbackUrl: String
  }

  input CreateZaloCleverAppInput {
    appId: String
    appSecret: String
    appCallbackUrl: String
  }

  extend type Mutation {
    createZaloCleverApp(zaloCleverApp: CreateZaloCleverAppInput!): ZaloCleverApp
  }
  
  extend type Query {
    zaloCleverApp: String
  }
`;
