export const typeDef = `
  input CreateMessageInput {
    content: String!
  }

  input UpdateMessageInput {
    content: String!
    _id: ID
  }
`;
