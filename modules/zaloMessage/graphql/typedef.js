const gql = require('graphql-tag');

module.exports = gql`
  enum ZaloFileType {
    Image
    File
    Gif
  }
  
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
    type: String
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
    oaId: ID!
    saId: ID!
    content: String!
  }

  input ZaloMessageListInput {
    oaId: ID!
    saId: ID!
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
    oaId: ID!
    saId: ID!
    content: String
    attachmentFile: Upload!
    fileType: ZaloFileType
  }

  extend type Mutation {
    createZaloMessage(message: CreateZaloMessageInput!): ZaloMessage
    createZaloMessageAttachment(message: CreateZaloMessageAttachmentInput!): ZaloMessage
  }

  extend type Query {
    zaloMessage(id: ID!): ZaloMessage
    zaloMessageList(query: ZaloMessageListInput): ZaloMessageList
  }
  
  extend type Subscription  {
    onZaloMessageSent(filter: OnZaloMessageSentInput): ZaloMessage
    onZaloMessageReceived(filter: OnZaloMessageReceivedInput): ZaloMessage
    onZaloMessageCreated(filter: OnZaloMessageCreatedInput!): ZaloMessage
  }
`;
