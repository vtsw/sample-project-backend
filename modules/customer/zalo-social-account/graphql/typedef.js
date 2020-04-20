const gql = require('graphql-tag');

module.exports = gql`
  type ZaloSocialAccount  {
    id: ID!
    socialId: String
    socialAccessToken: String
    socialAccessTokenLastUpdated: String
    zaloCleverApp:String
    socialInfo: SocialAccount
  }

  type SocialAccount {
    name: String
  }

  input SocialAccountInput {
    name: String
  }

  input CreateZaloSocialAccountInput {
    socialId: String
    socialAccessToken: String
    socialAccessTokenLastUpdated: String
    zaloCleverApp:String,
    socialInfo: SocialAccountInput
  }

  extend type Mutation {
    createZaloSocialAccount (zaloSocialAccount : CreateZaloSocialAccountInput!): ZaloSocialAccount
  }
  
  extend type Query {
    zaloSocialAccount : String
  }
`;
