"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Allows editing of server configuration.",
	usage: "<requiredRoles|bannedChannels|bannedUsers|nsfw>, <add|remove|list>, <id>",
	aliases: ["edit", "config"],
	isManager: true,
	noPm: true,
	override: true,
	async process(message, args) {
		const db = Storage.getDatabase(message.guild.id);
		const area = Tools.toId(args[0]) || "list";
		const mode = Tools.toId(args[1]) || "list";
		switch (area) {
		case "role":
		case "roles":
		case "requiredrole":
		case "requiredroles":
			switch (mode) {
			case "add":
				if (!(args[2])) return message.channel.send("Please mention/provide the id of the role you would like to add!");
				for (let i = 2; i < args.length; i++) {
					const role = utilities.parseRoleId(message, args[i]);
					if (!role) return message.channel.send(`${failureEmoji} Role "${args[i]}" not found...`);
					if (db.config.requiredRoles.includes(role.id)) return message.channel.send(`${failureEmoji} @${role.name} is already a Required Role!`);
					db.config.requiredRoles.push(role.id);
					message.channel.send(`${successEmoji} Added @${role.name} as a required role!`);
				}
				Storage.exportDatabase(message.guild.id);
				break;
			case "delete":
			case "remove":
				if (!(args[2])) return message.channel.send("Please mention/provide the id of the role you would like to remove!");
				for (let i = 2; i < args.length; i++) {
					const role = utilities.parseRoleId(message, args[i]);
					if (!role) return message.channel.send(`${failureEmoji} Role "${args[i]}" not found...`);
					if (!db.config.requiredRoles.includes(role.id)) return message.channel.send(`${failureEmoji} @${role.name} is not a Required Role!`);
					db.config.requiredRoles.splice(db.config.requiredRoles.indexOf(role.id), 1);
					message.channel.send(`${successEmoji} Removed @${role.name} as a required role!`);
				}
				Storage.exportDatabase(message.guild.id);
				break;
			case "list":
			default:
				noMatch(db, message, "requiredRoles", "required roles");
				break;
			}
			break;

		case "chan":
		case "chans":
		case "channel":
		case "channels":
		case "bannedchannel":
		case "bannedchannels":
			switch (mode) {
			case "add":
			case "ban":
				if (!(args[2])) return message.channel.send("Please mention/provide the id of the channel you would like to ban!");
				for (let i = 2; i < args.length; i++) {
					const chan = utilities.parseChannelId(message, args[i]);
					if (!chan) return message.channel.send(`${failureEmoji} Channel "${args[i]}" not found...`);
					if (db.config.bannedChannels.includes(chan.id)) return message.channel.send(`${failureEmoji} #${chan.name} is already a Banned Channel!`);
					db.config.bannedChannels.push(chan.id);
					message.channel.send(`${successEmoji} Added #${chan.name} as a banned channel!`);
				}
				Storage.exportDatabase(message.guild.id);
				break;
			case "delete":
			case "remove":
			case "unban":
				if (!(args[2])) return message.channel.send("Please mention/provide the id of the channel you would like to unban!");
				for (let i = 2; i < args.length; i++) {
					const chan = utilities.parseChannelId(message, args[i]);
					if (!chan) return message.channel.send(`${failureEmoji} Channel "${args[i]}" not found...`);
					if (!db.config.bannedChannels.includes(chan.id)) return message.channel.send(`${failureEmoji} #${chan.name} is not a Banned Channel!`);
					db.config.bannedChannels.splice(db.config.bannedChannels.indexOf(chan.id), 1);
					message.channel.send(`${successEmoji} Removed #${chan.name} as a banned channel!`);
				}
				Storage.exportDatabase(message.guild.id);
				break;
			case "list":
			default:
				noMatch(db, message, "bannedChannels", "banned channels");
				break;
			}
			break;

		case "nsfw":
			switch (mode) {
			case "add":
			case "true":
				db.config.nsfw.allowNSFW = true;
				message.channel.send(`${discordConfig.successEmoji} NSFW commands enabled!`);
				Storage.exportDatabase(message.guild.id);
				if (!(args[2])) return message.channel.send("Please mention/provide the id of the channel you would like to add!");
				for (let i = 2; i < args.length; i++) {
					const chan = utilities.parseChannelId(message, args[i]);
					if (!chan) return message.channel.send(`${failureEmoji} Channel "${args[i]}" not found...`);
					if (db.config.nsfw.nsfwChannels.includes(chan.id)) return message.channel.send(`${failureEmoji} #${chan.name} already has NSFW commands available!`);
					db.config.nsfw.nsfwChannels.push(chan.id);
					message.channel.send(`${successEmoji} Enabled NSFW commands in #${chan.name}!`);
				}
				Storage.exportDatabase(message.guild.id);
				break;
			case "delete":
			case "remove":
			case "false":
				db.config.nsfw.allowNSFW = false;
				message.channel.send(`${discordConfig.successEmoji} NSFW commands disabled!`);
				Storage.exportDatabase(message.guild.id);
				if (!(args[2])) return message.channel.send("Please mention/provide the id of the channel you would like to remove!");
				for (let i = 2; i < args.length; i++) {
					const chan = utilities.parseChannelId(message, args[i]);
					if (!chan) return message.channel.send(`${failureEmoji} Channel "${args[i]}" not found...`);
					if (!db.config.nsfw.nsfwChannels.includes(chan.id)) return message.channel.send(`${failureEmoji} #${chan.name} is not an NSFW Channel!`);
					db.config.nsfw.nsfwChannels.splice(db.config.nsfw.nsfwChannels.indexOf(chan.id), 1);
					message.channel.send(`${successEmoji} Disabled NSFW commands in #${chan.name}!`);
				}
				Storage.exportDatabase(message.guild.id);
				break;
			case "list":
			default:
				nsfwCheck(db, message, "allowNSFW", "NSFW channels");
				break;
			}
			break;


		case "user":
		case "users":
		case "banneduser":
		case "bannedusers":
			switch (mode) {
			case "add":
			case "ban":
				if (!(args[2])) return message.channel.send("Please mention/provide the id of the user you would like to ban!");
				for (let i = 2; i < args.length; i++) {
					const user = utilities.parseUserId(args[i]);
					if (!user) return message.channel.send(`${failureEmoji} User "${args[i]}" not found...`);
					if (db.config.bannedUsers.includes(user.id)) return message.channel.send(`${failureEmoji} ${user.username}#${user.discriminator} is already banned from using bot commands!`);
					db.config.bannedUsers.push(user.id);
					message.channel.send(`${successEmoji} Banned ${user.username}#${user.discriminator} from using commands in this server!`);
				}
				Storage.exportDatabase(message.guild.id);
				break;
			case "delete":
			case "remove":
			case "unban":
				if (!(args[2])) return message.channel.send("Please mention/provide the id of the user you would like to unban!");
				for (let i = 2; i < args.length; i++) {
					const user = utilities.parseUserId(args[i]);
					if (!user) return message.channel.send(`${failureEmoji} User "${args[i]}" not found...`);
					if (!db.config.bannedUsers.includes(user.id)) return message.channel.send(`${failureEmoji} ${user.username}#${user.discriminator} is not banned from using bot commands!`);
					db.config.bannedUsers.splice(db.config.bannedUsers.indexOf(user.id), 1);
					message.channel.send(`${successEmoji} Un-banned ${user.username}#${user.discriminator} from using commands in this server!`);
				}
				Storage.exportDatabase(message.guild.id);
				break;
			case "list":
			default:
				noMatch(db, message, "bannedUsers", "users banned from using the bot");
				break;
			}
			break;
		case "list":
		default:
			noMatch(db, message, "requiredRoles", "required roles");
			noMatch(db, message, "bannedChannels", "banned channels");
			noMatch(db, message, "bannedUsers", "users banned from using the bot");
			return true;
		}
	},
};

