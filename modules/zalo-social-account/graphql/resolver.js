
const { createZaloSocialAccount } = require('../validationSchema');

module.exports = {
  Query: {
    zaloSocialAccount: (() => "Zalo Social Account ")
  },

  Mutation: {
    createZaloSocialAccount: {
      validationSchema: createZaloSocialAccount,
      resolve: (_, { zaloSocialAccount  }, { container }) => container.resolve('zaloSocialAccountprovider').create(zaloSocialAccount),
    }
  },
};
