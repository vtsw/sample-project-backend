const ZaloIdentifier = require('../ZaloIdentifier');

class UserShareInfoEventHandler {
  constructor(zaloInterestedUserProvider) {
    this.name = UserShareInfoEventHandler.getEvent();
    this.zaloInterestedUserProvider = zaloInterestedUserProvider;
  }

  async handle(data) {
    const zaloId = ZaloIdentifier.factory({
      zaloIdByOA: data.sender.id, OAID: data.recipient.id, appId: data.app_id, zaloIdByApp: data.user_id_by_app,
    });
    const interestedUser = await this.zaloInterestedUserProvider.findByZaloId(zaloId);
    return this.zaloInterestedUserProvider.update(interestedUser.id, {
      phone: data.info.phone,
      info: data.info,
    });
  }

  static getEvent() {
    return 'user_submit_info';
  }
}

module.exports = UserShareInfoEventHandler;
