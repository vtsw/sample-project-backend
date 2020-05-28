class ReservationRequest {
  constructor(id) {
    this.data = {
      id,
      source: null,
      sender: {},
      recipient: {},
      corId: null,
      timestamp: null,
      messageId: null,
      payload: {},
    };
  }

  set id(value) {
    this.data.id = value;
  }

  get id() {
    return this.data.id;
  }

  set source(value) {
    this.data.source = value;
  }

  get source() {
    return this.data.source;
  }

  set messageId(value) {
    this.data.messageId = value;
  }

  get messageId() {
    return this.data.messageId;
  }

  set timestamp(value) {
    this.data.timestamp = value;
  }

  get timestamp() {
    return this.data.timestamp;
  }

  set sender(value) {
    this.data.sender = value;
  }

  get sender() {
    return this.data.sender;
  }

  set recipient(value) {
    this.data.recipient = value;
  }

  get recipient() {
    return this.data.recipient;
  }

  set corId(value) {
    this.data.corId = value;
  }

  get corId() {
    return this.data.corId;
  }

  set userId(value) {
    this.data.userId = value;
  }

  get userId() {
    return this.data.userId;
  }

  get payload() {
    return this.data.payload;
  }

  set payload(value) {
    this.data.payload = value;
  }

  toJson() {
    return this.data;
  }
}

module.exports = ReservationRequest;
