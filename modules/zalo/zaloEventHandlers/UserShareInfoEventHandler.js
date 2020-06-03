class UserShareInfoEventHandler {
  constructor(zaloSAProvider) {
    this.name = UserShareInfoEventHandler.getEvent();
    this.zaloSocialUserProvider = zaloSAProvider;
  }

  async handle(data) {
    const zaloSA = await this.zaloSocialUserProvider.findOne({
      followings: {
        $elemMatch: {
          zaloIdByOA: data.sender.id, oaId: data.recipient.id, appId: data.app_id, zaloIdByApp: data.user_id_by_app,
        },
      },
    });
    zaloSA.phoneNumber = data.info.phone;
    zaloSA.address = data.info;
    return zaloSA.save();
  }

  static getEvent() {
    return 'user_submit_info';
  }
}

module.exports = UserShareInfoEventHandler;
