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
    const createdMessage = await this.zaloMessageProvider.create({
      timestamp: data.timestamp,
      from: data.from.id,
      content: data.message.text,
      to: data.to.id,
      metaData: data,
    });
    await this.pubsub.publish(ZALO_MESSAGE_SENT, { onZaloMessageSent: createdMessage.toJson() });
    await this.pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: createdMessage.toJson() });
    return createdMessage;
  }

  static getEvent() {
    return 'oa_send_text';
  }

  async mapDataFromZalo(data, loggedUser = null, intUser = null) {
    const user = loggedUser || await this.userProvider.findByZaloId(data.sender.id);
    const interestedUser = intUser || await this.zaloInterestedUserProvider.findByZaloId(data.recipient.id);
    return {
      ...data,
      from: {
        id: user.id,
      },
      to: {
        id: interestedUser.id,
      },
    };
  }
}

module.exports = OASendTextEventHandler;
