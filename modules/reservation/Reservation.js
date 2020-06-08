class Reservation {
  constructor(id) {
    this.data = {
      id,
      type: null,
      sender: {},
      doctor: {},
      patient: {},
      time: null,
    };
  }

  set id(value) {
    this.data.id = value;
  }

  get id() {
    return this.data.id;
  }

  set type(value) {
    this.data.type = value;
  }

  get type() {
    return this.data.type;
  }

  set doctor(value) {
    this.data.doctor = value;
  }

  get doctor() {
    return this.data.doctor;
  }

  set corId(value) {
    this.data.corId = value;
  }

  get corId() {
    return this.data.corId;
  }

  set timestamp(value) {
    this.data.timestamp = value;
  }

  get timestamp() {
    return this.data.timestamp;
  }

  set patient(value) {
    this.data.patient = value;
  }

  get patient() {
    return this.data.patient;
  }

  set time(value) {
    this.data.time = value;
  }

  get time() {
    return this.data.time;
  }

  set sender(value) {
    this.data.sender = value;
  }

  get sender() {
    return this.data.sender;
  }

  toJson() {
    return this.data;
  }
}

module.exports = Reservation;
