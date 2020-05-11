class ZaloReservation {
  constructor(id) {
    this.data = {
      id,
      type : "",
      content: {}
    }
  }

  get id() {
    return this.data.id;
  }

  set id(value) {
    this.data.id = value;
  }

  get type() {
    return this.data.type;
  }

  set type(value) {
    this.data.type = value;
  }

  get content() {
    return this.data.content;
  }

  set content(value) {
    this.data.content = value;
  }

  toJson() {
    return this.data;
  }
}

module.exports = ZaloReservation;
