module.exports = {
  Query: {
    socialAccount: async (_, { id }, { container }) => container.resolve('zaloSocialProvider').findById(id),
    socialAccountList: (_, args, { container }) => container.resolve('zaloSocialProvider'),
  },
  ZaloSocialAccount: {
    followings: (socialAccount, args, { container }) => {
      const { officialAccountDataloader: { getFollowings } } = container.dataloader;
      return getFollowings.load(socialAccount);
    },
    id: (socialAccount) => socialAccount._id,
  },
};
