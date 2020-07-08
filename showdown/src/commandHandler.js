"use strict";

const fs = require("fs");
const path = require("path");

const Commands = require(path.resolve(__dirname, "./commands.js"));
const Dex = require("../../pokemon-showdown/.sim-dist/dex.js").Dex;
// const utilities = require(path.resolve(__dirname, "./utilities.js"));

const COMMANDS_DIRECTORY = path.resolve(__dirname, "../commands/");
const CHINESE_COMMANDS_DIRECTORY = path.resolve(__dirname, "../commands/chinese/");
const DEV_COMMANDS_DIRECTORY = path.resolve(__dirname, "../commands/dev/");
const DEX_COMMANDS_DIRECTORY = path.resolve(__dirname, "../commands/dex/");
const PRIVATE_COMMANDS_DIRECTORY = path.resolve(__dirname, "../commands/private/");

// const databaseDirectory = path.resolve(__dirname, "../../databases");

class CommandHandler {
	constructor() {
		this.commands = [];
		this.chineseCommands = [];
	}

	async init(isReload) {
		console.log(`${Tools.showdownText()}${isReload ? "Rel" : "L"}oading commands...`);
		await Promise.all([
			this.loadDirectory(COMMANDS_DIRECTORY, Commands.ShowdownCommand, "Bot", isReload),
			this.loadDirectory(CHINESE_COMMANDS_DIRECTORY, Commands.ChineseCommand, "Chinese", isReload),
			this.loadDirectory(DEV_COMMANDS_DIRECTORY, Commands.DevCommand, "Dev", isReload),
			this.loadDirectory(DEX_COMMANDS_DIRECTORY, Commands.DexCommand, "Dex", isReload),
			this.loadDirectory(PRIVATE_COMMANDS_DIRECTORY, Commands.PrivateCommand, "Private", isReload),
		]);
		for (let i = 0; i < this.chineseCommands.length; i++) {
			for (let j = 0; j < this.chineseCommands.length; j++) {
				if (i === j || this.chineseCommands[j].commandType === "ChineseCommand" || this.chineseCommands[i].name !== this.chineseCommands[j].name) continue;
				this.chineseCommands.splice(j, 1);
			}
		}
	}

	loadDirectory(directory, Command, type, isReload) {
		console.log(`${Tools.showdownText()}${isReload ? "Rel" : "L"}oading ${type.cyan} commands...`);
		return new Promise((resolve, reject) => {
			fs.readdir(directory, (err, files) => {
				if (err) {
					reject(`Error reading commands directory: ${err}`);
				} else if (!files) {
					reject(`No files in directory ${directory}`);
				} else {
					for (let name of files) {
						if (name.endsWith(".js")) {
							try {
								name = name.slice(0, -3); // remove extention
								const command = new Command(name, require(`${directory}/${name}.js`));

								if (command.commandType !== "ChineseCommand") this.commands.push(command);
								this.chineseCommands.push(command);
								/*fs.readdir(databaseDirectory, (err, dbs) => {
									for (let id of dbs) {
										if (id.endsWith(".json")) {
											id = id.slice(0, -5); // remove extention
											if (client.guilds.cache.get(id) !== undefined) {
												utilities.populateDb(id, name, type);
											}
										}
									}
								});*/
								if (!(isReload)) console.log(`${Tools.showdownText()}${isReload ? "Rel" : "L"}oaded command ${type === "Private" ? (`${name.charAt(0)}*****`).green : name.green}`);
							} catch (e) {
								console.log(`${Tools.showdownText()}${"CommandHandler loadDirectory() error: ".brightRed}${e} while parsing ${name.yellow}${".js".yellow} in ${directory}`);
								console.log(e.stack);
							}
						}
					}
					console.log(`${Tools.showdownText()}${type.cyan} commands ${isReload ? "rel" : "l"}oaded!`);
					resolve();
				}
			});
		});
	}

	get(name, list) {
		const commandsList = list ? list : this.commands;
		for (const command of commandsList) {
			if ([command.name, ...command.aliases].includes(Tools.toId(name))) return command;
		}
		throw new Error(`commandHandler error: Command "${name}" not found!`);
	}

