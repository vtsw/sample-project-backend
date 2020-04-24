const { ZALO_MESSAGE_RECEIVED } = require('../../zaloMessage/events');
const { ResourceNotFoundError } = require('../../errors');

class UserSendTextEventHandler {
  constructor(zaloMessageProvider, pubsub, userProvider) {
    this.name = UserSendTextEventHandler.getEvent();
    this.zaloMessageProvider = zaloMessageProvider;
    this.userProvider = userProvider;
    this.pubsub = pubsub;
  }

  async handle(data) {
    const user = await this.userProvider.findByZaloId(data.recipient.id);
    if (!user) {
      throw new ResourceNotFoundError('User', {
        ZaloOI: data.recipient.id,
      });
    }
    const createdMessage = await this.zaloMessageProvider.create({
      timestamp: data.timestamp,
      from: data.sender.id,
      content: data.message.text,
      to: user.id,
      metaData: data,
    });
    this.pubsub.publish(ZALO_MESSAGE_RECEIVED, { onZaloMessageReceived: createdMessage.toJson() });
    return createdMessage;
  }

  static getEvent() {
    return 'user_send_text';
  }
}

module.exports = UserSendTextEventHandler;
