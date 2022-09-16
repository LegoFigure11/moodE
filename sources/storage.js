/**
 * Storage
 * Cassius - https://github.com/sirDonovan/Cassius
 *
 * This file handles the storage of room databases
 *
 * @license MIT license
 */
"use strict";

const fs = require("fs");
const BACKUP_INTERVAL = 60 * 60 * 1000;

class Storage {
	constructor() {
		this.databases = {};
		this.globalDatabase = {};
		this.backupInterval = setInterval(() => this.exportDatabases(), BACKUP_INTERVAL);
	}

	/**
	 * @param {string} roomid
	 * @returns {AnyObject}
	 */
	getDatabase(roomid) {
		if (!(roomid in this.databases)) this.databases[roomid] = {};
		// sync database properties
		if (roomid === "global" && !this.databases[roomid].mail) this.databases[roomid].mail = {};
		return this.databases[roomid];
	}

	/**
	 * @param {string} roomid
	 */
	importDatabase(roomid) {
		let file = "{}";
		try {
			file = fs.readFileSync(`./databases/${roomid}.json`).toString();
		} catch (e) {}
		this.databases[roomid] = JSON.parse(file);
	}

	/**
	 * @param {string} roomid
	 */
	exportDatabase(roomid) {
		if (!(roomid in this.databases)) return;
		fs.writeFileSync(`./databases/${roomid}.json`, JSON.stringify(this.databases[roomid]));
	}

	importDatabases() {
		const databases = fs.readdirSync("./databases");
		for (let i = 0, len = databases.length; i < len; i++) {
			const file = databases[i];
			if (!file.endsWith(".json")) continue;
			this.importDatabase(file.substr(0, file.indexOf(".json")));
		}
	}

	exportDatabases() {
		for (const roomid in this.databases) {
			this.exportDatabase(roomid);
		}
	}

	/**
	 * @param {number} points
	 * @param {User} user
	 * @param {string} roomid
	 */
	addPoints(points, user, roomid) {
		if (isNaN(points)) return;
		if (!(roomid in this.databases)) this.databases[roomid] = {};
		const database = this.databases[roomid];
		if (!("leaderboard" in database)) database.leaderboard = {};
		if (!(user.id in database.leaderboard)) database.leaderboard[user.id] = {points: 0};
		database.leaderboard[user.id].points += points;
		const name = Tools.toAlphaNumeric(user.name);
		if (database.leaderboard[user.id].name !== name) database.leaderboard[user.id].name = name;
	}

	/**
	 * @param {number} points
	 * @param {User} user
	 * @param {string} roomid
	 */
	removePoints(points, user, roomid) {
		this.addPoints(-points, user, roomid);
	}

	/**
	 * @param {User} user
	 * @param {string} roomid
	 */
	getPoints(user, roomid) {
		if (!(roomid in this.databases)) this.databases[roomid] = {};
		const database = this.databases[roomid];
		if (!("leaderboard" in database)) database.leaderboard = {};
		if (!(user.id in database.leaderboard)) return 0;
		return database.leaderboard[user.id].points;
	}
}

module.exports = new Storage();
