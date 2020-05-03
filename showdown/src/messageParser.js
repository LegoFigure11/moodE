"use strict";

const utilities = require("./utilities.js");

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
		this.tourRulesListeners = {};
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
				if (!(psConfig.rooms instanceof Array)) throw new Error("psConfig.rooms must be an array");
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
			utilities.checkForDb("mail", "{}");
			const db = Storage.getDatabase("mail");
			if (user.id in db) {
				const mail = db[user.id];
				for (let i = 0, len = mail.length; i < len; i++) {
					user.say(`[${Tools.toDurationString(Date.now() - mail[i].time)} ago] **${mail[i].from}** said: ${mail[i].text}`);
				}
				delete db[user.id];
				Storage.exportDatabase("mail");
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
			utilities.checkForDb("mail", "{}");
			const db = Storage.getDatabase("mail");
			if (user.id in db) {
				const mail = db[user.id];
				for (let i = 0, len = mail.length; i < len; i++) {
					user.say(`[${Tools.toDurationString(Date.now() - mail[i].time)} ago] **${mail[i].from}** said: ${mail[i].text}`);
				}
				delete db[user.id];
				Storage.exportDatabase("mail");
			}
			break;
		}
		case "formats": {
			this.formatsList = splitMessage.slice();
			this.parseFormats();
			break;
		}
		case "tournament": {
			//if (!psConfig.tournaments || !psConfig.tournaments.includes(room.id)) return;
			switch (splitMessage[0]) {
			case "create": {
				const format = Tools.getFormat(splitMessage[1]);
				if (!format) throw new Error("Unknown format used in tournament (" + splitMessage[1] + ")");
				room.tour = Tournaments.createTournament(room, format, splitMessage[2]);
				if (splitMessage[3]) room.tour.playerCap = parseInt(splitMessage[3]);
				if (room.id === "chinese") {
					// Apparently `format.gen` sometimes === 0, so we have to extract it manually from the id
					const gen = parseInt(format.id.substring(3, 4)) - 1;
					const genStr = [
						"【第一代】", // Gen 1
						"【第二代】", // Gen 2
						"【第三代】", // Gen 3
						"【第四代】", // Gen 4
						"【第五代】", // Gen 5
						"【第六代】", // Gen 6
						"【第七代】", // Gen 7
						"【第八代】", // Gen 8
					][gen];

					let formatName = format.name.substring(format.name.indexOf("] ") + 2);

					switch (format.id.substring(4)) {
					case "challengecup1v1":
						formatName = "挑战杯";
						break;

					case "monotyperandombattle":
						formatName = "同属性随机对战";
						break;

					case "battlefactory":
						formatName = "战斗工厂";
						break;

					case "randombattle":
						formatName = "随机对战";
						break;
					}

					const elim = splitMessage[2] === "Double Elimination" ? "（两条命）" : "";

					const name = `${genStr}${formatName}${elim}`;
					room.say(`/tour name ${name}`);
					room.say("/tour autostart on");
				}
				break;
			}
			case "update": {
				const data = JSON.parse(splitMessage.slice(1).join("|"));
				if (!data || !(data instanceof Object)) return;
				if (!room.tour) {
					const format = Tools.getFormat(data.teambuilderFormat) || Tools.getFormat(data.format);
					if (!format) throw new Error(`Unknown format used in tournament (${(data.teambuilderFormat || data.format)})`);
					room.tour = Tournaments.createTournament(room, format, data.generator);
					room.tour.started = true;
				}
				Object.assign(room.tour.updates, data);
				break;
			}
			case "updateEnd":
				if (room.tour) room.tour.update(room);
				break;
			case "end": {
				const data = JSON.parse(splitMessage.slice(1).join("|"));
				if (!data || !(data instanceof Object)) return;
				if (!room.tour) {
					const format = Tools.getFormat(data.teambuilderFormat) || Tools.getFormat(data.format);
					if (!format) throw new Error(`Unknown format used in tournament (${(data.teambuilderFormat || data.format)})`);
					room.tour = Tournaments.createTournament(room, format, data.generator);
					room.tour.started = true;
				}
				Object.assign(room.tour.updates, data);
				room.tour.update(room);
				room.tour.end(room);
				break;
			}
			case "forceend":
				if (room.tour) room.tour.end(room);
				break;
			case "join":
				if (room.tour) room.tour.addPlayer(splitMessage[1]);
				break;
			case "leave":
				if (room.tour) room.tour.removePlayer(splitMessage[1]);
				break;
			case "disqualify":
				if (room.tour) room.tour.removePlayer(splitMessage[1]);
				break;
			case "start":
				if (room.tour) room.tour.start();
				break;
			case "battlestart":
				if (room.tour && !room.tour.isRoundRobin && room.tour.generator === 1 && room.tour.getRemainingPlayerCount() === 2) {
					// room.say("/wall Final battle of " + room.tour.format.name + " tournament: <<" + splitMessage[3].trim() + ">>");
				}
				break;
			}
			break;
		}
		case "html": {
			if (!this.tourRulesListeners || !this.tourRulesListeners[room.id]) this.tourRulesListeners[room.id] = false;
			if (room.id !== "chinese") {
				this.tourRulesListeners[room.id] = true;
				return;
			}
			for (const message of splitMessage) {
				if (!message.includes("This tournament includes:")) return;
				if (!message.includes("Removed rules")) return;
				if (!message.includes("- teampreview")) return;

				const gen = parseInt(room.tour.format.id.substring(3, 4)) - 1;
				const genStr = [
					"【第一代】", // Gen 1
					"【第二代】", // Gen 2
					"【第三代】", // Gen 3
					"【第四代】", // Gen 4
					"【第五代】", // Gen 5
					"【第六代】", // Gen 6
					"【第七代】", // Gen 7
					"【第八代】", // Gen 8
				][gen];

				let formatName = room.tour.format.name.substring(room.tour.name.indexOf("] ") + 2);

				switch (room.tour.format.id.substring(4)) {
				case "challengecup1v1":
					formatName = "挑战杯";
					break;

				case "monotyperandombattle":
					formatName = "同属性随机对战";
					break;

				case "battlefactory":
					formatName = "战斗工厂";
					break;

				case "randombattle":
					formatName = "随机对战";
					break;
				}

				const elim = room.tour.generator === 2 ? "（两条命）" : "";

				const name = `${genStr}${formatName}${elim}（无队伍预览）`;
				room.say(`/tour name ${name}`);
				this.tourRulesListeners[room.id] = true;
			}
		}
		}
	}

	parseFormats() {
		if (!this.formatsList.length) return;
		this.formatsData = {};
		let isSection = false;
		let section = "";
		for (let i = 0, len = this.formatsList.length; i < len; i++) {
			if (isSection) {
				section = this.formatsList[i];
				isSection = false;
			} else if (this.formatsList[i] === ",LL") {
				continue;
			} else if (this.formatsList[i] === "" || (this.formatsList[i].charAt(0) === "," && !isNaN(parseInt(this.formatsList[i].substr(1))))) {
				isSection = true;
			} else {
				let name = this.formatsList[i];
				let searchShow = true;
				let challengeShow = true;
				let tournamentShow = true;
				const lastCommaIndex = name.lastIndexOf(",");
				const code = lastCommaIndex >= 0 ? parseInt(name.substr(lastCommaIndex + 1), 16) : NaN;
				if (!isNaN(code)) {
					name = name.substr(0, lastCommaIndex);
					if (!(code & 2)) searchShow = false;
					if (!(code & 4)) challengeShow = false;
					if (!(code & 8)) tournamentShow = false;
				} else {
				// Backwards compatibility: late 0.9.0 -> 0.10.0
					if (name.substr(name.length - 2) === ",#") { // preset teams
						name = name.substr(0, name.length - 2);
					}
					if (name.substr(name.length - 2) === ",,") { // search-only
						challengeShow = false;
						name = name.substr(0, name.length - 2);
					} else if (name.substr(name.length - 1) === ",") { // challenge-only
						searchShow = false;
						name = name.substr(0, name.length - 1);
					}
				}
				const id = Tools.toId(name);
				if (!id) continue;
				this.formatsData[id] = {
					name: name,
					id: id,
					section: section,
					searchShow: searchShow,
					challengeShow: challengeShow,
					tournamentShow: tournamentShow,
					playable: tournamentShow || ((searchShow || challengeShow) && tournamentShow !== false),
				};
			}
		}

		Tools.FormatCache.clear();
	}
}

exports.MessageParser = new MessageParser();
