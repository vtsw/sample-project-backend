const gql = require('graphql-tag');

module.exports = gql`
  type UserGroupsBinding  {
    id: ID!
    userId: String
    groupId: String
  }

  input createUserGroupsBindingInput {
    userId: String
    groupId: String
  }

  extend type Mutation {
    createUserGroupsBinding(userGroupsBinding : createUserGroupsBindingInput!): UserGroupsBinding
  }
  
  extend type Query {
    userGroupsBinding: String
  }
`;
