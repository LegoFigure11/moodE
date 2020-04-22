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
				console.log("Failed to log in");
				process.exit();
			}

			console.log(`${showdownText}Successfully logged in!`);
			if (psConfig.rooms) {
				if (!(psConfig.rooms instanceof Array)) throw new Error("Config.rooms must be an array");
				for (let i = 0, len = psConfig.rooms.length; i < len; i++) {
					psClient.send("|/join " + psConfig.rooms[i]);
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
		}
	}
}

exports.MessageParser = new MessageParser();
