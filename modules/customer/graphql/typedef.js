const gql = require('graphql-tag');

module.exports = gql`
  type Customer {
    id: ID!
    name: String
    phoneNo:String
  }


  extend type Mutation {
    createCustomer(user: Customer!): User
  }
  
  extend type Query {
    customer: String
  }
`;
