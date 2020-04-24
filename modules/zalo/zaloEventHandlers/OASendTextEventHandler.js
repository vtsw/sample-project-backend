const { ZALO_MESSAGE_SENT } = require('../../zaloMessage/events');

class OASendTextEventHandler {
  constructor(zaloMessageProvider, pubsub, userProvider) {
    this.name = OASendTextEventHandler.getEvent();
    this.zaloMessageProvider = zaloMessageProvider;
    this.pubsub = pubsub;
    this.userProvider = userProvider;
    this.context = {};
  }

  setContext(context) {
    this.context = context;
    return this;
  }

  async handle(data) {
    let { user } = this.context;
    if (!user) {
      user = await this.userProvider.findByZaloId(data.sender.id);
    }
    const createdMessage = await this.zaloMessageProvider.create({
      timestamp: data.timestamp,
      from: user.id,
      content: data.message.text,
      to: data.recipient.id,
      metaData: data,
    });
    await this.pubsub.publish(ZALO_MESSAGE_SENT, { onZaloMessageCreated: createdMessage.toJson() });
    return createdMessage;
  }

  static getEvent() {
    return 'oa_send_text';
  }
}

module.exports = OASendTextEventHandler;
