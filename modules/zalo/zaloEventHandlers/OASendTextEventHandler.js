const { ZALO_MESSAGE_SENT } = require('../../zaloMessage/events');

class OASendTextEventHandler {
  constructor(zaloMessageProvider, pubsub) {
    this.name = OASendTextEventHandler.getEvent();
    this.zaloMessageProvider = zaloMessageProvider;
    this.pubsub = pubsub;
  }

  async handle(data) {
    const createdMessage = await this.zaloMessageProvider.create({
      timestamp: data.timestamp,
      from: data.sender.id,
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
