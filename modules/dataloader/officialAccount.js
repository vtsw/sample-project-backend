const DataLoader = require('dataloader');
const lodash = require('lodash');
const { Types: { ObjectId } } = require('mongoose');

module.exports = (container) => ({
  getBySocialAccountList: new DataLoader(
    async (socialAccountList) => {
      const saIds = lodash.flattenDeep(socialAccountList.map((so) => so.followings.map((item) => item.cleverOAId))).map((id) => ObjectId(id));
      const oaList = await container.resolve('zaloOAProvider').find({ _id: { $in: saIds } });
      return socialAccountList.map((sa) => sa.followings
        .map((following) => oaList.find((oa) => oa._id.toString() === following.cleverOAId.toString())));
    },
  ),
});
