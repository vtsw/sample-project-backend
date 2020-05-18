class ZaloInterestedUser {
  get displayName() {
    return this.data.displayName;
  }

  set displayName(value) {
    this.data.displayName = value;
  }

  get dob() {
    return this.data.dob;
  }

  set dob(value) {
    this.data.dob = value;
  }

  get gender() {
    return this.data.gender;
  }

  set gender(value) {
    this.data.gender = value;
  }

  get avatar() {
    return this.data.avatar;
  }

  set avatar(value) {
    this.data.avatar = value;
  }

  get avatars() {
    return this.data.avatars;
  }

  set avatars(value) {
    this.data.avatars = value;
  }

  get lastModified() {
    return this.data.lastModified;
  }

  set lastModified(value) {
    this.data.lastModified = value;
  }

  get timestamp() {
    return this.data.timestamp;
  }

  set timestamp(value) {
    this.data.timestamp = value;
  }

  get followings() {
    return this.data.followings;
  }

  set followings(value) {
    this.data.followings = value;
  }

  get info() {
    return this.data.info;
  }

  set info(value) {
    this.data.info = value;
  }

  get id() {
    return this.data.id;
  }

  set id(value) {
    this.data.id = value;
  }

  get zaloId() {
    return this.data.zaloId;
  }

  set zaloId(value) {
    this.data.zaloId = value;
  }

  constructor(id) {
    this.data = {
      id,
      zaloId: null,
      displayName: null,
      dob: null,
      gender: null,
      avatar: null,
      avatars: [],
      lastModified: null,
      timestamp: null,
      followings: [],
      info: null,
    };
    this._id = id;
  }

  toJson() {
    return this.data;
  }
}

module.exports = ZaloInterestedUser;
