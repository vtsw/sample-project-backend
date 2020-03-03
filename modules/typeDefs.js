const gql = require('graphql-tag');

module.exports = gql`
  scalar Date
  
  type AuthPayload {
    token: String!
  }

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

  input CreateUserInput {
    password: String!
    name: String!
    email: String!
  }
  
  input UpdateUserInput {
    _id: ID!
    name: String
    email: String
    password: String
  }

  input LoginUserInput {
    user: String!,
    password: String!
  }

  type Message {
    _id: ID!
    content: String!
    createdAt: Date
    userId: ID!
  }

  input CreateMessageInput {
    content: String!
  }

  type Query {
    message(id: String!): Message
    messageList: [Message]!
    me: User
    user(id: String!): User
    userList: UserList
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload
    createUser(user: CreateUserInput): User
    updateUser(user: UpdateUserInput): User
    createMessage(messsage: CreateMessageInput): Message
  }
`;
