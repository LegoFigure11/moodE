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

const EMBED_TEMPLATE = {
	author: {
		name: `${client.user.username} Help`,
		icon_url: client.user.avatarURL(),
	},
	title: "Page {{{page}}}",
};

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
						if ((permissions.config.commands[command.name].isElevated || command.elevated) && (!isAdmin(message.author.id) && !isElevated(message.author.id) && !permissions.config.botRanks.manager.includes(message.author.id) && !permissions.config.botRanks.elevated.includes(message.author.id) && !message.member.hasPermission("ADMINISTRATOR"))) return message.author.send(`${discordFailureEmoji} You lack the required permissions to use \`\`${discordConfig.commandCharacter}${command.name}\`\` in ${message.guild.name}.`);
						if ((permissions.config.commands[command.name].isManager || command.manager) && (!isAdmin(message.author.id) && !permissions.config.botRanks.manager.includes(message.author.id) && !message.member.hasPermission("ADMINISTRATOR"))) return message.author.send(`${discordFailureEmoji} You lack the required permissions to use \`\`${discordConfig.commandCharacter}${command.name}\`\` in ${message.guild.name}.`);
					}
				}

				if (command.adminOnly && !isAdmin(message.author.id)) {
					return message.channel.send(`${discordFailureEmoji} You do not have permission to do that!`);
				}
				if (command.elevated && !isAdmin(message.author.id) && !isElevated(message.author.id) && !message.member.hasPermission("ADMINISTRATOR")) {
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

	async createHelpCommand(cmd, message) {
		const hrStart = process.hrtime();
		console.log(`${Tools.discordText()}Executing command: ${"help".cyan}`);
		const target = message.guild && message.guild.members.cache.get(client.user.id).hasPermission("ADD_REACTIONS") ? message.channel : message.author;
		if (cmd[0]) {
			// Specific Help Command
			let c;
			for (const command of this.commands) {
				if ([command.name, ...command.aliases].includes(Tools.toId(cmd[0]))) {
					c = command;
					break;
				}
			}
			if (!c) {
				target.send(`${discordFailureEmoji} No command "${cmd[0]}" found!`);
			} else {
				let db;
				if (message.guild) {
					db = Storage.getDatabase(message.guild.id).config.commands[c.name];
				}

				const embed = Object.assign({}, EMBED_TEMPLATE);
				embed.title = `${discordConfig.commandCharacter}${c.name}`;
				embed.description = `**About**: ${c.longDesc || c.desc || "No info available."}`;
				embed.fields = [
					{
						name: "Usage:",
						value: `${discordConfig.commandCharacter}${c.name} ${c.usage || ""}`,
					},
					{
						name: "isElevated",
						value: db ? db.isElevated : c.elevated,
						inline: true,
					},
					{
						name: "isManager",
						value: db ? db.isManager : c.manager,
						inline: true,
					},
				];
				const hrEnd = process.hrtime(hrStart);
				const timeString = hrEnd[0] > 3 ? `${hrEnd[0]}s ${hrEnd[1]}ms`.brightRed : `${hrEnd[0]}s ${hrEnd[1]}ms`.grey;
				console.log(`${Tools.discordText()}Executed command: ${"help".green} in ${timeString}`);
				return target.send({embed});
			}
		}
		// Generic Help Command
		const embeds = await this.buildPages(message, message.author, 1);
		const embed = embeds[0];

		const hrEnd = process.hrtime(hrStart);
		const timeString = hrEnd[0] > 3 ? `${hrEnd[0]}s ${hrEnd[1]}ms`.brightRed : `${hrEnd[0]}s ${hrEnd[1]}ms`.grey;
		console.log(`${Tools.discordText()}Executed command: ${"help".green} in ${timeString}`);

		const msg = await target.send(`moodE Help (for ${message.author}): Page 1 of ${embeds.length}`, {embed});
		await msg.react("\u{23EA}"); // ⏪ Rewind Emoji
		await msg.react("\u{25C0}"); // ◀️ Back Emoji
		await msg.react("\u{25B6}"); // ▶️ Play Emoji
		await msg.react("\u{23E9}"); // ⏩ Fast Forward Emoji
		await msg.react("\u{1F522}"); // 🔢 1234 Emoji
		await msg.react("\u{1F4D8}"); // 📘 Blue Book Emoji
	}

	async changeHelpPage(message, user, page, maxPage) {
		const embeds = await this.buildPages(message, user, maxPage);
		const embed = embeds[page - 1];
		await message.edit(`moodE Help (for ${user}): Page ${page} of ${embeds.length}`, {embed});
	}

	// Returns an array of embeds
	async buildPages(message, user) {
		const pages = [];
		// Page 1 should always be the welcome page
		const pageOne = Object.assign({}, EMBED_TEMPLATE);
		pageOne.description = "Hello! Welcome to the help page.";
		pageOne.title = pageOne.title.replace("{{{page}}}", "1 - Welcome");
		pageOne.fields = [
			{
				name: "How does this work?",
				value: `I'm glad you asked! You can control the help page using the reactions below.
								\u{23EA} takes you back to the first page (this one!)
								\u{25C0} takes you to the previous page
								\u{25B6} takes you to the next page
								\u{23E9} takes you to the last page
								\u{1F522} lets you type a page number to go to
								\u{1F4D8} takes you to the contents page

								Don't worry! This command can only be controlled by reactions from the user.
								Pages contain information about how to use the bot, and its commands.
								Click \u{25B6} to get started!`.replace(/\t/g, ""),
			},
		];
		pages.push(pageOne);

		// Populate contents page and get a nice list of commands that we can use for the rest of the pages
		const commands = {
			"Bot Commands": {
				desc: "Core, non-specific bot commands.",
				perPage: 4,
			},
			"Dev Commands": {
				desc: "Commands for bot developers.",
				perPage: 4,
			},
			"Dex Commands": {
				desc: "Pokedex commands.",
				perPage: 4,
			},
			"Fc Commands": {
				desc: "Commands for accessing and using the Friend Code database.",
				perPage: 4,
			},
			"Management Commands": {
				desc: "Commands for server, bot, and user management.",
				perPage: 4,
			},
			"Nsfw Commands": {
				desc: "Commands that are Not Safe For Work.",
				perPage: 4,
			},
		};
		for (let i = 0; i < this.commands.length; i++) {
			const command = this.commands[i];
			const type = `${command.commandType.split("Command")[0]} Commands`;
			 if (!commands[type]) commands[type] = {};
			 if (!commands[type].commandList) commands[type].commandList = {};
			 commands[type].commandList[command.name] = command;
		}

		const pageTwo = Object.assign({}, EMBED_TEMPLATE);
		pageTwo.title = pageTwo.title.replace("{{{page}}}", "2 - Contents & How-To");
		pageTwo.description = "This page goes over how to use the bot, and acts as a contents page for the Help command.";
		pageTwo.fields = [
			{
				name: "How-To",
				value: `moodE commands are prefixed with \`${discordConfig.commandCharacter}\`. It will attempt to parse any message starting with this character as a command.
								In the following pages is a list of all of moodE's commands, and for specific, more detailed help with a command, you can use \`${discordConfig.commandCharacter}help <command name>\` (without the brackets!)`.replace(/\t/g, ""),
			},
			{
				name: "Contents",
				value: `React with \u{1F522} below to quickly jump to one of these pages!`,
			},
		];

		const skipTypes = ["Joke Commands", "Nsfw Commands"];
		if (message.channel.type !== "dm") {
			const db = Storage.getDatabase(message.guild.id);
			if (message.channel.nsfw || (db.config.nsfw && db.config.nsfw.allowNSFW && db.config.nsfw.nsfwChannels.includes(message.channel.id))) {
				skipTypes.splice(1, 1);
			}
		}

		let lastPage = 3;
		for (const key of Object.keys(commands)) {
			if (skipTypes.includes(key)) continue;
			let count = 0;
			const field = {
				name: `${key} - Page {{{page}}}`,
				value: "",
			};
			const cmdList = [`${commands[key].desc} List:`];
			for (const command of Object.values(commands[key].commandList)) {
				if (command.disabled) continue;
				count++;
				cmdList.push(command.name);
			}
			commands[key].count = count;
			field.name = field.name.replace("{{{page}}}", lastPage);
			lastPage += Math.ceil(count / commands[key].perPage);
			field.value = cmdList.join(", ").replace(", ,", "").replace(" , ", " ");
			pageTwo.fields.push(field);
		}
		pages.push(pageTwo);

		let pageCounter = 3;
		for (const key of Object.keys(commands)) {
			if (skipTypes.includes(key)) continue;
			const commandList = Object.values(commands[key].commandList);
			let p = Object.assign({}, EMBED_TEMPLATE);
			p.fields = [];
			let j = 1;
			let hasSetTitle = false;
			for (const command of commandList) {
				if (command.disabled) continue;
				p.title = `Page ${pageCounter} - ${key}${!hasSetTitle ? "" : " (Cont.)"}`;
				p.fields.push({
					name: `${discordConfig.commandCharacter}${command.name}`,
					value: `Usage: ${discordConfig.commandCharacter}${command.name} ${command.usage || ""}\n${command.desc}`,
				});
				if (j % 4 === 0 || j === commandList.length) {
					pageCounter++;
					pages.push(p);
					hasSetTitle = true;
					p = Object.assign({}, EMBED_TEMPLATE);
					p.fields = [];
				}
				j++;
			}
		}
		return pages;
	}
}

function isAdmin(id) {
	return (discordConfig.admin.includes(parseInt(id)) || id === discordConfig.owner);
}

function isElevated(id) {
	return (discordConfig.elevated.includes(parseInt(id)) || isAdmin(id));
}

module.exports = CommandHandler;
