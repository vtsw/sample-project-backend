const ZaloIdentifier = require('../ZaloIdentifier');
const { ObjectId } = require('mongodb');

class UserUnFollowOAEventHandler {
  /**
   *
   * @param zaloInterestedUserProvider
   * @param request
   * @param userProvider
   * @param config
   * @param zaloMessageSender
   */
  constructor(zaloInterestedUserProvider, request, userProvider, config, zaloMessageSender) {
    this.zaloInterestedUserProvider = zaloInterestedUserProvider;
    this.request = request;
    this.userProvider = userProvider;
    this.config = config;
    this.zaloMessageSender = zaloMessageSender;
  }

  /**
   *
   * @param data
   * @returns {Promise<*>}
   */
  async handle(data) {
    const user = await this.userProvider.findByZaloId(data.oa_id);
    const zaloId = ZaloIdentifier.factory({
      zaloIdByOA: data.follower.id, OAID: data.oa_id, appId: data.app_id, zaloIdByApp: data.user_id_by_app,
    });
    const interestedUser = await this.zaloInterestedUserProvider.findByZaloId(zaloId);

    let { followings } = interestedUser;
    const foundFollowIndex = followings.findIndex((follow) => JSON.stringify(follow.zaloId.toJson()) === JSON.stringify(zaloId.toJson()));
    interestedUser.followings[foundFollowIndex] = { zaloId, userId: ObjectId(user.id), state: 'deactive' };

    followings = followings.map((following) => ({
      user: following.userId,
      zaloId: following.zaloId.toJson(),
      state: following.state,
    }));

    return this.zaloInterestedUserProvider.update(interestedUser.id, {
      followings,
    });
  }

  static getEvent() {
    return 'unfollow';
  }
}

module.exports = UserUnFollowOAEventHandler;
