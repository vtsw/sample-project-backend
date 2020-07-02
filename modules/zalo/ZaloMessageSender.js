const { ZaloApiError } = require('../errors');

class ZaloMessageSender {
  constructor(request, config, zaloUploader) {
    this.request = request;
    this.config = config;
    this.zaloUploader = zaloUploader;
  }

  /**
   *
   * @param {Object} param0
   * @param {String} recipientId
   * @param {User} sender
   */
  async sendRequestUserInfo({ content }, recipientId, sender) {
    const { zaloApi: { officialAccount: { sendMessageToInterestedUser } } } = this.config;
    const { credential: { accessToken }, cover } = sender;
    const body = {
      recipient: {
        user_id: recipientId,
      },
      message: {
        text: content,
        attachment: {
          type: 'template',
          payload: {
            template_type: 'request_user_info',
            elements: [{
              title: 'Request to grant access your information.',
              subtitle: 'Request to grant access your information',
              image_url: cover,
            }],
          },
        },
      },
    };
    const response = await this.request(`${sendMessageToInterestedUser}?access_token=${accessToken}`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());
    if (response.error) {
      throw new ZaloApiError(response.error, response.message);
    }
    return response;
  }

  sendText(message, recipient, sender) {
    const { zaloApi: { officialAccount: { sendMessageToInterestedUser } } } = this.config;
    const { credential: { accessToken }, oaId } = sender;
    const body = {
      recipient: {
        user_id: recipient.getFollowingByZaloOAId(oaId).zaloIdByOA,
      },
      message,
    };
    return this.request(`${sendMessageToInterestedUser}?access_token=${accessToken}`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());
  }

  /**
   *
   * @param file
   * @param content
   * @param recipient
   * @param sender
   * @returns {Promise<*>}
   */
  async sendImage({ file, content }, recipient, sender) {
    const { zaloApi: { officialAccount: { sendMessageToInterestedUser } } } = this.config;
    const uploadResult = await this.zaloUploader.uploadImage(file, sender);
    if (uploadResult.error) {
      throw new Error(uploadResult.message);
    }
    const { credential: { accessToken }, _id } = sender;
    const body = {
      recipient: {
        user_id: recipient.getFollowingByCleverOAId(_id).zaloIdByOA,
      },
      message: {
        text: content,
        attachment: {
          type: 'template',
          payload: {
            template_type: 'media',
            elements: [{
              media_type: 'image',
              attachment_id: uploadResult.data.attachment_id,
            }],
          },
        },
      },
    };
    return this.request(`${sendMessageToInterestedUser}?access_token=${accessToken}`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());
  }

  async sendGif({ file, content }, recipient, sender) {
    const { zaloApi: { officialAccount: { sendMessageToInterestedUser } } } = this.config;
    const uploadResult = await this.zaloUploader.uploadGif(file, sender);
    if (uploadResult.error) {
      throw new Error(uploadResult.message);
    }
    const { credential: { accessToken }, _id } = sender;
    const body = {
      recipient: {
        user_id: recipient.getFollowingByCleverOAId(_id).zaloIdByOA,
      },
      message: {
        text: content,
        attachment: {
          type: 'template',
          payload: {
            template_type: 'media',
            elements: [{
              media_type: 'gif',
              attachment_id: uploadResult.data.attachment_id,
            }],
          },
        },
      },
    };
    return this.request(`${sendMessageToInterestedUser}?access_token=${accessToken}`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());
  }

  async sendFile({ file }, recipient, sender) {
    const { zaloApi: { officialAccount: { sendMessageToInterestedUser } } } = this.config;
    const res = await this.zaloUploader.uploadFile(file, sender);
    if (res.error) {
      throw new Error(res.message);
    }
    const { credential: { accessToken }, _id } = sender;
    const body = {
      recipient: {
        user_id: recipient.getFollowingByCleverOAId(_id).zaloIdByOA,
      },
      message: {
        attachment: {
          payload: {
            token: res.data.token,
          },
          type: 'file',
        },
      },
    };
    return this.request(`${sendMessageToInterestedUser}?access_token=${accessToken}`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }).then((response) => response.json());
  }

  async sendListElement({ attachment }, recipient, sender) {
    const { zaloApi: { officialAccount: { sendMessageToInterestedUser } } } = this.config;
    const { credential: { accessToken }, _id } = sender;
    const body = {
      recipient: {
        user_id: recipient.getFollowingByCleverOAId(_id).zaloIdByOA,
      },
      message: {
        attachment,
      },
    };

    const response = await this.request(`${sendMessageToInterestedUser}?access_token=${accessToken}`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  }
}

module.exports = ZaloMessageSender;
