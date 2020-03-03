class User {
	_id;
	_password;
	_name;
	_email;

	constructor(id) {
		this._id = id;
	}
	
	get id() {
		return this._id;
	}

	get email() {
		return this._email;
	}

	set email(value) {
		this._email = value;
	}

	get password() {
		return this._password;
	}

	set password(value) {
		this._password = value;
	}

	get name() {
		return this._name;
	}

	set name(value) {
		this._name = value;
	}

	toJson() {
		return {
			id: this._id,
			name: this._name,
			email: this._email,
		}
	}
}

module.exports = User;