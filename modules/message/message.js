class Message {
	_id;
  _content;
	_createdAt;
	_userId;

	constructor(id) {
		this._id = id;
	}

	get userId() {
		return this._userId;
	}

	set userId(value) {
		this._userId = value;
	}
	
	get id() {
		return this._id;
	}

	get content() {
		return this._content;
	}

	set content(value) {
		this._content = value;
	}

	get createdAt() {
		return this._createdAt;
	}

	set createdAt(value) {
		this._createdAt = value;
	}
}

module.exports = Message;