class ZaloCleverApp {
  constructor(id) {
    this.data = {
      id,
      appId: null,
      appSecret: null,
      appCallbackUrl: null,
    };
  }

  get id() {
    return this.data.id;
  }

  get appId() {
    return this.data.appId;
  }

  set appId(value) {
    this.data.appId = value;
  }

  get appSecret() {
    return this.data.appSecret;
  }

  set appSecret(value) {
    this.data.appSecret = value;
  }

  get appCallbackUrl() {
    return this.data.appCallbackUrl;
  }

  set appCallbackUrl(value) {
    this.data.appCallbackUrl = value;
  }

  toJson() {
    return this.data;
  }
}

module.exports = ZaloCleverApp;
