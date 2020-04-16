class ZaloCleverApp {
  constructor(id) {
    this.data = {
      id,
      oaId: null,
      appId: null,
      oaAccessToken: null,
      oaAccessTokenLastUpdatedTime: null,
      oaInfo: {},
    };
  }
}

module.exports = ZaloCleverApp
