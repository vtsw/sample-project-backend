class ZaloMessageBroker {
  constructor(http, config) {
    this.http = http;
    this.config = config;
  }

  send(message, recipient, sender) {
    const { accessToken } = sender.zaloOA;
    const body = {
      recipient: {
        user_id: recipient,
      },
      message: {
        text: message,
      },
    };
    return this.http(`https://openapi.zalo.me/v2.0/oa/message?access_token=${accessToken}`, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

module.exports = ZaloMessageBroker;
