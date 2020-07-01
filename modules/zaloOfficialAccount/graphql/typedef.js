const gql = require('graphql-tag');

module.exports = gql`
  input CreateZaloOAInput {
    oaId: String!
    oaSecretKey: String
    accessToken: String
    appId: String
    appSecretKey: String
  }

  input UpdateZaloOAInput {
    id: ID!
    accessToken: String
    oaId: String
    oaSecretKey: String
    appId: String
    appSecretKey: String
  }

  type ZaloOA {
    id: ID!
    oaId: ID!
    name: String
    description: String
    avatar: String
    cover: String
    interestedUsers(query: ZaloSocialAccountListInput): ZaloSocialAccountList
  }

  type ZaloOAList implements Paginatable {
    items: [ZaloOA]!
    hasNext: Boolean,
    total: Int
  }

  input ZaloOAListInput {
    skip: Int = 0,
    limit: Int = 10,
    searchText: String
  }
  
  extend type Mutation {
    createZaloOA(zaloOA: CreateZaloOAInput!): ZaloOA
    updateZaloOA(zaloOA: UpdateZaloOAInput!): ZaloOA
    deleteZaloOA(id: ID!): ZaloOA
  }
  
  extend type Query {
    zaloOA(id: ID!): ZaloOA @isAuthenticated
    myOA: ZaloOA @isAuthenticated
    zaloOAList(query: ZaloOAListInput): ZaloOAList @isAuthenticated
  }
`;
