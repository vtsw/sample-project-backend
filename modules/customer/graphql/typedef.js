const gql = require('graphql-tag');

module.exports = gql`
  type Customer {
    id: ID!
    name: String
    phoneNo:String
  }

  
  extend type Mutation {
    login(user: LoginUserInput!): AuthPayload
    createUser(user: CreateUserInput!): User
    updateUser(user: UpdateUserInput!): User @isAuthenticated
    deleteUser(id: ID!): User @isAuthenticated
  }
  
  extend type Query {
    customer: Customer
  }
`;
