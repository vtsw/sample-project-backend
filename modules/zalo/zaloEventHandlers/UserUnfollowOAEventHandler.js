class UserUnfollowOAEventHandler {
  /**
   *
   * @param zaloInterestedUserProvider
   * @param userProvider
   */
  constructor(zaloSAProvider, zaloOAProvider) {
    this.zaloSAProvider = zaloSAProvider;
    this.zaloOAProvider = zaloOAProvider;
  }

  /**
   *
   * @param data
   * @returns {Promise<*>}
   */
  async handle(data) {
    const [OAUser, zaloSA] = await Promise.all([
      this.zaloOAProvider.findOne({ oaId: data.oa_id }),
      this.zaloSAProvider.findOne({
        followings: {
          $elemMatch: {
            zaloIdByOA: data.follower.id, oaId: data.oa_id, appId: data.app_id, zaloIdByApp: data.user_id_by_app, state: 'PHONE_NUMBER_PROVIDED',
          },
        },
      }),
    ]);

    zaloSA.getFollowingByCleverOAId(OAUser._id);
    zaloSA.followings.id(zaloSA.getFollowingByCleverOAId(OAUser._id)._id).remove();
    zaloSA.save();
  }

  static getEvent() {
    return 'unfollow';
  }
}

module.exports = UserUnfollowOAEventHandler;
