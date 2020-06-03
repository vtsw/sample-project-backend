module.exports = {
  Query: {
    socialAccount: async (_, { id }, { container }) => container.resolve('zaloSAProvider').findById(id),
    socialAccountList: (_, args, { container }) => container.resolve('zaloSAProvider'),
  },
  ZaloSocialAccount: {
    followings: (socialAccount, args, { container }) => {
      const { officialAccountDataloader: { getFollowings } } = container.dataloader;
      return getFollowings.load(socialAccount);
    },
    id: (socialAccount) => socialAccount._id,
  },
};