	async executeCommand(message, room, user, time) {
		let passDex = Dex;
		message = message.substr(1); // Remove command character

		const spaceIndex = message.indexOf(" ");
		let args = [];
		let cmd = "";
		if (spaceIndex !== -1) {
			cmd = message.substr(0, spaceIndex);
			args = message.substr(spaceIndex + 1).split(",");
		} else {
			cmd = message;
		}

		const commandsList = room.id === "chinese" ? this.chineseCommands : this.commands;
		for (let i = 0; i < commandsList.length; i++) {
			const command = commandsList[i];
			if (command.trigger(cmd)) {
				// Permissions checking
				if (!user.isDeveloper()) {
					if (command.developerOnly) return user.say("You do not have permission to use this command!");
				  if (command.roomRank && !(user.hasRoomRank(room, command.roomRank) || user.hasGlobalRank(command.roomRank))) return user.say(`You do not have permission to use \`\`${psConfig.commandCharacter}${command.name}\`\` in <<${room.id}>>.`);
					if (command.globalRank && !user.hasGlobalRank(command.globalRank)) return user.say(`You do not have permission to use \`\`${psConfig.commandCharacter}${command.name}\`\` in <<${room.id}>>.`);
					if (command.rooms && !command.rooms.includes(room.id)) return;
					if (command.noPm && room.isPm()) return user.say(`\`\`${psConfig.commandCharacter}${command.name}\`\` is not available in PMs!`);
					if (command.pmOnly && !room.isPm()) return user.say(`\`\`${psConfig.commandCharacter}${command.name}\`\` is only available in PMs!`);
				}

				if (command.commandType === "DexCommand") {
					for (let i = 0; i < args.length; i++) {
						if (["lgpe", "gen7", "gen6", "gen5", "gen4", "gen3", "gen2", "gen1", "usum", "sm", "oras", "xy", "bw2", "bw", "hgss", "dppt", "adv", "rse", "frlg", "gsc", "rby"].includes(Tools.toId(args[i]))) {
							switch (Tools.toId(args[i])) {
							case "lgpe":
								passDex = Dex.mod("lgpe");
								break;
							case "gen7":
							case "usum":
							case "sm":
								passDex = Dex.mod("gen7");
								break;
							case "gen6":
							case "oras":
							case "xy":
								passDex = Dex.mod("gen6");
								break;
							case "gen5":
							case "bw2":
							case "bw":
								passDex = Dex.mod("gen5");
								break;
							case "gen4":
							case "hgss":
							case "dppt":
								passDex = Dex.mod("gen4");
								break;
							case "gen3":
							case "adv":
							case "rse":
							case "frlg":
								passDex = Dex.mod("gen3");
								break;
							case "gen2":
							case "gsc":
								passDex = Dex.mod("gen2");
								break;
							case "gen1":
							case "rby":
							case "rbyg":
								passDex = Dex.mod("gen1");
								break;
							default:
								passDex = Dex.mod("gen7");
							}
							args.splice(i, 1);
							break;
						}
					}
				}

				const hrStart = process.hrtime();
				console.log(`${Tools.showdownText()}Executing command: ${command.name.cyan}`);
				try {
					if (command.commandType === "DexCommand") {
						await command.execute(args, room, user, passDex);
					} else {
						await command.execute(args, room, user);
					}
				} catch (e) {
					let stack = e.stack;
					stack += "Additional information:\n";
					stack += `Command = ${command.name}\n`;
					stack += `Args = ${args}\n`;
					stack += `Time = ${new Date(time).toLocaleString()}\n`;
					stack += `User = ${user.name}\n`;
					stack += `Room = ${room instanceof psUsers.User ? "in PM" : room.id}`;
					console.log(stack);
				}
				const hrEnd = process.hrtime(hrStart);
				const timeString = hrEnd[0] > 3 ? `${hrEnd[0]}s ${hrEnd[1]}ms`.brightRed : `${hrEnd[0]}s ${hrEnd[1]}ms`.grey;
				console.log(`${Tools.showdownText()}Executed command: ${command.name.green} in ${timeString}`);
			}
		}
	}

	helpCommand(message, room, user, time) {
		const hrStart = process.hrtime();
		const commandsList = room.id === "chinese" ? this.chineseCommands : this.commands;
		console.log(`${Tools.showdownText()}Executing command: ${"help".cyan}`);
		const botCommands = [];
		const devCommands = [];
		const dexCommands = [];
		let sendMsg = [];

		if (!(message.trim().includes(" "))) {
			user.say(`List of commands; use \`\`${psConfig.commandCharacter}help <command name>\`\` for more information:`);
			for (let i = 0; i < commandsList.length; i++) {
				const command = commandsList[i];
				if (!command.disabled && command.commandType !== "PrivateCommand") {
					const cmdText = `${psConfig.commandCharacter}${command.name}${command.desc ? ` - ${command.desc}` : ""}`;
					switch (command.commandType) {
					case "BotCommand":
						botCommands.push(cmdText);
						break;
					case "DevCommand":
						devCommands.push(cmdText);
						break;
					case "DexCommand":
						dexCommands.push(cmdText);
						break;
					}
				}
			}
			const hrEnd = process.hrtime(hrStart);
			const timeString = hrEnd[0] > 3 ? `${hrEnd[0]}s ${hrEnd[1]}ms`.brightRed : `${hrEnd[0]}s ${hrEnd[1]}ms`.grey;
			console.log(`${Tools.showdownText()}Executed command: ${"help".green} in ${timeString}`);
			if (botCommands.length > 0) {
				user.say("**Bot commands**");
				for (const line of botCommands) user.say(line);
			}
			if (devCommands.length > 0) {
				user.say("**Dev Commands**");
				for (const line of devCommands) user.say(line);
			}
			if (dexCommands.length > 0) {
				user.say("**Dex Commands**");
				for (const line of dexCommands) user.say(line);
			}
			return true;
		}
		const lookup = Tools.toId(message.split(" ")[1]);
		let command;
		let matched = false;
		console.log(commandsList);
		for (let i = 0; i < commandsList.length; i++) {
			if (matched) break;
			command = commandsList[i];
			if (command.name === lookup || (command.aliases && command.aliases.includes(lookup))) matched = true;
		}

		if (!matched) return user.say(`No command "${lookup}" found!`);

		sendMsg = [
			`Help for: ${command.name}`,
			`Usage: \`\`${psConfig.commandCharacter}${command.name}${command.usage.length > 0 ? ` ${command.usage}` : ""}\`\``,
			`Description: ${command.longDesc}`,
			`${command.aliases.length > 0 ? `Aliases: ${command.aliases.join(", ")}` : ""}`,
		];
		if (command.options) {
			for (let i = 0; i < command.options.length; i++) {
				sendMsg.push(`${command.options[i].toString()}: ${command.options[i].desc}`);
			}
		}
		const hrEnd = process.hrtime(hrStart);
		const timeString = hrEnd[0] > 3 ? `${hrEnd[0]}s ${hrEnd[1]}ms`.brightRed : `${hrEnd[0]}s ${hrEnd[1]}ms`.grey;
		console.log(`${Tools.showdownText()}Executed command: ${"help".green} in ${timeString}`);
		for (const line of sendMsg) user.say(line);
		return;
	}
}

module.exports = CommandHandler;
