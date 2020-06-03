const { ZALO_MESSAGE_RECEIVED, ZALO_MESSAGE_CREATED } = require('../../zaloMessage/events');

class UserSendFileEventHandler {
  constructor(zaloMessageProvider, pubsub, zaloOAProvider, zaloSAProvider) {
    this.name = UserSendFileEventHandler.getEvent();
    this.zaloMessageProvider = zaloMessageProvider;
    this.zaloOAProvider = zaloOAProvider;
    this.zaloSAProvider = zaloSAProvider;
    this.pubsub = pubsub;
  }

  async handle(data) {
    const message = await this.zaloMessageProvider.findOne({ zaloMessageId: data.message.msg_id });
    if (message) {
      return message;
    }
    const [OAUser, interestedUser] = await Promise.all([
      this.zaloOAProvider.findOne({ oaId: data.recipient.id }),
      this.zaloSAProvider.findOne({
        followings: {
          $elemMatch: {
            zaloIdByOA: data.sender.id, oaId: data.recipient.id, appId: data.app_id, zaloIdByApp: data.user_id_by_app, state: 'PHONE_NUMBER_PROVIDED',
          },
        },
      }),
    ]);
    const createdMessage = await this.zaloMessageProvider.create({
      timestamp: data.timestamp,
      to: {
        id: OAUser._id,
        displayName: OAUser.name,
        avatar: OAUser.avatar,
        zaloId: OAUser.oaId,
      },
      from: {
        id: interestedUser._id,
        displayName: interestedUser.name,
        avatar: interestedUser.avatar,
        zaloId: data.recipient.id,
      },
      content: data.message.text,
      attachments: data.message.attachments,
      zaloMessageId: data.message.msg_id,
      type: 'File',
    });
    await Promise.all([
      this.pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: createdMessage }),
      this.pubsub.publish(ZALO_MESSAGE_RECEIVED, { onZaloMessageReceived: createdMessage }),
    ]);
    return createdMessage;
  }

  static getEvent() {
    return 'user_send_file';
  }
}

module.exports = UserSendFileEventHandler;
