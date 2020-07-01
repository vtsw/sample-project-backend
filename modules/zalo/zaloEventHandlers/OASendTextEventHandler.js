const { ZALO_MESSAGE_SENT, ZALO_MESSAGE_CREATED } = require('../../zaloMessage/events');

class OASendTextEventHandler {
  /**
   *
   * @param zaloMessageProvider
   * @param pubsub
   * @param zaloOAProvider
   * @param zaloSAProvider
   * @param zaloAuthenticator
   */
  constructor(zaloMessageProvider, pubsub, zaloOAProvider, zaloSAProvider, zaloAuthenticator) {
    this.name = OASendTextEventHandler.getEvent();
    this.zaloMessageProvider = zaloMessageProvider;
    this.pubsub = pubsub;
    this.zaloOAProvider = zaloOAProvider;
    this.zaloSAProvider = zaloSAProvider;
    this.zaloAuthenticator = zaloAuthenticator;
  }

  async handle(req) {
    const { headers, body: data } = req;
    const message = await this.zaloMessageProvider.findOne({ zaloMessageId: data.message.msg_id });
    if (message) {
      return message;
    }
    const [OAUser, interestedUser] = await Promise.all([
      this.zaloOAProvider.findOne({ oaId: data.sender.id }),
      this.zaloSAProvider.findOne({
        followings: {
          $elemMatch: {
            appId: data.app_id, zaloIdByApp: data.user_id_by_app, zaloIdByOA: data.recipient.id, oaId: data.sender.id, state: 'PHONE_NUMBER_PROVIDED',
          },
        },
      }),
    ]);
    this.zaloAuthenticator.verifySignature(headers['x-zevent-signature'], data, OAUser);
    const createdMessage = await this.zaloMessageProvider.create({
      timestamp: data.timestamp,
      from: {
        id: OAUser._id,
        displayName: OAUser.name,
        avatar: OAUser.avatar,
        zaloId: OAUser.oaId,
      },
      content: data.message.text,
      to: {
        id: interestedUser._id,
        displayName: interestedUser.name,
        avatar: interestedUser.avatar,
        zaloId: data.recipient.id,
      },
      zaloMessageId: data.message.msg_id,
      type: 'Text',
    });

    await Promise.all([
      this.pubsub.publish(ZALO_MESSAGE_SENT, { onZaloMessageSent: createdMessage }),
      this.pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: createdMessage }),
    ]);
    return createdMessage;
  }

  static getEvent() {
    return 'oa_send_text';
  }
}

module.exports = OASendTextEventHandler;
