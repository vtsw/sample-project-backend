class ZaloSocialAccount {
    constructor(id) {
      this.data = {
        id,
        socialId: null,
        socialAccessToken: null,
        socialAccessTokenLastUpdated: null,
        zaloCleverApp: null,
        socialInfo: null,
      };
    }
  
    get id() {
      return this.data.id;
    }
  
    get socialId() {
      return this.data.socialId;
    }
  
    set socialId(value) {
      this.data.socialId = value;
    }
  
    get socialAccessToken() {
      return this.data.socialAccessToken;
    }
  
    set socialAccessToken(value) {
      this.data.socialAccessToken = value;
    }
    
    get socialAccessTokenLastUpdated() {
      return this.data.socialAccessTokenLastUpdated;
    }
  
    set socialAccessTokenLastUpdated(value) {
      this.data.socialAccessTokenLastUpdated = value;
    }

    get zaloCleverApp() {
      return this.data.zaloCleverApp;
    }
  
    set zaloCleverApp(value) {
      this.data.zaloCleverApp = value;
    }

    get socialInfo() {
      return this.data.socialInfo;
    }
  
    set socialInfo(value) {
      this.data.socialInfo = value;
    }
  
    toJson() {
      return this.data;
    }
  }
  
  module.exports = ZaloSocialAccount;
  