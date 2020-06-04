module.exports = {
  Query: {
    socialAccount: async (_, { id }, { container }) => container.resolve('zaloSAProvider').findById(id),
    socialAccountList: (_, args, { container }) => {
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
      return container.resolve('zaloSAProvider').paginate({}, {
        customLabels,
      });
    },
  },
  ZaloSocialAccount: {
    followings: (socialAccount, args, { dataloader }) => {
      const { officialAccount: { getBySocialAccountList } } = dataloader;
      return getBySocialAccountList.load(socialAccount);
    },
    id: (socialAccount) => socialAccount._id,
  },
};
