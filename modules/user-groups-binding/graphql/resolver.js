
const { createUserGroupsBinding } = require('../validationSchema');

module.exports = {
  Query: {
    userGroupsBinding : (() => "User Groups Binding")
  },

  Mutation: {
    createUserGroupsBinding : {
      validationSchema: createUserGroupsBinding,
      resolve: (_, { userGroupsBinding }, { container }) => container.resolve('userGroupsBindingProvider').create(userGroupsBinding),
    }
  },
};
