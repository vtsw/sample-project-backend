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
    const {
      loggedUser,
      interestedUser,
    } = data;
    const createdMessage = await this.zaloMessageProvider.create({
      timestamp: data.timestamp,
      from: data.from.id,
      content: data.message.text,
      to: data.to.id,
      metaData: data,
    });
    const jsonData = createdMessage.toJson();
    const emitData = {
      ...jsonData,
      to: {
        id: loggedUser.id,
        displayName: loggedUser.name,
        avatar: loggedUser.avatar,
      },
      from: {
        id: interestedUser.id,
        displayName: interestedUser.displayName,
        avatar: interestedUser.avatar,

      },
    };
    await this.pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: emitData });
    await this.pubsub.publish(ZALO_MESSAGE_RECEIVED, { onZaloMessageReceived: emitData });
    return createdMessage;
  }

  static getEvent() {
    return 'user_send_text';
  }

  async mapDataFromZalo(data, user = null, intUser = null) {
    const loggedUser = user || await this.userProvider.findByZaloId(data.recipient.id);
    const interestedUser = intUser || await this.zaloInterestedUserProvider.findByZaloId(data.sender.id);
    return {
      ...data,
      to: {
        id: loggedUser.id,
      },
      from: {
        id: interestedUser.id,
      },
      loggedUser,
      interestedUser,
    };
  }
}

module.exports = UserSendTextEventHandler;
