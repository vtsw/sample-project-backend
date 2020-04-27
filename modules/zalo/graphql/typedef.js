const gql = require('graphql-tag');

module.exports = gql`
    type ZaloInterestedUser {
      id: ID!
      avatar: String
      displayName: String
    }
    
    type ZaloInterestedUserList implements Paginatable{
        items: [ZaloInterestedUser]!
        hasNext: Boolean
        total: Int
    }
    
    input ZaloInterestedUserListInput {
        limit: Int = 10
        skip: Int = 0
    }

    extend type Query {
      zaloInterestedUser(id: ID!): ZaloInterestedUser @isAuthenticated
      zaloInterestedUserList(query: ZaloInterestedUserListInput): ZaloInterestedUserList @isAuthenticated
    }
`;
