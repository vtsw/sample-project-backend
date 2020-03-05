module.exports = `
  type Query {
    message(id: String!): Message @isAuthenticated
    messageList: [Message]! @isAuthenticated
  }
`;
