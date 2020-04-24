const { isEmpty } = require('lodash');
const { ResourceNotFoundError } = require('../../errors');


module.exports = {
  Query: {
    zaloInterestedUser: async (_, { id }, { container }) => {
      const interestedUser = await container.resolve('zaloInterestedUserProvider').findById(id);
      if (!interestedUser) {
        throw new ResourceNotFoundError();
      }
      return interestedUser;
    },
    zaloInterestedUserList: (_, args, { container, req }) => {
      const loggedUser = req.user;
      const zaloInterestedUserProvider = container.resolve('zaloInterestedUserProvider');
      if (isEmpty(args)) {
        return zaloInterestedUserProvider
          .find({ query: { following: loggedUser.id }, page: { limit: 10, skip: 0 } });
      }
      const { query: { limit, skip } } = args;
      return zaloInterestedUserProvider.find({ query: { following: loggedUser.id }, page: { limit, skip } });
    },
  },
};
