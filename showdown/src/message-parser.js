"use strict";

class Context {
	constructor(target, room, user, command, originalCommand, time) {
		this.target = target ? target.trim() : "";
		this.room = room;
		this.user = user;
		this.command = command;
		this.originalCommand = originalCommand;
		this.time = time || Date.now();
	}

	say(text) {
		this.room.say(text);
	}

	pm(user, message) {
		if (typeof user === "string") user = psUsers.add(user);
		user.say(message);
	}
}

exports.Context = Context;

class MessageParser {
	constructor() {
		this.formatsList = [];
		this.formatsData = {};
		this.globalContext = new Context("", psRooms.globalRoom, psUsers.self, "", "");
	}

	parse(message, room) {
		const splitMessage = message.split("|").slice(1);
		const messageType = splitMessage[0];
		splitMessage.shift();

		switch (messageType) {
		case "challstr":
			psClient.challstr = splitMessage.join("|");
			psClient.login();
			break;
		case "updateuser":
			const parsedUsername = Tools.parseUsernameText(splitMessage[0]);
			if (Tools.toId(parsedUsername.username) !== psUsers.self.id) return;

			if (psClient.connectTimeout) clearTimeout(psClient.connectTimeout);
			if (splitMessage[1] !== "1") {
				console.log(`${showdownText}${"Failed to log in.".brightRed}`);
				process.exit();
			}

			console.log(`${showdownText}Successfully logged in!`);
			if (psConfig.rooms) {
				if (!(psConfig.rooms instanceof Array)) throw new Error("Config.rooms must be an array");
				for (const room of psConfig.rooms) {
					psClient.send(`|/join ${room}`);
				}
			}
			if (psConfig.avatar) psClient.send("|/avatar " + psConfig.avatar);
			break;
		case "init":
			room.onJoin(psUsers.self, " ");
			console.log(`${showdownText}Joined room: ${room.id.green}`);
			break;
		case "noinit":
			console.log(`${showdownText}Could not join room: ${room.id.brightRed}`);
			psRooms.destroy(room);
			break;
		case "deinit":
			psRooms.destroy(room);
			break;
		case "users":
			if (splitMessage[0] === "0") return;
			const users = splitMessage[0].split(",");
			for (let i = 1, len = users.length; i < len; i++) {
				const parsedUsername = Tools.parseUsernameText(users[i].substr(1));
				const user = psUsers.add(parsedUsername.username);
				const rank = users[i].charAt(0);
				room.users.set(user, rank);
				user.rooms.set(room, rank);
			}
			break;
		case "c:":
			const user = psUsers.get(splitMessage[1]);
			const rank = splitMessage[1].charAt(0);
			if (user.rooms.get(room) !== rank) user.rooms.set(room, rank);
			let message = splitMessage.slice(2).join("|");
			message = message.trim();
			const time = parseInt(splitMessage[0]) * 1000;
			if (message.charAt(0) === psConfig.commandCharacter) {
				try {
					psCommandHandler.executeCommand(message, room, user, time);
				} catch (e) {}
			}
			break;
		case "pm": {
			const user = psUsers.add(splitMessage[0]);
			if (!user) return;
			if (user.id === psUsers.self.id) return;
			user.globalRank = (splitMessage[0][0]);
			psCommandHandler.executeCommand(splitMessage.slice(2).join("|"), user, user);
			break;
		}
		case "N":
		case "n": {
			const user = psUsers.add(splitMessage[1].split("@")[0]);
			if (!user) return;
			const zn = splitMessage[0].replace(/^./, "");
			const n = zn.indexOf("@");
			const text = zn.substring(0, n !== -1 ? n : splitMessage[0].length);
			let status = zn.substring(n !== -1 ? n + 1 : zn.length, zn.length);
			if (status.charAt(0) === "!") {
				user.away = true;
				status = status.substr(1);
			} else { user.away = false; }
			user.status = status;
			if (status.length > 6) {
				console.log(user.id + ", " + room.id + ": " + status);
			}
			splitMessage[0] = splitMessage[0][0] + text;
			if (!user.alts.includes(Tools.toId(splitMessage[0]))) {
				user.alts.push(Tools.toId(splitMessage[0]));
			}
			if (!user.alts.includes(Tools.toId(splitMessage[1]))) {
				user.alts.push(Tools.toId(splitMessage[1]));
			}
			room.onRename(user, splitMessage[0]);
			if (Storage.globalDatabase.mail && user.id in Storage.globalDatabase.mail) {
				const mail = Storage.globalDatabase.mail[user.id];
				for (let i = 0, len = mail.length; i < len; i++) {
					user.say("[" + Tools.toDurationString(Date.now() - mail[i].time) + " ago] **" + mail[i].from + "** said: " + mail[i].text);
				}
				delete Storage.globalDatabase.mail[user.id];
				Storage.exportDatabase("global");
			}
			break;
		}
		case "J":
		case "j": {
			// remove first character (so that we don't get false positives for Moderators)
			const zn = splitMessage[0].replace(/^./, "");
			// search for the @ character and delete the status that comes after
			const n = zn.indexOf("@");
			const text = zn.substring(0, n !== -1 ? n : splitMessage[0].length);
			splitMessage[0] = splitMessage[0][0] + text;
			const user = psUsers.add(splitMessage[0]);
			if (!user) return;
			// get the status from what comes after the @
			let status = zn.substring(n !== -1 ? n + 1 : zn.length, zn.length);
			if (status.charAt(0) === "!") {
				user.away = true;
				status = status.substr(1);
			} else {
				user.away = false;
			}
			user.status = status;
			room.onJoin(user, splitMessage[0].charAt(0));
			if (Storage.globalDatabase.mail && user.id in Storage.globalDatabase.mail) {
				const mail = Storage.globalDatabase.mail[user.id];
				for (let i = 0, len = mail.length; i < len; i++) {
					user.say("[" + Tools.toDurationString(Date.now() - mail[i].time) + " ago] **" + mail[i].from + "** said: " + mail[i].text);
				}
				delete Storage.globalDatabase.mail[user.id];
				Storage.exportDatabase("global");
			}
			break;
		}
		}
	}
}

exports.MessageParser = new MessageParser();
