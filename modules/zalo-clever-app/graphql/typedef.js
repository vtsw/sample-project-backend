const gql = require('graphql-tag');

module.exports = gql`
  type ZaloCleverApp {
    id: ID!
    name: String
    phoneNo:String
  }

  input createZaloCleverAppInput {
    name: String !
    phoneNo: String !
  }

  extend type Mutation {
    createZaloCleverApp(customer: createZaloCleverAppInput!): ZaloCleverApp
  }
  
  extend type Query {
    zaloCleverApp: String
  }
`;
