class ZaloMessageSender {
  constructor(http, config) {
    this.http = http;
    this.config = config;
  }

  async send(message, recipient, sender) {
    const { accessToken } = sender.zaloOA;
    const body = {
      recipient: {
        user_id: recipient.zaloId,
      },
      message: {
        text: message,
      },
    };
    const response = await this.http(`https://openapi.zalo.me/v2.0/oa/message?access_token=${accessToken}`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  }
}

module.exports = ZaloMessageSender;
