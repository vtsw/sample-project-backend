const { ZALO_MESSAGE_SENT, ZALO_MESSAGE_CREATED } = require('../../zaloMessage/events');

class OASendTextEventHandler {
  constructor(zaloMessageProvider, pubsub, userProvider, zaloInterestedUserProvider) {
    this.name = OASendTextEventHandler.getEvent();
    this.zaloMessageProvider = zaloMessageProvider;
    this.pubsub = pubsub;
    this.userProvider = userProvider;
    this.zaloInterestedUserProvider = zaloInterestedUserProvider;
  }


  async handle(data) {
    const message = await this.zaloMessageProvider.findByZaloMessageId(data.message.msg_id);
    if (message) {
      return message;
    }
    const [OAUser, interestedUser] = await Promise.all([
      this.userProvider.findByZaloId(data.sender.id),
      this.zaloInterestedUserProvider.findByZaloId(data.user_id_by_app),
    ]);
    const createdMessage = await this.zaloMessageProvider.create({
      timestamp: data.timestamp,
      from: {
        id: OAUser.id,
        displayName: OAUser.name,
        avatar: OAUser.image.link,
      },
      content: data.message.text,
      to: {
        id: interestedUser.id,
        displayName: interestedUser.displayName,
        avatar: interestedUser.avatar,
      },
      zaloMessageId: data.message.msg_id,
      type: 'Text',
    });
    await Promise.all([
      this.pubsub.publish(ZALO_MESSAGE_SENT, { onZaloMessageSent: createdMessage.toJson() }),
      this.pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: createdMessage.toJson() }),
    ]);
    return createdMessage;
  }

  static getEvent() {
    return 'oa_send_text';
  }
}

module.exports = OASendTextEventHandler;
