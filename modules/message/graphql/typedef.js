
module.exports = `
	type Message {
	  _id: ID!
	  content: String!
	  createdAt: Date
	  userId: ID!
	}
	
	input CreateMessageInput {
	  content: String!
	}
	
	input UpdateMessageInput {
	  content: String!
	  _id: ID
	}
	
	extend type Mutation {
    createMessage(message: CreateMessageInput!): Message @isAuthenticated
    updateMessage(message: UpdateMessageInput!): Message @isAuthenticated
    deleteMessage(id: ID!): Message @isAuthenticated
  }
  
  extend type Query {
    message(id: String!): Message @isAuthenticated
    messageList: [Message]! @isAuthenticated
  }
`;
