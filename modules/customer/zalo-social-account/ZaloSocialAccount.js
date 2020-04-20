class ZaloSocialAccount {
  constructor(id) {
    this.data = {
      id,
      socialId: null,
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
