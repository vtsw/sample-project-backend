const gql = require('graphql-tag');

module.exports = gql`
  type ZaloMessage {
    id: ID!
    from: ID!
    to: ID!
    content: String!
    timestamp: Date
  }

  type ZaloMessageList implements Paginatable {
      items: [ZaloMessage]!
      hasNext: Boolean,
      total: Int,
  }

  input CreateZaloMessageInput {
    to: ID!
    content: String!
  }

  input ZaloMessageListInput {
    from: ID!
    to: ID!
  }
	
  extend type Mutation {
    createZaloMessage(message: CreateZaloMessageInput!): ZaloMessage @isAuthenticated
  }

  extend type Query {
    zaloMessage(id: ID!): ZaloMessage @isAuthenticated
    zaloMessageList(query: ZaloMessageListInput): ZaloMessageList @isAuthenticated
  }
  
  extend type Subscription  {
    onZaloMessageCreated: ZaloMessage
    onZaloMessageReceived: ZaloMessage
  }
`;
