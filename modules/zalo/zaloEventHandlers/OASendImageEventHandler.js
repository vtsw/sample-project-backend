const { ZALO_MESSAGE_SENT, ZALO_MESSAGE_CREATED } = require('../../zaloMessage/events');

class OASendImageEventHandler {
  /**
   *
   * @param zaloSAProvider
   * @param zaloOAProvider
   * @param zaloMessageProvider
   * @param pubsub
   * @param zaloAuthenticator
   */
  constructor(zaloSAProvider, zaloOAProvider, zaloMessageProvider, pubsub, zaloAuthenticator) {
    this.zaloSAProvider = zaloSAProvider;
    this.zaloOAProvider = zaloOAProvider;
    this.zaloMessageProvider = zaloMessageProvider;
    this.pubsub = pubsub;
    this.zaloAuthenticator = zaloAuthenticator;
  }

  /**
   *
   * @param req
   * @returns {Promise<void>}
   */
  async handle(req) {
    const { body: data, headers } = req;
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
      attachments: data.message.attachments,
      to: {
        id: interestedUser._id,
        displayName: interestedUser.name,
        avatar: interestedUser.avatar,
        zaloId: data.recipient.id,
      },
      zaloMessageId: data.message.msg_id,
      type: data.event_name === OASendImageEventHandler.getEvent() ? 'Image' : 'Gif',
    });

    await Promise.all([
      this.pubsub.publish(ZALO_MESSAGE_SENT, { onZaloMessageSent: createdMessage }),
      this.pubsub.publish(ZALO_MESSAGE_CREATED, { onZaloMessageCreated: createdMessage }),
    ]);

    return createdMessage;
  }

  static getEvent() {
    return 'oa_send_image';
  }
}

module.exports = OASendImageEventHandler;
