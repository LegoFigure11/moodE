/*******************************************************************/
/*                                                                 */
/* Discord-specific functions that are useful in multiple commands */
/*                                                                 */
/*******************************************************************/

"use strict";

const path = require("path");

class Utilities {
	checkPermissions(message, cmd) {
		if (message.channel.type === "dm") return undefined;
		this.checkForDb(message.guild.id, `{"name":"${message.guild.name}", "config":{}}`);
		const db = Storage.getDatabase(message.guild.id);
		db.name = message.guild.name; // Update identifier in case the server has changed name since the last command
		if (!(db.config.nsfw)) db.config.nsfw = {"allowNSFW": false, "nsfwChannels": []};
		if (!(db.config.requiredRoles)) db.config.requiredRoles = [];
		if (!(db.config.bannedChannels)) db.config.bannedChannels = [];
		if (!(db.config.bannedUsers)) db.config.bannedUsers = [];
		if (!(db.config.botRanks)) db.config.botRanks = {"manager": [], "elevated": []};
		if (!(db.config.commands)) db.config.commands = {};
		if (!(db.config.commands[cmd])) db.config.commands[cmd] = {"uses": {"total": 0, "users": {}}, "requiredRoles": [], "bannedUsers": [], "bannedChannels": [], "isElevated": false, "isManager": false};
		if (!(db.config.commands[cmd].uses.users[message.author.id])) db.config.commands[cmd].uses.users[message.author.id] = {};

		db.config.commands[cmd].uses.users[message.author.id].name = message.author.username + "#" + message.author.discriminator; // Update identifier in case Username has changed since last time
		if (!(db.config.commands[cmd].uses.users[message.author.id].times)) db.config.commands[cmd].uses.users[message.author.id].times = 0;
		db.config.commands[cmd].uses.total += 1;
		db.config.commands[cmd].uses.users[message.author.id].times += 1;

		Storage.exportDatabase(message.guild.id);
		return db;
	}

	buildDb(id, name) {
		console.log(`${discordText}Building database for ${name.green}...`);
		const db = Storage.getDatabase(id);
		db.name = name; // Update identifier in case the server has changed name since the last command
		if (!(db.config.nsfw)) db.config.nsfw = {"allowNSFW": false, "nsfwChannels": []};
		if (!(db.config.requiredRoles)) db.config.requiredRoles = [];
		if (!(db.config.bannedChannels)) db.config.bannedChannels = [];
		if (!(db.config.bannedUsers)) db.config.bannedUsers = [];
		if (!(db.config.botRanks)) db.config.botRanks = {"manager": [], "elevated": []};
		Storage.exportDatabase(id);
	}

	populateDb(id, cmd, type) {
		const db = Storage.getDatabase(id);
		if (!(db.config.commands)) db.config.commands = {};
		if (!(db.config.commands[cmd])) {
			console.log(`${discordText}Adding ${type !== "NSFW" ? cmd.green : cmd.charAt(0).green + "*****".green} to ${(client.guilds.cache.get(id).name).cyan} database...`);
			db.config.commands[cmd] = {"uses": {"total": 0, "users": {}}, "requiredRoles": [], "bannedUsers": [], "bannedChannels": [], "isElevated": false, "isManager": false};
		}
		Storage.exportDatabase(id);
	}

	generateRandomLinkCode(len) {
		const length = len > 0 ? len : 4;
		if (!(fs.existsSync(path.resolve(__dirname, "../databases/linkCodes.json")))) {
			fs.writeFileSync(path.resolve(__dirname, "../databases/linkCodes.json"), `{"linkCodes":[]}`);
			Storage.importDatabase("linkCodes");
		}
		const lastCodes = Storage.getDatabase("linkCodes");
		let arr = [];
		do {
			arr = [];
			for (let i = 0; i < length; i++) {
				arr[i] = Tools.random(10); // 0-9
			}
		} while (lastCodes["linkCodes"].includes(arr.join("")));
		const thisCode = arr.join("");
		if (lastCodes["linkCodes"].length === 10) {
			lastCodes["linkCodes"].shift();
		}
		lastCodes["linkCodes"].push(thisCode);
		Storage.exportDatabase("linkCodes");
		return thisCode;
	}

