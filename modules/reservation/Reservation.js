class Reservation {
  constructor(id) {
    this.data = {
      id,
      type: null,
      doctor: {},
      patient: {},
      reservationTime: null,
    };
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

  get doctor() {
    return this.data.doctor;
  }

  set doctor(value) {
    this.data.doctor = value;
  }

  get patient() {
    return this.data.patient;
  }

  set patient(value) {
    this.data.patient = value;
  }

  get reservationTime() {
    return this.data.reservationTime;
  }

  set reservationTime(value) {
    this.data.reservationTime = value;
  }


  toJson() {
    return this.data;
  }
}

module.exports = Reservation;
