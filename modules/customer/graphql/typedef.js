const gql = require('graphql-tag');

module.exports = gql`
  type Customer {
    id: ID!
    name: String
    phoneNo:String
  }

  input createCustomerInput {
    name: String !
    phoneNo: String !
  }

  extend type Mutation {
    createCustomer(customer: createCustomerInput!): Customer
  }
  
  extend type Query {
    customer: String
  }
`;
