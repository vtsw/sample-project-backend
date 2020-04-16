class UserGroupsBinding  {
  constructor(id) {
    this.data = {
      id,
      userId: null,
      groupId: null,
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

  get groupId() {
    return this.data.groupId;
  }

  set groupId(value) {
    this.data.groupId = value;
  }

  toJson() {
    return this.data;
  }
}

module.exports = UserGroupsBinding;
