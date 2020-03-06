class Message {
  constructor(id) {
    this.data = {
      id,
      sender: null,
      receiver: null,
      content: null,
      createdAt: null,
    };
  }

  get userId() {
    return this.data.userId;
  }

  set userId(value) {
    this.data.userId = value;
  }

  get id() {
    return this.data.id;
  }

  get content() {
    return this.data.content;
  }

  set content(value) {
    this.data.content = value;
  }

  get createdAt() {
    return this.data.createdAt;
  }

  set createdAt(value) {
    this.data.createdAt = value;
  }

  toJson() {
    return this.data;
  }
}

module.exports = Message;
