const { ZALO_MESSAGE_SENT, ZALO_MESSAGE_CREATED } = require('../../zaloMessage/events');
const ZaloIdentifier = require('../ZaloIdentifier');

class OASendFileEventHandler {
  constructor(zaloInterestedUserProvider, userProvider, zaloMessageProvider, pubsub) {
    this.zaloInterestedUserProvider = zaloInterestedUserProvider;
    this.userProvider = userProvider;
    this.zaloMessageProvider = zaloMessageProvider;
    this.pubsub = pubsub;
  }

  async handle(data) {
    const message = await this.zaloMessageProvider.findByZaloMessageId(data.message.msg_id);
    if (message) {
      return message;
    }
    const zaloId = ZaloIdentifier.factory({
      zaloIdByOA: data.recipient.id, OAID: data.sender.id, appId: data.app_id, zaloIdByApp: data.user_id_by_app,
    });
    const [OAUser, interestedUser] = await Promise.all([
      this.userProvider.findByZaloId(data.sender.id),
      this.zaloInterestedUserProvider.findByZaloId(zaloId),
    ]);

    const createdMessage = await this.zaloMessageProvider.create({
      timestamp: data.timestamp,
      from: {
        id: OAUser.id,
        displayName: OAUser.name,
        avatar: OAUser.image.link,
      },
      content: data.message.text,
      attachments: data.message.attachments,
      to: {
        id: interestedUser.id,
        displayName: interestedUser.displayName,
        avatar: interestedUser.avatar,
      },
      zaloMessageId: data.message.msg_id,
      type: 'File',
    });

    await Promise.all([
      this.pubsub.publish(ZALO_MESSAGE_SENT, { onZaloMessageSent: createdMessage.toJson() }),
      this.pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: createdMessage.toJson() }),
    ]);

    return createdMessage;
  }

  static getEvent() {
    return 'oa_send_file';
  }
}

module.exports = OASendFileEventHandler;
