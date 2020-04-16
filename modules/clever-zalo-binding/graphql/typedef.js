const gql = require('graphql-tag');

module.exports = gql`
  type CleverZaloBinding {
    id: ID!
    userId: String
    zaloOAId: String
  }

  input createCleverZaloBindingInput {
    userId: String !
    zaloOAId: String !
  }

  extend type Mutation {
    createCleverZaloBinding(cleverZaloBinding: createCleverZaloBindingInput!): CleverZaloBinding
  }

  extend type Query {
    cleverZB: String
  }
`;
