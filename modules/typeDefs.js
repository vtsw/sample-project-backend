const gql = require('graphql-tag');

module.exports = gql`

  directive @isAuthenticated on FIELD_DEFINITION
  
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
    email: String!
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

  input UpdateMessageInput {
    content: String!
    _id: ID
  }

  type Query {
    message(id: String!): Message @isAuthenticated
    messageList: [Message]! @isAuthenticated
    me: User @isAuthenticated
    user(id: String!): User @isAuthenticated
    userList: UserList @isAuthenticated
  }

  type Mutation {
    login(user: LoginUserInput!): AuthPayload
    createUser(user: CreateUserInput!): User @isAuthenticated
    updateUser(user: UpdateUserInput!): User @isAuthenticated
    createMessage(message: CreateMessageInput!): Message @isAuthenticated
    updateMessage(message: UpdateMessageInput!): Message @isAuthenticated
    deleteMessage(id: ID!): Message @isAuthenticated
  }
`;
