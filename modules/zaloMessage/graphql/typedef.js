const gql = require('graphql-tag');

module.exports = gql`
  type ZaloMessage {
    id: ID!
    from: ZaloMessageParticipant!
    to: ZaloMessageParticipant!
    content: String!
    timestamp: Date
  }
  
  type ZaloMessageParticipant {
    id: ID!
    displayName: String
    avatar: String
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
    interestedUserId: ID!
    skip: Int = 0,
    limit: Int = 10
  }
  
  input OnZaloMessageSentInput {
    to: String
  }
  
  input OnZaloMessageCreatedInput {
    interestedUserId: ID!
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
    onZaloMessageSent(filter: OnZaloMessageSentInput): ZaloMessage
    onZaloMessageReceived(filter: OnZaloMessageReceivedInput): ZaloMessage
    onZaloMessageCreated(filter: OnZaloMessageCreatedInput!): ZaloMessage
  }
`;
