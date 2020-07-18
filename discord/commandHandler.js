"use strict";

const fs = require("fs");
const path = require("path");
const utilities = require("./utilities.js");

const Commands = require(path.resolve(__dirname, "./commands.js"));
const Dex = require("../pokemon-showdown/.sim-dist/dex.js").Dex;

const COMMANDS_DIRECTORY = path.resolve(__dirname, "./commands/");
const DEV_COMMANDS_DIRECTORY = path.resolve(__dirname, "./commands/dev/");
const DEX_COMMANDS_DIRECTORY = path.resolve(__dirname, "./commands/dex/");
const FC_COMMANDS_DIRECTORY = path.resolve(__dirname, "./commands/fc/");
const JOKE_COMMANDS_DIRECTORY = path.resolve(__dirname, "./commands/joke/");
const MANAGEMENT_COMMANDS_DIRECTORY = path.resolve(__dirname, "./commands/management/");
const NSFW_COMMANDS_DIRECTORY = path.resolve(__dirname, "./commands/nsfw/");
const RNG_COMMANDS_DIRECTORY = path.resolve(__dirname, "./commands/rng/");

const databaseDirectory = path.resolve(__dirname, "../databases");

class CommandHandler {
	constructor() {
		this.commands = [];
	}

	async init(isReload) {
		console.log(`${Tools.discordText()}${isReload ? "Rel" : "L"}oading commands...`);
		await Promise.all([
			this.loadDirectory(COMMANDS_DIRECTORY, Commands.DiscordCommand, "Bot", isReload),
			this.loadDirectory(DEV_COMMANDS_DIRECTORY, Commands.DevCommand, "Dev", isReload),
			this.loadDirectory(DEX_COMMANDS_DIRECTORY, Commands.DexCommand, "Dex", isReload),
			this.loadDirectory(FC_COMMANDS_DIRECTORY, Commands.FcCommand, "FC", isReload),
			this.loadDirectory(JOKE_COMMANDS_DIRECTORY, Commands.JokeCommand, "Joke", isReload),
			this.loadDirectory(MANAGEMENT_COMMANDS_DIRECTORY, Commands.ManagementCommand, "Management", isReload),
			this.loadDirectory(NSFW_COMMANDS_DIRECTORY, Commands.NsfwCommand, "NSFW", isReload),
			this.loadDirectory(RNG_COMMANDS_DIRECTORY, Commands.DiscordCommand, "RNG", isReload),
		]);
	}