function noMatch(db, message, dbText, area) {
	let buf = `\`\`\`\nCurrent ${area}:`;
	for (let i = 0; i < db.config[dbText].length; i++) {
		const user = utilities.parseUserId(db.config[dbText][i]);
		const chan = utilities.parseChannelId(message, db.config[dbText][i]);
		const role = utilities.parseRoleId(message, db.config[dbText][i]);
		if (user) buf += `\n\t${user.id} (${user.username}#${user.discriminator})`;
		if (chan) buf += `\n\t${chan.id} (#${chan.name})`;
		if (role) buf += `\n\t${role.id} (@${role.name})`;
	}
	buf += "```";
	return message.channel.send(db.config[dbText].length > 0 ? buf : `There are no ${area} in this server.`);
}

function nsfwCheck(db, message, dbText, area) {
	const isNSFW = db.config.nsfw.allowNSFW;
	let buf = `\`\`\`\nCurrent ${area}:`;
	for (let i = 0; i < db.config.nsfw[dbText].length; i++) {
		const chan = utilities.parseChannelId(message, db.config.nsfw[dbText][i]);
		if (chan) buf += `\n\t${chan.id} (#${chan.name})`;
	}
	buf += "```";
	message.channel.send(`Allow NSFW: \`${isNSFW}\``);
	return message.channel.send(db.config.nsfw[dbText].length > 0 ? buf : `There are no ${area} in this server.`);
}
