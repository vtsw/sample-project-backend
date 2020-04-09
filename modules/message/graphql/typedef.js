const gql = require('graphql-tag');

module.exports = gql`
	type Message {
	  id: ID!
	  content: String!
    lastModified: Date
		userId: ID
	}
	
	input CreateMessageInput {
	  content: String!
	}
	
	input UpdateMessageInput {
	  content: String!
	  id: ID!
	}

  type MessageList implements Paginatable {
    items: [Message]!
    hasNext: Boolean,
    total: Int,
  }
	
  input MessageListInput {
    skip: Int = 0,
    limit: Int = 10,
	searchText: String
    userId: ID
  }
	
	extend type Mutation {
    createMessage(message: CreateMessageInput!): Message @isAuthenticated
    updateMessage(message: UpdateMessageInput!): Message @isAuthenticated
    deleteMessage(id: ID!): Message @isAuthenticated
  }
  
  extend type Query {
    message(id: ID!): Message @isAuthenticated
    messageList(query: MessageListInput): MessageList @isAuthenticated
  }
`;
