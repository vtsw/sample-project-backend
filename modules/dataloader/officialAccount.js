module.exports = (container) => ({
  getBySocialAccountList: async (socialAccountList) => {
    const oaProvider = container.resolve('zaloOAProvider');
    const saIds = socialAccountList.map((so) => so.followings.map((item) => item.cleverOAId));
    const oaList = await oaProvider.find({ _id: { $in: saIds }, state: 'PHONE_NUMBER_PROVIDED' });
    return socialAccountList.map((so) => oaList.filter((oa) => so.followings.map((item) => item.cleverOAId).includes(oa.id)));
  },
});
