class UserShareInfoEventHandler {
  /**
   *
   * @param zaloSAProvider
   * @param zaloOAProvider
   * @param zaloAuthenticator
   */
  constructor(zaloSAProvider, zaloOAProvider, zaloAuthenticator) {
    this.name = UserShareInfoEventHandler.getEvent();
    this.zaloSocialUserProvider = zaloSAProvider;
    this.zaloAuthenticator = zaloAuthenticator;
    this.zaloOAProvider = zaloOAProvider;
  }

  async handle(req) {
    const { headers, body: data } = req;
    const [OAUser, zaloSA] = await Promise.all([
      this.zaloOAProvider.findOne({ oaId: data.recipient.id }),
      this.zaloSocialUserProvider.findOne({
        followings: {
          $elemMatch: {
            zaloIdByOA: data.sender.id, oaId: data.recipient.id, appId: data.app_id, zaloIdByApp: data.user_id_by_app,
          },
        },
      }),
    ]);
    this.zaloAuthenticator.verifySignature(headers['x-zevent-signature'], data, OAUser);
    const following = zaloSA.followings.find((item) => (
      item.zaloIdByOA === data.sender.id && item.oaId === data.recipient.id && item.appId === data.app_id && item.zaloIdByApp === data.user_id_by_app
    ));
    zaloSA.followings.id(following._id).state = 'PHONE_NUMBER_PROVIDED';
    zaloSA.phoneNumber = data.info.phone;
    zaloSA.address = data.info;
    return zaloSA.save();
  }

  static getEvent() {
    return 'user_submit_info';
  }
}

module.exports = UserShareInfoEventHandler;
