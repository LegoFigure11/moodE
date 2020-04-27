"use strict";

const fs = require("fs");
const path = require("path");

const Commands = require(path.resolve(__dirname, "./commands.js"));
const Dex = require("../../pokemon-showdown/.sim-dist/dex.js").Dex;
const utilities = require(path.resolve(__dirname, "./utilities.js"));

const COMMANDS_DIRECTORY = path.resolve(__dirname, "../commands/");
const CHINESE_COMMANDS_DIRECTORY = path.resolve(__dirname, "../commands/chinese/");
const DEV_COMMANDS_DIRECTORY = path.resolve(__dirname, "../commands/dev/");

// const databaseDirectory = path.resolve(__dirname, "../../databases");

class CommandHandler {
	constructor() {
		this.commands = [];
		this.chineseCommands = [];
	}

	async init(isReload) {
		console.log(`${showdownText}${isReload ? "Rel" : "L"}oading commands...`);
		await Promise.all([
			this.loadDirectory(COMMANDS_DIRECTORY, Commands.ShowdownCommand, "Bot", isReload),
			this.loadDirectory(CHINESE_COMMANDS_DIRECTORY, Commands.ChineseCommand, "Chinese", isReload),
			this.loadDirectory(DEV_COMMANDS_DIRECTORY, Commands.DevCommand, "Dev", isReload),
		]);
		for (let i = 0; i < this.chineseCommands.length; i++) {
			for (let j = 0; j < this.chineseCommands.length; j++) {
				if (i === j || this.chineseCommands[j].commandType === "ChineseCommand" || this.chineseCommands[i].name !== this.chineseCommands[j].name) continue;
				this.chineseCommands.splice(j, 1);
			}
		}
	}

