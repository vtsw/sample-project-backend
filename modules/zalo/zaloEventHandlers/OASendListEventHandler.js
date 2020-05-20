const { ZALO_MESSAGE_RECEIVED, ZALO_MESSAGE_CREATED, ZALO_MESSAGE_SENT } = require('../../zaloMessage/events');

class OASendListEventHandler {
  constructor(zaloMessageProvider, pubsub, userProvider, zaloInterestedUserProvider) {
    this.name = OASendListEventHandler.getEvent();
    this.zaloMessageProvider = zaloMessageProvider;
    this.userProvider = userProvider;
    this.zaloInterestedUserProvider = zaloInterestedUserProvider;
    this.pubsub = pubsub;
  }

  async handle(data) {
    const [OAUser, interestedUser] = await Promise.all([
      this.userProvider.findByZaloId(data.sender.id),
      this.zaloInterestedUserProvider.findByOAFollowerId(data.recipient.id),
    ]);

    if(! OAUser) {
      throw new Error("OAUser not found !")
    }

    if(! interestedUser) {
      throw new Error("interestedUser not found !")
    }
    
    const createdMessage = await this.zaloMessageProvider.create({
      timestamp: data.timestamp,
      from: {
        id: OAUser.id ,
        displayName: OAUser.name,
        avatar: OAUser.image.link,
      },
      content: null,
      attachments: data.message.attachments,
      to: {
        id: interestedUser.id,
        displayName: interestedUser.displayName,
        avatar: interestedUser.avatar,
      },
      zaloMessageId: data.message.msg_id,
      type: 'Reservation',
    });

    await Promise.all([
      this.pubsub.publish(ZALO_MESSAGE_SENT, { onZaloMessageSent: createdMessage.toJson() }),
      this.pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: createdMessage.toJson() }),
    ]);

    return createdMessage;
  }

  static getEvent() {
    return 'oa_send_list';
  }

  async mapDataFromZalo(data, user = null, intUser = null) {
    const [loggedUser, interestedUser] = await Promise.all([
      user ? Promise.resolve(user) : this.userProvider.findByZaloId(data.recipient.id),
      intUser ? Promise.resolve(intUser) : this.zaloInterestedUserProvider.findByZaloId(data.user_id_by_app),
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

module.exports = OASendListEventHandler;
