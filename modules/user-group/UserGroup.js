class UserGroup {
  constructor(id) {
    this.data = {
      id,
      name: null,
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

  toJson() {
    return this.data;
  }
}

module.exports = UserGroup;