	loadDirectory(directory, Command, type, isReload) {
		console.log(`${showdownText}${isReload ? "Rel" : "L"}oading ${type.cyan} commands...`);
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
								const command = new Command(name, require(directory + "/" + name + ".js"));

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
								if (!(isReload)) console.log(`${showdownText}${isReload ? "Rel" : "L"}oaded command ${type === "NSFW" ? (name.charAt(0) + "*****").green : name.green}`);
							} catch (e) {
								console.log(`${showdownText}${"CommandHandler loadDirectory() error: ".brightRed}${e} while parsing ${name.yellow}${".js".yellow} in ${directory}`);
							}
						}
					}
					console.log(`${showdownText}${type.cyan} commands ${isReload ? "rel" : "l"}oaded!`);
					resolve();
				}
			});
		});
	}

	get(name) {
		for (const command of this.commands) {
			if ([command.name, ...command.aliases].includes(Tools.toId(name))) return command;
		}
		throw new Error(`commandHandler error: Command "${name}" not found!`);
	}

	async executeCommand(message, room, user, time) {
		const passDex = Dex;
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
				const hrStart = process.hrtime();
				console.log(`${showdownText}Executing command: ${command.name.cyan}`);
				let commandOutput;
				try {
					commandOutput = await command.execute(args, room, user);
				} catch (e) {
					let stack = e.stack;
					stack += "Additional information:\n";
					stack += "Command = " + command.name + "\n";
					stack += "Args = " + args + "\n";
					stack += "Time = " + new Date(time).toLocaleString() + "\n";
					stack += "User = " + user.name + "\n";
					stack += "Room = " + (room instanceof psUsers.User ? "in PM" : room.id);
					console.log(stack);
					commandOutput = false;
				}
				if (commandOutput || command.hasCustomFormatting) {
					const hrEnd = process.hrtime(hrStart);
					const timeString = hrEnd[0] > 3 ? `${hrEnd[0]}s ${hrEnd[1]}ms`.brightRed : `${hrEnd[0]}s ${hrEnd[1]}ms`.grey;
					console.log(`${showdownText}Executed command: ${command.name.green} in ${timeString}`);
				} else {
					console.log(`${showdownText}Error parsing command: ${command.name.brightRed} - command function does not return anything!`);
				}
			}
		}
	}

	helpCommand(cmd, message) {
		const hrStart = process.hrtime();
		console.log(`${showdownText}Executing command: ${"help".cyan}`);
		const botCommands = [];
		const devCommands = [];
		const dexCommands = [];
		const fcCommands = [];
		const managementCommands = [];
		let sendMsg = [];
		if (!(cmd[0])) {
			message.author.send(`List of commands; use \`${discordConfig.commandCharacter}help <command name>\` for more information:`);
			for (let i = 0; i < this.commands.length; i++) {
				const command = this.commands[i];
				if (!command.disabled && !command.isNSFW && command.commandType !== "JokeCommand") {
					const cmdText = `${discordConfig.commandCharacter}${command.name}${command.desc ? " - " + command.desc : ""}`;
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
					case "FcCommand":
						fcCommands.push(cmdText);
						break;
					case "ManagementCommand":
						managementCommands.push(cmdText);
						break;
					}
				}
			}
			const hrEnd = process.hrtime(hrStart);
			const timeString = hrEnd[0] > 3 ? `${hrEnd[0]}s ${hrEnd[1]}ms`.brightRed : `${hrEnd[0]}s ${hrEnd[1]}ms`.grey;
			console.log(`${showdownText}Executed command: ${"help".green} in ${timeString}`);
			if (botCommands.length > 0) message.author.send(`Bot Commands:\n\`\`\`${botCommands.join("\n")}\`\`\``);
			if (devCommands.length > 0) message.author.send(`Dev Commands:\n\`\`\`${devCommands.join("\n")}\`\`\``);
			if (dexCommands.length > 0) message.author.send(`Dex Commands:\n\`\`\`${dexCommands.join("\n")}\`\`\``);
			if (fcCommands.length > 0) message.author.send(`FC Commands:\n\`\`\`${fcCommands.join("\n")}\`\`\``);
			if (managementCommands.length > 0) message.author.send(`Management Commands:\n\`\`\`${managementCommands.join("\n")}\`\`\``);
			return true;
		}
		const lookup = Tools.toId(cmd[0]);
		let command;
		let matched = false;
		for (let i = 0; i < this.commands.length; i++) {
			if (matched) break;
			command = this.commands[i];
			if (command.name === lookup || (command.aliases && command.aliases.includes(lookup))) matched = true;
		}

		if (!matched) return message.author.send(`${failureEmoji} No command "${lookup}" found!`);

		if (command.adminOnly && !isAdmin(message.author.id)) {
			return "```" + `${command.name} is an admin-only command.` + "```";
		}
		if (command.elevated && !isElevated(message.author.id)) {
			return "```" + `${command.name} is an elevated-only command.` + "```";
		}

		sendMsg = [
			command.name,
			`${discordConfig.commandCharacter}${command.name}${command.usage.length > 0 ? " " + command.usage : ""}`,
			command.longDesc,
			"",
			`${command.aliases.length > 0 ? "Aliases: " + command.aliases.join(", ") : ""}`,
		];
		for (let i = 0; i < command.options.length; i++) {
			sendMsg.push(`  ${command.options[i].toString()}: ${command.options[i].desc}`);
		}
		sendMsg = sendMsg.join("\n");
		sendMsg = "```" + sendMsg + "```";
		const hrEnd = process.hrtime(hrStart);
		const timeString = hrEnd[0] > 3 ? `${hrEnd[0]}s ${hrEnd[1]}ms`.brightRed : `${hrEnd[0]}s ${hrEnd[1]}ms`.grey;
		console.log(`${showdownText}Executed command: ${"help".green} in ${timeString}`);
		return message.channel.send(sendMsg);
	}
}

function isAdmin(id) {
	return (discordConfig.admin.includes(parseInt(id)) || id === discordConfig.owner);
}

function isElevated(id) {
	return (discordConfig.elevated.includes(parseInt(id)) || isAdmin(id));
}

module.exports = CommandHandler;
