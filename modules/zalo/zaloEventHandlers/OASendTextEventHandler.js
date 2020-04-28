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
    const jsonData = createdMessage.toJson();
    const {
      loggedUser,
      interestedUser,
    } = data;
    const emitData = {
      ...jsonData,
      to: {
        id: interestedUser.id,
        displayName: interestedUser.displayName,
        avatar: interestedUser.avatar,
      },
      from: {
        id: loggedUser.id,
        displayName: loggedUser.name,
        avatar: loggedUser.avatar,
      },
    };
    await this.pubsub.publish(ZALO_MESSAGE_SENT, { onZaloMessageSent: emitData });
    await this.pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: emitData });
    return createdMessage;
  }

  static getEvent() {
    return 'oa_send_text';
  }

  async mapDataFromZalo(data, user = null, intUser = null) {
    const loggedUser = user || await this.userProvider.findByZaloId(data.sender.id);
    const interestedUser = intUser || await this.zaloInterestedUserProvider.findByZaloId(data.recipient.id);
    return {
      ...data,
      from: {
        id: loggedUser.id,
      },
      to: {
        id: interestedUser.id,
      },
      loggedUser,
      interestedUser,
    };
  }
}

module.exports = OASendTextEventHandler;