	parseUserId(input) {
		if (input.includes("<")) {
			input = input.match(/^<@!?(\d+)>$/)[1];
		}
		return client.users.cache.get(input);
	}

	parseRoleId(message, input) {
		if (input.includes("<")) {
			return message.guild.roles.get(input.match(/^<@&?(\d+)>$/)[1]);
		} else {
			let name = message.guild.roles.cache.find(r => Tools.toId(r.name) === Tools.toId(input));
			if (!name) name = message.guild.roles.cache.get(input);
			return name;
		}
	}

	parseChannelId(message, input) {
		if (input.includes("<")) {
			return message.guild.channels.cache.get(input.match(/^<#?(\d+)>$/)[1]);
		} else {
			let name = message.guild.channels.cache.find(c => Tools.toId(c.name) === Tools.toId(input));
			if (!name) name = message.guild.channels.cache.get(input);
			return name;
		}
	}

	oneIn(number) {
		const rand = Tools.random(number);
		if (rand === 0) return true;
		return false;
	}

	toSmogonString(dex) {
		let genStr = "ss";
		switch (dex) {
		case 8:
			genStr = "ss";
			break;
		case 7:
			genStr = "sm";
			break;
		case 6:
			genStr = "xy";
			break;
		case 5:
			genStr = "bw";
			break;
		case 4:
			genStr = "dp";
			break;
		case 3:
			genStr = "rs";
			break;
		case 2:
			genStr = "gs";
			break;
		case 1:
			genStr = "rb";
			break;
		}
		return genStr;
	}

	dexColorToDec(str) {
		let int = 0;
		const names = ["red", "blue", "yellow", "green", "black", "brown", "purple", "gray", "white", "pink"];
		const numbers = [15751272, 3180784, 15781960, 4241512, 361861, 11563056, 11036864, 10526880, 15790320, 16289992];
		int = numbers[names.indexOf(str)];
		return int;
	}

	checkForDb(name, json, dummyId) {
		if (json) {
			try {
				JSON.parse(json);
			} catch (e) {
				throw new SyntaxError(`"${json}" is not valid JSON`);
			}
		}
		if (!(fs.existsSync(path.resolve(__dirname, `../../databases/${name}.json`)))) {
			fs.writeFileSync(path.resolve(__dirname, `../../databases/${name}.json`), json);
			if (dummyId) fs.writeFileSync(path.resolve(__dirname, `../../databases/${name} - ${dummyId}`), "This is a guide file to assist with navigation of the `databases` directory.\nIt can be deleted without consequence if need be.");
		}
		Storage.importDatabase(name);
	}

	getFcCategory(str) {
		let category;
		switch (Tools.toId(str)) {
		case "n3ds":
		case "nintendo3ds":
		case "2ds":
		case "o2ds":
		case "o3ds":
		case "3ds":
			category = "Nintendo 3DS";
			break;

		case "nintendoswitch":
		case "nswitch":
		case "switchlite":
		case "switch":
		case "ns":
			category = "Nintendo Switch";
			break;

		case "home":
		case "pokemonhome":
		case "pokémonhome":
			category = "Pokémon Home";
			break;

		case "go":
		case "pokemongo":
		case "pokémongo":
		case "pogo":
			category = "Pokémon Go";
			break;

		case "mkt":
		case "mariokarttour":
			category = "Mario Kart Tour";
			break;

		default:
			category = Tools.toTitleCase(str);
		}
		return category;
	}

	formatFc(code, cat) {
		code = code.toUpperCase();
		if (code.length < 6) return code;
		if (code.startsWith("SW") && cat === "Nintendo Switch") {
			code = code.slice(2);
		}
		const splitNumber = Math.floor(code.length / 3);
		code = code.split("").reduce((a, e, i) => a + e + (i % splitNumber === splitNumber - 1 ? "-" : ""), "");
		if (code.charAt(code.length - 1) === "-") code = code.substr(0, code.length - 1);
		return code;
	}

	exportDbAndSend(message, text, db) {
		Storage.exportDatabase(db);
		return message.channel.send(text);
	}
}

module.exports = new Utilities();
