const gql = require('graphql-tag');

module.exports = gql`
  type UserGroup {
    id: ID!
    name: String
  }

  input CreateUserGroupInput {
    name: String !
  }

  extend type Mutation {
    createUserGroup(userGroup: CreateUserGroupInput!): UserGroup
  }

  extend type Query {
    userGroup: String
  }
`;
