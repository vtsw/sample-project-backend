const { ZALO_MESSAGE_RECEIVED, ZALO_MESSAGE_CREATED } = require('../../zaloMessage/events');
const { ResourceNotFoundError } = require('../../errors');

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
      from: data.from.id,
      content: data.message.text,
      to: data.to.id,
      metaData: data,
    });
    await this.pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: createdMessage.toJson() });
    await this.pubsub.publish(ZALO_MESSAGE_RECEIVED, { onZaloMessageReceived: createdMessage.toJson() });
    return createdMessage;
  }

  static getEvent() {
    return 'user_send_text';
  }

  async mapDataFromZalo(data, loggedUser = null, intUser = null) {
    const user = loggedUser || await this.userProvider.findByZaloId(data.recipient.id);
    const interestedUser = intUser || await this.zaloInterestedUserProvider.findByZaloId(data.sender.id);
    return {
      ...data,
      to: {
        id: user.id,
      },
      from: {
        id: interestedUser.id,
      },
    };
  }
}

module.exports = UserSendTextEventHandler;
