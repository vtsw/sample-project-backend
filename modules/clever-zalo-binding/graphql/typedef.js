const gql = require('graphql-tag');

module.exports = gql`
  type CleverZaloBinding {
    id: ID!
    userId: String
    zaloOAId: String
  }

  input createCleverZaloBinding {
    userId: String !
    zaloOAId: String !
  }

  extend type Mutation {
    createCleverZaloBinding(customer: createCleverZaloBinding!): CleverZaloBinding
  }
`;
