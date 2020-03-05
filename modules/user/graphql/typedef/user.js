export const typeDef = `
  type User {
    _id: ID!
    name: String!
    email: String!
    messages: [Message]!
  }

  type UserList {
    users: [User]!
    hasNext: Boolean,
    total: Int
  }

  

  input LoginUserInput {
    email: String!
    password: String!
  }
`;
