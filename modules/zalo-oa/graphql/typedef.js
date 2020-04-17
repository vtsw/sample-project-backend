const gql = require('graphql-tag');

module.exports = gql`

  type CreateZaloInfo {
    name: String 
  }

  input CreateZaloInfoInput {
    name: String 
  }

  type ZaloOA {
    id: ID!
    oaId: String
    appId: String
    name: String
    oaAccessToken: String
    oaAccessTokenLastUpdatedTime: String,
  }

  
  input CreateZaloOAInput {
    oaId: String
    appId: String
    name: String
    oaAccessToken: String
    oaAccessTokenLastUpdatedTime: String,
    oaInfo: CreateZaloInfoInput
  }

  extend type Mutation {
    createZaloOA(zaloOA: CreateZaloOAInput!): ZaloOA
  }
  
  extend type Query {
    zaloOA: String
  }
`;
