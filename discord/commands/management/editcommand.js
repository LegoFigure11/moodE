"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Allows editing of the provided command.",
	aliases: ["ec", "editcomm"],
	usage: "<command name>, <option (isElevated|isManager|bannedUsers|bannedChannels|requiredRoles)>, <true|false|add|remove|delete>, <id>",
	isManager: true,
	noPm: true,
	async process(message, args) {
		if (!args[0]) return message.channel.send(`Syntax: \`${discordConfig.commandCharacter}editcommand ${this.usage}\``);

		const commands = discordCommandHandler.commands;
		let command;
		for (let i = 0; i < commands.length; i++) {
			if ([commands[i].name, ...commands[i].aliases].includes(Tools.toId(args[0]))) {
				command = commands[i];
				break;
			}
		}

		if (command) {
			const db = Storage.getDatabase(message.guild.id).config.commands[command.name];
			const area = Tools.toId(args[1]);
			const cmd = Tools.toId(args[2]) || "list";
			const pass = [];
			switch (area) {
			case "role":
			case "roles":
			case "requiredrole":
			case "requiredroles":
				switch (cmd) {
				case "true":
				case "add":
					if (!args[3]) return list(message, command.name, "requiredRoles");
					for (let i = 3; i < args.length; i++) {
						pass.push(args[i]);
					}
					add(message, command.name, "requiredRoles", pass);
					break;
				case "false":
				case "remove":
				case "delete":
					if (!args[3]) return list(message, command.name, "requiredRoles");
					for (let i = 3; i < args.length; i++) {
						pass.push(args[i]);
					}
					remove(message, command.name, "requiredRoles", pass);
					break;
				default:
					list(message, command.name, "requiredRoles");
				}
				break;

			case "chan":
			case "chans":
			case "channel":
			case "channels":
			case "bannedchannel":
			case "bannedchannels":
				switch (cmd) {
				case "true":
				case "add":
					if (!args[3]) return list(message, command.name, "bannedChannels");
					for (let i = 3; i < args.length; i++) {
						pass.push(args[i]);
					}
					add(message, command.name, "bannedChannels", pass);
					break;
				case "false":
				case "remove":
				case "delete":
					if (!args[3]) return list(message, command.name, "bannedChannels");
					for (let i = 3; i < args.length; i++) {
						pass.push(args[i]);
					}
					remove(message, command.name, "bannedChannels", pass);
					break;
				default:
					list(message, command.name, "bannedChannels");
				}
				break;

			case "user":
			case "users":
			case "banneduser":
			case "bannedusers":
				switch (cmd) {
				case "true":
				case "add":
					if (!args[3]) return list(message, command.name, "bannedUsers");
					for (let i = 3; i < args.length; i++) {
						pass.push(args[i]);
					}
					add(message, command.name, "bannedUsers", pass);
					break;
				case "false":
				case "remove":
				case "delete":
					if (!args[3]) return list(message, command.name, "bannedUsers");
					for (let i = 3; i < args.length; i++) {
						pass.push(args[i]);
					}
					remove(message, command.name, "bannedUsers", pass);
					break;
				default:
					list(message, command.name, "bannedUsers");
				}
				break;


			case "elevate":
			case "elevated":
			case "iselevate":
			case "iselevated":
				switch (cmd) {
				case "true":
				case "add":
					db.isElevated = true;
					Storage.exportDatabase(message.guild.id);
					message.channel.send(`${discordSuccessEmoji} \`${discordConfig.commandCharacter}${command.name}\` - isElevated set to: **true**`);
					break;
				case "false":
				case "remove":
				case "delete":
					db.isElevated = false;
					Storage.exportDatabase(message.guild.id);
					message.channel.send(`${discordSuccessEmoji} \`${discordConfig.commandCharacter}${command.name}\` - isElevated set to: **false**`);
					break;
				default:
					message.channel.send(`\`${discordConfig.commandCharacter}${command.name}\` - isElevated: ${db.isElevated}`);
				}
				break;

			case "manage":
			case "manager":
			case "ismanage":
			case "ismanager":
				switch (cmd) {
				case "true":
				case "add":
					db.isManager = true;
					Storage.exportDatabase(message.guild.id);
					message.channel.send(`${discordSuccessEmoji} \`${discordConfig.commandCharacter}${command.name}\` - isManager set to: **true**`);
					break;
				case "false":
				case "remove":
				case "delete":
					db.isManager = false;
					Storage.exportDatabase(message.guild.id);
					message.channel.send(`${discordSuccessEmoji} \`${discordConfig.commandCharacter}${command.name}\` - isManager set to: **false**`);
					break;
				default:
					message.channel.send(`\`${discordConfig.commandCharacter}${command.name}\` - isManager: ${db.isManager}`);
				}
				break;

			default:
				message.channel.send(`Syntax: \`${discordConfig.commandCharacter}editcommand ${this.usage}\``);
			}
			return true;
		} else {
			return message.channel.send(`${discordFailureEmoji} Command: "${Tools.toId(args[0])}" not found!`);
		}
	},
};

