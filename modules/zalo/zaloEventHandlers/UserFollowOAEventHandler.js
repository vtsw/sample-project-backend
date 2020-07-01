class UserFollowOAEventHandler {
  /**
   *
   * @param zaloSAProvider
   * @param request
   * @param zaloOAProvider
   * @param config
   * @param zaloMessageSender
   * @param zaloAuthenticator
   */
  constructor(zaloSAProvider, request, zaloOAProvider, config, zaloMessageSender, zaloAuthenticator) {
    this.zaloSAProvider = zaloSAProvider;
    this.request = request;
    this.zaloOAProvider = zaloOAProvider;
    this.config = config;
    this.zaloMessageSender = zaloMessageSender;
    this.zaloAuthenticator = zaloAuthenticator;
  }

  /**
   *
   * @param req
   * @returns {Promise<*>}
   */
  async handle(req) {
    const { headers, body: data } = req;
    const zaloOA = await this.zaloOAProvider.findOne({ oaId: data.oa_id });
    const { credential: { accessToken } } = zaloOA;
    const { zaloApi: { officialAccount: { getInterestedUserProfile } } } = this.config;
    this.zaloAuthenticator.verifySignature(headers['x-zevent-signature'], data, zaloOA);

    const userInfo = await this.request(`${getInterestedUserProfile}?access_token=${accessToken}&data={"user_id":"${data.follower.id}"}`,
      {
        method: 'GET',
      }).then((response) => response.json());
    const phoneNumber = userInfo.data.shared_info ? userInfo.data.shared_info.phone : null;
    /**
     * SA must share their phone number to Clever systerm before they are registered
     * Clever will use SA'phone number as an sa ID
     *
     */
    if (!phoneNumber) {
      await this.zaloMessageSender.sendRequestUserInfo({ content: '' }, data.follower.id, zaloOA);
      /**
       * create an new user as NEED_PROVIDE_PHONE_NUMBER state
       */
      return this.zaloSAProvider.create({
        name: userInfo.data.display_name,
        birthday: userInfo.data.birth_date,
        gender: userInfo.data.user_gender === 1 ? 'male' : 'female',
        avatar: userInfo.data.avatar,
        timestamp: data.timestamp,
        avatars: userInfo.data.avatars,
        followings: [
          {
            zaloIdByOA: data.follower.id, oaId: data.oa_id, appId: data.app_id, zaloIdByApp: data.user_id_by_app, cleverOAId: zaloOA._id,
          },
        ],
      });
    }
    /**
     * use phone number to identify user
     */
    const saUser = await this.zaloSAProvider.findOne({
      phoneNumber,
    });
    saUser.followings.push(
      {
        zaloIdByOA: data.follower.id,
        oaId: data.oa_id,
        appId: data.app_id,
        zaloIdByApp: data.user_id_by_app,
        cleverOAId: zaloOA._id,
        state: 'PHONE_NUMBER_PROVIDED',
      },
    );
    return saUser.save();
  }

  static getEvent() {
    return 'follow';
  }
}

module.exports = UserFollowOAEventHandler;
