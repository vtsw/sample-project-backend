const { isEmpty, pickBy, identity } = require('lodash');
const fetch = require('node-fetch');

module.exports = {
  Query: {
    zaloOA: (_, { id }, { container }) => container.resolve('zaloOAProvider').findById(id),
    zaloOAList: async (_, args, { container }) => {
      const customLabels = {
        totalDocs: 'itemCount',
        docs: 'items',
        limit: 'perPage',
        page: 'currentPage',
        nextPage: 'next',
        prevPage: 'prev',
        totalPages: 'pageCount',
        pagingCounter: 'slNo',
        meta: 'paginator',
      };
      return container.resolve('zaloOAProvider').paginate({}, {
        customLabels,
      });
    },
  },
  Mutation: {
    deleteZaloOA: async (_, { id }, { container }) => {
      await container.resolve('zaloOAProvider').deleteById(id);
      return container.resolve('zaloOAProvider').findOneWithDeleted({ _id: id });
    },
    createZaloOA: async (_, { zaloOA }, { container }) => {
      const { zaloApi: { officialAccount: { getOAinfo } } } = container.resolve('config');
      const oa = await fetch(`${getOAinfo}?access_token=${zaloOA.accessToken}`).then((response) => response.json());
      return container.resolve('zaloOAProvider').create(pickBy({
        ...oa.data,
        oaId: zaloOA.oaId, // @Todo oaId from dashboard is difference with the one getted from api https://openapi.zalo.me/v2.0/oa/getoa
        oa_id: null,
        credential: zaloOA,
      }, identity));
    },
    updateZaloOA: async (_, { zaloOA }, { container }) => container.resolve('zaloOAProvider').findByIdAndUpdate(zaloOA.id, {
      credential: zaloOA,
    }),
  },
  ZaloOA: {
    interestedUsers: (user, args, { container }) => {
      const zaloInterestedUserProvider = container.resolve('zaloInterestedUserProvider');
      if (isEmpty(args)) {
        return zaloInterestedUserProvider
          .find({ query: { following: user.id }, page: { limit: 10, skip: 0 } });
      }
      const { query: { limit, skip } } = args;
      return zaloInterestedUserProvider.find({ query: { following: user.id }, page: { limit, skip } });
    },
    id: (zaloOA) => zaloOA._id,
  },
};
