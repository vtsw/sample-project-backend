class ReservationRequest {
  constructor(id) {
    this.data = {
      id,
      source: null,
      sender: {},
      recipient: {},
      userId: null,
      corId: null,
      timestamp: null,
      payload: {},
    };
  }

  get id() {
    return this.data.id;
  }

  set id(value) {
    this.data.id = value;
  }

  get source() {
    return this.data.source;
  }

  set source(value) {
    this.data.source = value;
  }

  get timestamp() {
    return this.data.senderId;
  }

  set sender(value) {
    this.data.sender = value;
  }

  get sender() {
    return this.data.sender;
  }

  set recipient(value) {
    this.data.sender = value;
  }

  get recipient() {
    return this.data.sender;
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

  set timestamp(value) {
    this.data.timestamp = value;
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
