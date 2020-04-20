class Zalo {
  constructor(id) {
    this.data = {
      id,
      userId: null,
      zaloOAId: null,
    };
  }

  get id() {
    return this.data.id;
  }

  get userId() {
    return this.data.id;
  }

  set userId(value) {
    this.data.id = value;
  }

  get zaloOAId() {
    return this.data.zaloOAId;
  }

  set zaloOAId(value) {
    this.data.zaloOAId = value;
  }
}

module.exports = Zalo;
