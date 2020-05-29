const _ = require('lodash');

class ZaloIdentifier {
  constructor(zaloIdByOA) {
    this.data = {
      zaloIdByApp: null, appId: null, OAID: null, zaloIdByOA, phoneNumber: null,
    };
  }

  set zaloIdByApp(value) {
    this.data.zaloIdByApp = value;
  }

  get zaloIdByApp() {
    return this.data.zaloIdByApp;
  }

  set appId(value) {
    this.data.appId = value;
  }

  get appId() {
    return this.data.appId;
  }

  set OAID(value) {
    this.data.OAID = value;
  }

  get OAID() {
    return this.data.OAID;
  }

  set zaloIdByOA(value) {
    this.data.zaloIdByOA = value;
  }

  get zaloIdByOA() {
    return this.data.zaloIdByOA;
  }

  set phoneNumber(value) {
    this.data.phoneNumber = value;
  }

  get phoneNumber() {
    return this.data.phoneNumber ? `${this.data.phoneNumber}` : null;
  }

  toJson() {
    return _.pickBy(this.data, _.identity);
  }

  static factory(data) {
    const zaloId = new ZaloIdentifier(data.zaloIdByOA);
    zaloId.phoneNumber = data.phoneNumber;
    zaloId.OAID = data.OAID;
    zaloId.appId = data.appId;
    zaloId.zaloIdByApp = data.zaloIdByApp;
    return zaloId;
  }
}

module.exports = ZaloIdentifier;
