const gql = require('graphql-tag');

module.exports = gql`
  type User {
    id: ID!
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
  
  extend type Mutation {
    login(user: LoginUserInput!): AuthPayload
    createUser(user: CreateUserInput!): User @isAuthenticated
    updateUser(user: UpdateUserInput!): User @isAuthenticated
  }
  
  extend type Query {
    user(id: String!): User @isAuthenticated
    userList: UserList @isAuthenticated
    me: User @isAuthenticated
  }
`;