class UserUnfollowOAEventHandler {
  /**
   *
   * @param zaloSAProvider
   * @param zaloOAProvider
   * @param zaloAuthenticator
   */
  constructor(zaloSAProvider, zaloOAProvider, zaloAuthenticator) {
    this.zaloSAProvider = zaloSAProvider;
    this.zaloOAProvider = zaloOAProvider;
    this.zaloAuthenticator = zaloAuthenticator;
  }

  /**
   *
   * @param req
   * @returns {Promise<*>}
   */
  async handle(req) {
    const { headers, body: data } = req;
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
    this.zaloAuthenticator.verifySignature(headers['x-zevent-signature'], data, OAUser);
    zaloSA.getFollowingByCleverOAId(OAUser._id);
    zaloSA.followings.id(zaloSA.getFollowingByCleverOAId(OAUser._id)._id).remove();
    zaloSA.save();
  }

  static getEvent() {
    return 'unfollow';
  }
}

module.exports = UserUnfollowOAEventHandler;
