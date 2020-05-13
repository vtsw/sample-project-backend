class ZaloMessageSender {
  constructor(request, config) {
    this.request = request;
    this.config = config;
  }

  async send(message, recipient, sender) {
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
}

module.exports = ZaloMessageSender;
