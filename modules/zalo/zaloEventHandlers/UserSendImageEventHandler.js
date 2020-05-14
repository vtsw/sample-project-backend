const { ZALO_MESSAGE_RECEIVED, ZALO_MESSAGE_CREATED } = require('../../zaloMessage/events');

class UserSendImageEventHandler {
  constructor(zaloMessageProvider, pubsub, userProvider, zaloInterestedUserProvider) {
    this.name = UserSendImageEventHandler.getEvent();
    this.zaloMessageProvider = zaloMessageProvider;
    this.userProvider = userProvider;
    this.zaloInterestedUserProvider = zaloInterestedUserProvider;
    this.pubsub = pubsub;
  }

  async handle(data) {
    const message = await this.zaloMessageProvider.findByZaloMessageId(data.message.msg_id);
    if (message) {
      return message;
    }
    const [oaUser, interestedUser] = await Promise.all([
      this.userProvider.findByZaloId(data.recipient.id),
      this.zaloInterestedUserProvider.findByZaloId(data.user_id_by_app),
    ]);
    const createdMessage = await this.zaloMessageProvider.create({
      timestamp: data.timestamp,
      to: {
        id: oaUser.id,
        displayName: oaUser.name,
        avatar: oaUser.image.link,
      },
      from: {
        id: interestedUser.id,
        displayName: interestedUser.displayName,
        avatar: interestedUser.avatar,
      },
      content: data.message.text,
      attachments: data.message.attachments,
      zaloMessageId: data.message.msg_id,
      type: data.event_name === UserSendImageEventHandler.getEvent() ? 'Image' : 'Gif',
    });
    await Promise.all([
      this.pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: createdMessage.toJson() }),
      this.pubsub.publish(ZALO_MESSAGE_RECEIVED, { onZaloMessageReceived: createdMessage.toJson() }),
    ]);
    return createdMessage;
  }

  static getEvent() {
    return 'user_send_image';
  }
}

module.exports = UserSendImageEventHandler;
