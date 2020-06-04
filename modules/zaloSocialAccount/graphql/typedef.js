const gql = require('graphql-tag');

module.exports = gql`
    type ZaloSocialAccount {
      id: ID!
      avatar: String
      name: String
      phoneNumber: String
      followings: [ZaloSocialAccount]
      createdAt: Date
      gender: String
      birthday: Date
    }
    
    type ZaloSocialAccountList implements Paginatable {
        items: [ZaloSocialAccount]!
        hasNext: Boolean
        total: Int
    }
    
    input ZaloSocialAccountListInput {
        limit: Int = 10
        skip: Int = 0
    }

    extend type Query {
      socialAccount(id: ID!): ZaloSocialAccount
      socialAccountList(query: ZaloSocialAccountListInput): ZaloSocialAccountList
    }
`;
