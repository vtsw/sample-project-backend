const gql = require('graphql-tag');

module.exports = gql`
  type User {
    id: ID!
    name: String
    email: String
    lastModified: Date
    messages(query: MessageListInput): MessageList
  }

  type UserList implements Paginatable {
    items: [User]!
    hasNext: Boolean,
    total: Int
  }

  input LoginUserInput {
    email: String!
    password: String!
  }
  
  input CreateUserInput {
    password: String!
    name: String!
    email: String!
  }
  
  input UpdateUserInput {
    id: ID!
    name: String
    email: String
    password: String
  }

  input UserListInput {
    skip: Int = 0,
    limit: Int = 10,
    searchText: String
  }
  
  extend type Mutation {
    login(user: LoginUserInput!): AuthPayload
    createUser(user: CreateUserInput!): User
    updateUser(user: UpdateUserInput!): User @isAuthenticated
    deleteUser(id: ID!): User @isAuthenticated
  }
  
  extend type Query {
    user(id: String!): User @isAuthenticated
    userList(query: UserListInput): UserList @isAuthenticated
  }
`;
