module.exports =  `
  extend type Mutation {
    createMessage(message: CreateMessageInput!): Message @isAuthenticated
    updateMessage(message: UpdateMessageInput!): Message @isAuthenticated
    deleteMessage(id: ID!): Message @isAuthenticated
  }
`
