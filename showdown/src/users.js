"use strict";

const groups = require("./groups.json");

const PRUNE_INTERVAL = 60 * 60 * 1000;

class User {
	constructor(name, id) {
		this.name = Tools.toName(name);
		this.id = id;
		this.alts = [];
		this.ranks = {};
		this.globalRank = " ";
		this.rooms = new Map();
		this.roomsData = new Map();
		this.game = null;
		this.say = this.say;
	}

	hasRoomRank(room, targetRank) {
		let rank;
		if (typeof room === "string") {
			rank = room;
		} else {
			rank = this.rooms.get(room);
		}
		if (!rank) return false;
		return groups[rank] >= groups[targetRank];
	}

	hasGlobalRank(targetRank) {
		return (groups[this.globalRank] >= groups[targetRank]);
	}

	hasAnyRank(targetRank) {
		const user = this;
		if (groups[user.globalRank] >= groups[targetRank]) {
			return true;
		}
		let returnTrue = false;
		Object.keys(user.ranks).forEach(function (key) {
			if (groups[user.ranks[key]] >= groups[targetRank]) {
				returnTrue = true;
			}
		});
		return returnTrue;
	}

	isDeveloper() {
		return psConfig.developers && psConfig.developers.includes(this.id);
	}

	say(message) {
		message = Tools.normalizeMessage(message);
		if (!message) return;
		psClient.send(`|/pm ${this.id}, ${message}`);
	}
}

exports.User = User;

class Users {
	constructor() {
		this.users = {};
		this.self = this.add(psConfig.username);
		this.pruneUsersInterval = setInterval(() => this.pruneUsers(), PRUNE_INTERVAL);

		this.User = User;
	}
	get(name) {
		if (name instanceof User) return name;
		return this.users[Tools.toId(name)];
	}

	add(name) {
		const id = Tools.toId(name);
		let user = this.get(id);
		if (!user) {
			user = new User(name, id);
			this.users[id] = user;
		}
		return user;
	}

	pruneUsers() {
		const users = Object.keys(this.users);
		users.splice(users.indexOf(this.self.id), 1);
		for (let i = 0, len = users.length; i < len; i++) {
			const user = this.users[users[i]];
			if (!user.rooms.size) {
				delete this.users[user.id];
			}
		}
	}

	destroyUsers() {
		for (const i in this.users) {
			delete this.users[i];
		}
	}
}

exports.Users = new Users();
