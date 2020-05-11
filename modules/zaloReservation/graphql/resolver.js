const { isEmpty } = require('lodash');
const { ResourceNotFoundError } = require('../../errors');


module.exports = {
  Query: {
    hello1: async (_, { args }, { container }) => {
      return '1111'
      // const interestedUser = await container.resolve('zaloInterestedUserProvider').findById(id);
      // if (!interestedUser) {
      //   throw new ResourceNotFoundError('ZaloInterestedUser');
      // }
      // return interestedUser;
    },
  },
};
