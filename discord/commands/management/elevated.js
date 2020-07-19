"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Allows editing of elevated permissions.",
	usage: "<list|add|remove>, <@user|userid>",
	aliases: ["elevate", "setelevated", "editelevated", "voice"],
	isManager: true,
	noPm: true,
	async process(message, args) {
		const db = Storage.getDatabase(message.guild.id);
		const mode = Tools.toId(args[0]) || "list";
		switch (mode) {
		case "add":
			for (let i = 1; i < args.length; i++) {
				const user = utilities.parseUserId(args[i]);
				if (user) {
					if (!db.config.botRanks.elevated.includes(user.id)) {
						db.config.botRanks.elevated.push(user.id);
						message.channel.send(`${discordSuccessEmoji} Game <@${user.id}> elevated permissions!`);
						Storage.exportDatabase(message.guild.id);
					} else {
						message.channel.send(`${discordFailureEmoji} ${user.username}#${user.discriminator} already has elevated permissions!`);
					}
				} else {
					message.channel.send(`${discordFailureEmoji} User "${args[i]}" not found...`);
				}
			}
			break;
		case "remove":
			for (let i = 1; i < args.length; i++) {
				const user = utilities.parseUserId(args[i]);
				if (user) {
					if (db.config.botRanks.elevated.includes(user.id)) {
						db.config.botRanks.elevated.splice(db.config.botRanks.elevated.indexOf(user.id), 1);
						message.channel.send(`${discordSuccessEmoji} Removed elevated permissions from <@${user.id}>.`);
						Storage.exportDatabase(message.guild.id);
					} else {
						message.channel.send(`${discordFailureEmoji} ${user.username}#${user.discriminator} does not have elevated permissions!`);
					}
				} else {
					message.channel.send(`${discordFailureEmoji} User "${args[i]}" not found...`);
				}
			}
			break;
		case "list":
		default:
			let buf = "```Bot Managers:\n";
			for (let i = 0; i < discordConfig.admin.length; i++) {
				const user = utilities.parseUserId(discordConfig.admin[i]);
				buf += `\t${user.username}#${user.discriminator} (global)\n`;
			}
			for (let i = 0; i < db.config.botRanks.manager.length; i++) {
				const user = utilities.parseUserId(db.config.botRanks.manager[i]);
				buf += `\t${user.username}#${user.discriminator} (server)\n`;
			}
			buf += "\nElevated Permissions:\n";
			for (let i = 0; i < discordConfig.elevated.length; i++) {
				const user = utilities.parseUserId(discordConfig.elevated[i]);
				buf += `\t${user.username}#${user.discriminator} (global)\n`;
			}
			if (db.config.botRanks.elevated.length !== 0) {
				for (let i = 0; i < db.config.botRanks.elevated.length; i++) {
					const user = utilities.parseUserId(db.config.elevated.manager[i]);
					buf += `\t${user.username}#${user.discriminator} (server)\n`;
				}
			}
			buf += "\nBy default, all user with the Server Administrator permission are also Bot Managers and have Elevated Permissions, even if not listed above.\n```";
			message.channel.send(buf);
			break;
		}
		return true;
	},
};
