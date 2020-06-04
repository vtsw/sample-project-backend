const { pickBy, identity } = require('lodash');
const fetch = require('node-fetch');

module.exports = {
  Query: {
    zaloOA: (_, { id }, { container }) => container.resolve('zaloOAProvider').findById(id),
    zaloOAList: async (_, args, { container }) => {
      const customLabels = {
        totalDocs: 'total',
        docs: 'items',
        limit: 'perPage',
        page: 'currentPage',
        nextPage: 'next',
        prevPage: 'prev',
        totalPages: 'pageCount',
        pagingCounter: 'slNo',
        hasNextPage: 'hasNext',
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
      const { zaloApi: { officialAccount: { getOAInfo } } } = container.resolve('config');
      const oa = await fetch(`${getOAInfo}?access_token=${zaloOA.accessToken}`).then((response) => response.json());
      return container.resolve('zaloOAProvider').create(pickBy({
        ...oa.data,
        oaId: zaloOA.oaId, // @Todo oaId from dashboard is difference with the one is getted from api https://openapi.zalo.me/v2.0/oa/getoa
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
      const zaloSAProvider = container.resolve('zaloSAProvider');
      const customLabels = {
        totalDocs: 'total',
        docs: 'items',
        limit: 'perPage',
        page: 'currentPage',
        nextPage: 'next',
        prevPage: 'prev',
        totalPages: 'pageCount',
        pagingCounter: 'slNo',
        hasNextPage: 'hasNext',
      };
      return zaloSAProvider.paginate({}, { customLabels });
    },
    id: (zaloOA) => zaloOA._id,
  },
};
