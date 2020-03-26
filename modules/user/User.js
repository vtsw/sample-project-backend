class User {
  constructor(id) {
    this.data = {
      id,
      email: null,
      password: null,
      name: null,
      lastModified: null,
      avatar: null,
    };
  }

  get id() {
    return this.data.id;
  }

  get email() {
    return this.data.email;
  }

  set email(value) {
    this.data.email = value;
  }

  get password() {
    return this.data.password;
  }

  set password(value) {
    this.data.password = value;
  }

  get name() {
    return this.data.name;
  }

  set name(value) {
    this.data.name = value;
  }

  set lastModified(value) {
    this.data.lastModified = value;
  }

  get lastModified() {
    return this.data.lastModified;
  }

  set image(value) {
    this.data.image = value;
  }

  get image() {
    return this.data.image;
  }

  toJson() {
    return this.data;
  }
}

module.exports = User;
