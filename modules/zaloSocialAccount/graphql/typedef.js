const gql = require('graphql-tag');

module.exports = gql`
    type ZaloSocialAccount {
      id: ID!
      avatar: String
      name: String
      phoneNumber: String
      followings: [ZaloFollow]
      createdAt: Date
      gender: String
      birthday: Date
    }


    type ZaloFollow {
        state: String
        zaloIdByOA: String
        oaId: String
        cleverOAId: String
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
      socialAccount(id: ID!): ZaloSocialAccount @isAuthenticated
      socialAccountList(query: ZaloSocialAccountListInput): ZaloSocialAccountList @isAuthenticated
    }
`;
