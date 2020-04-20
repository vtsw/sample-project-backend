class Customer {
  constructor(id) {
    this.data = {
      id,
      name: null,
      phoneNo: null,
      zaloSocialAccount: null,
    };
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  set name(value) {
    this.data.name = value;
  }

  get phoneNo() {
    return this.data.phoneNo;
  }

  get zaloSocialAccount() {
    return this.data.zaloSocialAccount;
  }

  set zaloSocialAccount(value) {
    this.data.zaloSocialAccount = value;
  }

  toJson() {
    return this.data;
  }
}

module.exports = Customer;
