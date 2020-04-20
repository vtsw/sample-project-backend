class CleverZaloBinding {
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
    return this.data.userId;
  }

  set userId(value) {
    this.data.userId = value;
  }

  get zaloOAId() {
    return this.data.zaloOAId;
  }

  set zaloOAId(value) {
    this.data.zaloOAId = value;
  }

  toJson() {
    return this.data;
  }
}

module.exports = CleverZaloBinding;
