const gql = require('graphql-tag');

module.exports = gql`
  type UserGroup {
    id: ID!
    name: String
  }

  input createUserGroupInput {
    name: String !
  }

  extend type Mutation {
    createUserGroup(userGroup: createUserGroupInput!): UserGroup
  }

  extend type Query {
    userGroup: String
  }
`;
