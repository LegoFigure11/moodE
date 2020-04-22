"use strict";

class Room {
	constructor(id) {
		this.id = id;
		this.clientId = id === "lobby" ? "" : id;
		this.users = new Map();
		this.listeners = {};
		this.game = null;
		this.tour = null;
		this.say = this.say;
	}

	onJoin(user, rank) {
		this.users.set(user, rank);
		user.rooms.set(this, rank);
	}

	onLeave(user, rank) {
		this.users.delete(user);
		this.rooms.delete(this);
	}

	onRename(user, newName) {
		const rank = newName.charAt(0);
		newName = Tools.toName(newName);
		const id = Tools.toId(newName);
		const oldName = user.name;
		if (id === user.id) {
			user.name = newName;
		} else {
			delete Users.users[user.id];
			if (Users.users[id]) {
				user = Users.users[id];
				user.name = newName;
			} else {
				user.name = newName;
				user.id = id;
				Users.users[id] = user;
			}
		}
		this.users.set(user, rank);
		this.users.set(this, rank);
		if (this.game) this.game.renamePlayer(user, oldName);
		if (this.tour) this.tour.renamePlayer(user, oldName);
	}

	say(message, skipNormalization) {
		if (!(skipNormalization)) message = Tools.normalizeMessage(message, this);
		if (!(message)) return;
		psClient.send(`${this.id}|${message}`);
	}

	on(message, listener) {
		message = Tools.normalizeMessage(message, this);
		if (!(message)) return;
		this.listeners[Tools.toId(message)] = listener;
	}
}
exports.Room = Room;

class Rooms {
	constructor() {
		this.rooms = {};
		this.Room = Room;
		this.globalRoom = this.add("global");
	}

	get(id) {
		if (id instanceof Room) return id;
		return this.rooms[id];
	}

	add(id) {
		let room = this.get(id);
		if (!room) {
			room = new Room(id);
			this.rooms[id] = room;
		}
		return room;
	}

	destroy(id) {
		const room = this.get(id);
		if (!room) return;
		if (room.game) room.game.forceEnd();
		if (room.tour) room.tour.end();
		room.users.forEach(function (value, user) {
			user.rooms.delete(room);
		});
		delete this.rooms[room.id];
	}

	destroyRooms() {
		for (const i in this.rooms) {
			this.destroy(i);
		}
	}
}

exports.Rooms = new Rooms();
