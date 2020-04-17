const gql = require('graphql-tag');

module.exports = gql`
  type UserGroupsBinding  {
    id: ID!
    userId: String
    groupId: String
  }

  input CreateUserGroupsBindingInput {
    userId: String
    groupId: String
  }

  extend type Mutation {
    createUserGroupsBinding(userGroupsBinding : CreateUserGroupsBindingInput!): UserGroupsBinding
  }
  
  extend type Query {
    userGroupsBinding: String
  }
`;