	loadDirectory(directory, Command, type, isReload) {
		console.log(`${Tools.discordText()}${isReload ? "Rel" : "L"}oading ${type.cyan} commands...`);
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
								this.commands.push(command);
								fs.readdir(databaseDirectory, (err, dbs) => {
									for (let id of dbs) {
										if (id.endsWith(".json")) {
											id = id.slice(0, -5); // remove extention
											if (client.guilds.cache.get(id) !== undefined) {
												utilities.populateDb(id, name, type);
											}
										}
									}
								});
								if (!(isReload)) console.log(`${Tools.discordText()}${isReload ? "Rel" : "L"}oaded command ${type === "NSFW" ? (`${name.charAt(0)}*****`).green : name.green}`);
							} catch (e) {
								console.log(`${"Discord: ".yellow + "CommandHandler loadDirectory() error: ".brightRed}${e} while parsing ${name.yellow}${".js".yellow} in ${directory}`);
							}
						}
					}
					console.log(`${Tools.discordText()}${type.cyan} commands ${isReload ? "rel" : "l"}oaded!`);
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

	async executeCommand(cmd, message, args) {
		let passDex = Dex;
		const authorId = message.author.id;

		for (let i = 0; i < this.commands.length; i++) {
			const command = this.commands[i];
			if (command.trigger(cmd)) {
				const permissions = message.channel.type !== "dm" ? utilities.checkPermissions(message, command.name) : undefined;
				if (permissions) {
					if (command.isNSFW && (permissions.config.nsfw.allowNSFW === false || !(permissions.config.nsfw.nsfwChannels.includes(message.channel.id)))) return message.author.send(`${discordFailureEmoji} NSFW commands are not available in this ${permissions.config.nsfw.allowNSFW ? "channel" : "server"}.`);

					// Admins should skip permission checks
					if (!isAdmin(message.author.id)) {
						if (!command.override && (permissions.config.requiredRoles.length > 0 && !(message.member.roles.cache.some(r => permissions.config.requiredRoles.includes(r.id)))) || (permissions.config.commands[command.name].requiredRoles.length > 0 && !(message.member.roles.cache.some(r => permissions.config.commands[command.name].requiredRoles.includes(r.id))))) return message.author.send(`${discordFailureEmoji} You don't have the required roles to use that command.`);
						if (!command.override && permissions.config.bannedChannels.includes(message.channel.id)) return message.author.send(`${discordFailureEmoji} Commands are not permitted in that channel!`);
						if (!command.override && permissions.config.bannedUsers.includes(message.author.id)) return message.author.send(`${discordFailureEmoji} You are not permitted to use bot commands in ${message.guild.name}.`);
						if (!command.override && permissions.config.commands[command.name].bannedChannels.includes(message.channel.id)) return message.author.send(`${discordFailureEmoji} Commands are not permitted in that channel!`);
						if (!command.override && permissions.config.commands[command.name].bannedUsers.includes(message.author.id)) return message.author.send(`${discordFailureEmoji} You are not permitted to the \`\`${discordConfig.commandCharacter}${command.name}\`\` command in ${message.guild.name}.`);
						if ((permissions.config.commands[command.name].isElevated || command.elevated) && (!isAdmin(message.author.id) && !isElevated(message.author.id) && !permissions.config.botRanks.manager.includes(message.author.id) && !permissions.config.botRanks.elevated.includes(message.author.id))) return message.author.send(`${discordFailureEmoji} You lack the required permissions to use \`\`${discordConfig.commandCharacter}${command.name}\`\` in ${message.guild.name}.`);
						if ((permissions.config.commands[command.name].isManager || command.manager) && (!isAdmin(message.author.id) && !permissions.config.botRanks.manager.includes(message.author.id))) return message.author.send(`${discordFailureEmoji} You lack the required permissions to use \`\`${discordConfig.commandCharacter}${command.name}\`\` in ${message.guild.name}.`);
					}
				}

				if (command.adminOnly && !isAdmin(message.author.id)) {
					return message.channel.send(`${discordFailureEmoji} You do not have permission to do that!`);
				}
				if (command.elevated && !isAdmin(message.author.id) && !isElevated(message.author.id)) {
					return message.channel.send(`${discordFailureEmoji} You do not have permission to do that!`);
				}
				if (command.noPm && message.channel.type === "dm") {
					return message.channel.send(`${discordFailureEmoji} This command is not available in PMs!`);
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
				console.log(`${Tools.discordText()}Executing command: ${command.name.cyan}`);
				let commandOutput;
				try {
					if (command.commandType === "DexCommand") {
						commandOutput = await command.execute(message, args, passDex);
					} else {
						commandOutput = await command.execute(message, args);
					}
				} catch (e) {
					if (discordConfig.logChannel) {
						message.channel.send(`${discordFailureEmoji} The command crashed! The crash has been logged and a fix will (hopefully) be on its way soon.`);
						const embed = {
							timestamp: new Date(),
							fields: [
								{name: "Crash", value: e},
								{name: "Command", value: `${command.name}`},
								{name: "Input", value: cmd},
								{name: "args", value: JSON.stringify(args)},
								{name: "Server", value: message.channel.type === "dm" ? "Private Message" : `${message.guild.name} (${message.guild.id})`},
								{name: "User", value: `${authorId} (${message.author.username}#${message.author.discriminator})`},
							],
							footer: {
								icon_url: client.user.avatarURL(),
								text: "moodE",
							},
						};
						client.channels.cache.get(discordConfig.logChannel).send("A command crashed! Stack trace:", {embed});
						client.channels.cache.get(discordConfig.logChannel).send(`\`\`\`${e.stack}\`\`\``);
					} else {
						message.channel.send(`${discordFailureEmoji} The command crashed! Please notify the bot owner (and include the output below), or try again later.\n\`\`\`${e}\`\`\``);
					}
					console.log(`${Tools.discordText()}\n${"ERROR".brightRed}: ${e} at ${e.stack}\nfrom command ${command.name}\nwith input ${cmd}\nwith args ${JSON.stringify(args)}\nin ${message.channel.type === "dm" ? "a private message with" : `server ${message.guild.name} (${message.guild.id}) by`} user ${authorId} (${message.author.username}#${message.author.discriminator})`);
					commandOutput = false;
				}
				if (commandOutput || command.hasCustomFormatting) {
					const hrEnd = process.hrtime(hrStart);
					const timeString = hrEnd[0] > 3 ? `${hrEnd[0]}s ${hrEnd[1]}ms`.brightRed : `${hrEnd[0]}s ${hrEnd[1]}ms`.grey;
					console.log(`${Tools.discordText()}Executed command: ${command.name.green} in ${timeString}`);
				} else {
					console.log(`${Tools.discordText()}Error parsing command: ${command.name.brightRed} - command function does not return anything!`);
				}
			}
		}
	}

	helpCommand(cmd, message) {
		const hrStart = process.hrtime();
		console.log(`${Tools.discordText()}Executing command: ${"help".cyan}`);
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
					const cmdText = `${discordConfig.commandCharacter}${command.name}${command.desc ? ` - ${command.desc}` : ""}`;
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
			console.log(`${Tools.discordText()}Executed command: ${"help".green} in ${timeString}`);
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

		if (!matched) return message.author.send(`${discordFailureEmoji} No command "${lookup}" found!`);

		if (command.adminOnly && !isAdmin(message.author.id)) {
			return `\`\`\`${command.name} is an admin-only command.\`\`\``;
		}
		if (command.elevated && !isElevated(message.author.id)) {
			return `\`\`\`${command.name} is an elevated-only command.\`\`\``;
		}

		sendMsg = [
			command.name,
			`${discordConfig.commandCharacter}${command.name}${command.usage.length > 0 ? ` ${command.usage}` : ""}`,
			command.longDesc,
			"",
			`${command.aliases.length > 0 ? `Aliases: ${command.aliases.join(", ")}` : ""}`,
		];
		for (let i = 0; i < command.options.length; i++) {
			sendMsg.push(`  ${command.options[i].toString()}: ${command.options[i].desc}`);
		}
		sendMsg = sendMsg.join("\n");
		sendMsg = `\`\`\`${sendMsg}\`\`\``;
		const hrEnd = process.hrtime(hrStart);
		const timeString = hrEnd[0] > 3 ? `${hrEnd[0]}s ${hrEnd[1]}ms`.brightRed : `${hrEnd[0]}s ${hrEnd[1]}ms`.grey;
		console.log(`${Tools.discordText()}Executed command: ${"help".green} in ${timeString}`);
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
