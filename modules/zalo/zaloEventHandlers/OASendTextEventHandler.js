const { ZALO_MESSAGE_SENT, ZALO_MESSAGE_CREATED } = require('../../zaloMessage/events');

class OASendTextEventHandler {
  constructor(zaloMessageProvider, pubsub, userProvider, zaloInterestedUserProvider) {
    this.name = OASendTextEventHandler.getEvent();
    this.zaloMessageProvider = zaloMessageProvider;
    this.pubsub = pubsub;
    this.userProvider = userProvider;
    this.zaloInterestedUserProvider = zaloInterestedUserProvider;
    this.context = {};
  }


  async handle(data) {
    if (data.isExist) {
      return data.message;
    }
    const createdMessage = await this.zaloMessageProvider.create({
      timestamp: data.timestamp,
      from: data.from,
      content: data.message.text,
      to: data.to,
      zaloMessageId: data.message.msg_id,
    });
    const jsonData = createdMessage.toJson();
    await Promise.all([
      this.pubsub.publish(ZALO_MESSAGE_SENT, { onZaloMessageSent: jsonData }),
      this.pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: jsonData }),
    ]);
    return createdMessage;
  }

  static getEvent() {
    return 'oa_send_text';
  }

  async mapDataFromZalo(data, user, intUser) {
    const message = await this.zaloMessageProvider.findByZaloMessageId(data.message.msg_id);
    if (message) {
      return {
        isExist: true,
        message,
      };
    }
    const [loggedUser, interestedUser] = await Promise.all([
      user ? Promise.resolve(user) : this.userProvider.findByZaloId(data.sender.id),
      intUser ? Promise.resolve(intUser) : this.zaloInterestedUserProvider.findByZaloId(data.recipient.id),
    ]);
    return {
      ...data,
      from: {
        id: loggedUser.id,
        displayName: loggedUser.name,
        avatar: loggedUser.image.link,
      },
      to: {
        id: interestedUser.id,
        displayName: interestedUser.displayName,
        avatar: interestedUser.avatar,
      },
    };
  }
}

module.exports = OASendTextEventHandler;
