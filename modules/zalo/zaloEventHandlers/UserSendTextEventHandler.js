const { ZALO_MESSAGE_RECEIVED, ZALO_MESSAGE_CREATED } = require('../../zaloMessage/events');

class UserSendTextEventHandler {
  constructor(zaloMessageProvider, pubsub, userProvider, zaloInterestedUserProvider) {
    this.name = UserSendTextEventHandler.getEvent();
    this.zaloMessageProvider = zaloMessageProvider;
    this.userProvider = userProvider;
    this.zaloInterestedUserProvider = zaloInterestedUserProvider;
    this.pubsub = pubsub;
  }

  async handle(data) {
    const createdMessage = await this.zaloMessageProvider.create({
      timestamp: data.timestamp,
      from: data.from,
      content: data.message.text,
      to: data.to,
      zaloMessageId: data.message.msg_id,
    });
    const jsonData = createdMessage.toJson();
    await Promise.all([
      this.pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: jsonData }),
      this.pubsub.publish(ZALO_MESSAGE_RECEIVED, { onZaloMessageReceived: jsonData }),
    ]);
    return createdMessage;
  }

  static getEvent() {
    return 'user_send_text';
  }

  async mapDataFromZalo(data, user = null, intUser = null) {
    const [loggedUser, interestedUser] = await Promise.all([
      user ? Promise.resolve(user) : this.userProvider.findByZaloId(data.recipient.id),
      intUser ? Promise.resolve(intUser) : this.zaloInterestedUserProvider.findByZaloId(data.sender.id),
    ]);

    return {
      ...data,
      to: {
        id: loggedUser.id,
        displayName: loggedUser.name,
        avatar: loggedUser.image.link,
      },
      from: {
        id: interestedUser.id,
        displayName: interestedUser.displayName,
        avatar: interestedUser.avatar,
      },
      loggedUser,
      interestedUser,
    };
  }
}

module.exports = UserSendTextEventHandler;
