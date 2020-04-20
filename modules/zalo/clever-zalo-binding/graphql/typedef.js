const gql = require('graphql-tag');

module.exports = gql`
  type CleverZaloBinding {
    id: ID!
    userId: String
    zaloOAId: String
  }

  input CreateCleverZaloBindingInput {
    userId: String !
    zaloOAId: String !
  }

  extend type Mutation {
    createCleverZaloBinding(cleverZaloBinding: CreateCleverZaloBindingInput!): CleverZaloBinding
  }

  extend type Query {
    cleverZB: String
  }
`;
