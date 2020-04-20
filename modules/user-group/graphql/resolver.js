
const { createUserGroup } = require('../validationSchema');

module.exports = {
  Query: {
    userGroup: (() => 'User Group')
  },

  Mutation: {
    createUserGroup: {
      validationSchema: createUserGroup,
      resolve: (_, { userGroup }, { container }) => container.resolve('userGroupProvider').create(userGroup),
    }
  },
};