function list(message, cmd, area) {
	const db = Storage.getDatabase(message.guild.id).config.commands[cmd];
	const dbArr = [];
	if (area === "requiredRoles") {
		for (const entry of db[area]) {
			dbArr.push(`${utilities.parseRoleId(message, entry).name} (${entry})`);
		}
		message.channel.send(`${area} (${message.guild.name} - \`${discordConfig.commandCharacter}${cmd}\`)\n\`\`\`${dbArr.length === 0 ? "None!" : `\t• ${dbArr.join("\n\t• ")}`}\`\`\``);
	}
	if (area === "bannedUsers") {
		for (const entry of db[area]) {
			dbArr.push(`${utilities.parseUserId(entry).username}#${utilities.parseUserId(entry).discriminator} (${entry})`);
		}
		message.channel.send(`${area} (${message.guild.name} - \`${discordConfig.commandCharacter}${cmd}\`)\n\`\`\`${dbArr.length === 0 ? "None!" : `\t• ${dbArr.join("\n\t• ")}`}\`\`\``);
	}
	if (area === "bannedChannels") {
		for (const entry of db[area]) {
			dbArr.push(`${utilities.parseChannelId(message, entry).name} (${entry})`);
		}
		message.channel.send(`${area} (${message.guild.name} - \`${discordConfig.commandCharacter}${cmd}\`)\n\`\`\`${dbArr.length === 0 ? "None!" : `\t•${dbArr.join("\n\t• ")}`}\`\`\``);
	}
	return true;
}

function add(message, cmd, area, args) {
	const db = Storage.getDatabase(message.guild.id).config.commands[cmd];
	for (const arg of args) {
		let id;
		if (area === "requiredRoles") id = utilities.parseRoleId(message, arg);
		if (area === "bannedUsers") id = utilities.parseUserId(arg);
		if (area === "bannedChannels") id = utilities.parseChannelId(message, arg);
		if (id && !(db[area].includes(id.id))) {
			db[area].push(id.id);
			message.channel.send(`${discordSuccessEmoji} Added "${arg}" to **${area}** for command \`${discordConfig.commandCharacter}${cmd}\`!`);
		} else {
			const text = db[area].includes(id.id) ?
				`${discordFailureEmoji} "${arg}" is already in the group: ${area} for \`${discordConfig.commandCharacter}${cmd}\`!` :
				`${discordFailureEmoji} Unable to find a match for "${arg}".`;
			message.channel.send(text);
		}
	}
	Storage.exportDatabase(message.guild.id);
}

function remove(message, cmd, area, args) {
	const db = Storage.getDatabase(message.guild.id).config.commands[cmd];
	for (const arg of args) {
		let id;
		if (area === "requiredRoles") id = utilities.parseRoleId(message, arg);
		if (area === "bannedUsers") id = utilities.parseUserId(arg);
		if (area === "bannedChannels") id = utilities.parseChannelId(message, arg);
		if (id && (db[area].includes(id.id))) {
			db[area].splice(db[area].indexOf(id.id), 1);
			message.channel.send(`${discordSuccessEmoji} Removed "${arg}" from **${area}** for command \`${discordConfig.commandCharacter}${cmd}\`!`);
		} else {
			const text = db[area].includes(id.id) ?
				`${discordFailureEmoji} Unable to find a match for "${arg}".` :
				`${discordFailureEmoji} "${arg}" is not in the group: ${area} for \`${discordConfig.commandCharacter}${cmd}\`!`;
			message.channel.send(text);
		}
	}
	Storage.exportDatabase(message.guild.id);
}
