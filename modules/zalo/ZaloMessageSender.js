class ZaloMessageSender {
  constructor(request, config, zaloUploader) {
    this.request = request;
    this.config = config;
    this.zaloUploader = zaloUploader;
  }

  async sendText(message, recipient, sender) {
    const { zaloApi: { officialAccount: { sendMessageToInterestedUser } } } = this.config;
    const { accessToken } = sender.zaloOA;
    const body = {
      recipient: {
        user_id: recipient.zaloId,
      },
      message,
    };
    return this.request(`${sendMessageToInterestedUser}?access_token=${accessToken}`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());
  }

  async sendImage({ file, content }, recipient, sender) {
    const { zaloApi: { officialAccount: { sendMessageToInterestedUser } } } = this.config;
    const uploadResult = await this.zaloUploader.uploadImage(file, sender);
    if (uploadResult.error) {
      throw new Error(uploadResult.message);
    }
    const { accessToken } = sender.zaloOA;
    const body = {
      recipient: {
        user_id: recipient.zaloId,
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
    const { accessToken } = sender.zaloOA;
    const body = {
      recipient: {
        user_id: recipient.zaloId,
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
    const { accessToken } = sender.zaloOA;
    const body = {
      recipient: {
        user_id: recipient.zaloId,
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
}

module.exports = ZaloMessageSender;
