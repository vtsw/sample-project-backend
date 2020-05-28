const ZaloIdentifier = require('./ZaloIdentifier');

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

  get phoneNumber() {
    return this.data.phoneNumber;
  }

  set phoneNumber(value) {
    this.data.phoneNumber = value;
  }

  getZaloIdByOAId(oaId) {
    return ZaloIdentifier.factory(this.data.followings.find((item) => item.OAID === oaId));
  }

  constructor(id) {
    this.data = {
      id,
      displayName: null,
      phoneNumber: null,
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
