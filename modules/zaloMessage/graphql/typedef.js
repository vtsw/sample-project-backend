const gql = require('graphql-tag');

module.exports = gql`
  
  type ZaloAttachmentFilePayload {
    thumbnail: String
    description: String
    url: String
    size: String
    name: String
    type: String
  }
  
  type ZaloAttachmentFile {
    payload: ZaloAttachmentFilePayload
    type: String
  }
  
  type ZaloMessage {
    id: ID!
    from: ZaloMessageParticipant!
    to: ZaloMessageParticipant!
    content: String
    attachments: [ZaloAttachmentFile]
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
    skip: Int = 0
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
  
  input CreateZaloMessageAttachmentInput {
    to: ID!
    content: String
    attachmentFile: Upload!
    fileType: String!
  }

  extend type Mutation {
    createZaloMessage(message: CreateZaloMessageInput!): ZaloMessage @isAuthenticated
    createZaloMessageAttachment(message: CreateZaloMessageAttachmentInput!): ZaloMessage @isAuthenticated
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
