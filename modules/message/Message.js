class Message {
  /**
   *
   * @param {String} id
   */
  constructor(id) {
    this.attributes = {
      id,
      userId: null,
      content: null,
      lastModified: null,
    };
  }

  get userId() {
    return this.attributes.userId;
  }

  set userId(value) {
    this.attributes.userId = value;
  }

  get id() {
    return this.attributes.id;
  }

  get content() {
    return this.attributes.content;
  }

  set content(value) {
    this.attributes.content = value;
  }

  get lastModified() {
    return this.attributes.lastModified;
  }

  set lastModified(value) {
    this.attributes.lastModified = value;
  }

  toJson() {
    return this.attributes;
  }
}

module.exports = Message;
