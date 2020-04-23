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
    skip: Int = 0,
    limit: Int = 10
  }
  input OnZaloMessageCreatedInput {
    to: String
  }

  input OnZaloMessageReceivedInput {
      from: String
  }

  extend type Mutation {
    createZaloMessage(message: CreateZaloMessageInput!): ZaloMessage @isAuthenticated
  }

  extend type Query {
    zaloMessage(id: ID!): ZaloMessage @isAuthenticated
    zaloMessageList(query: ZaloMessageListInput): ZaloMessageList @isAuthenticated
  }
  
  extend type Subscription  {
    onZaloMessageCreated(filter: OnZaloMessageCreatedInput): ZaloMessage
    onZaloMessageReceived(filter: OnZaloMessageReceivedInput): ZaloMessage
  }
`;
