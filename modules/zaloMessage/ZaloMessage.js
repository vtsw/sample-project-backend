class ZaloMessage {
  constructor(id) {
    this.data = {
      id,
      from: null,
      to: null,
      content: null,
      timestamp: null,
    };
  }

  get id() {
    return this.data.id;
  }

  get from() {
    return this.data.from;
  }

  set from(value) {
    this.data.from = value;
  }

  get to() {
    return this.data.to;
  }

  set to(value) {
    this.data.to = value;
  }

  get content() {
    return this.data.content;
  }

  set content(value) {
    this.data.content = value;
  }

  get timestamp() {
    return this.data.timestamp;
  }

  set timestamp(value) {
    this.data.timestamp = value;
  }

  toJson() {
    return this.data;
  }
}

module.exports = ZaloMessage;
