"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Allows editing of manager permissions.",
	usage: "<list|add|remove>, <@user|userid>",
	aliases: ["manage", "manager", "setmanagers", "editmanagers"],
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
					if (!db.config.botRanks.manager.includes(user.id)) {
						db.config.botRanks.manager.push(user.id);
						message.channel.send(`${discordSuccessEmoji} Added <@${user.id}> as a Bot Manager!`);
						Storage.exportDatabase(message.guild.id);
					} else {
						message.channel.send(`${discordFailureEmoji} ${user.username}#${user.discriminator} is already a Bot Manager!`);
					}
				} else {
					message.channel.send(`${discordFailureEmoji} User "${args[i]}" not found...`);
				}
			}
			break;
		case "delete":
		case "remove":
			for (let i = 1; i < args.length; i++) {
				const user = utilities.parseUserId(args[i]);
				if (user) {
					if (db.config.botRanks.manager.includes(user.id)) {
						db.config.botRanks.manager.splice(db.config.botRanks.manager.indexOf(user.id), 1);
						message.channel.send(`${discordSuccessEmoji} Removed Bot Manager permission from <@${user.id}>.`);
						Storage.exportDatabase(message.guild.id);
					} else {
						message.channel.send(`${discordFailureEmoji} ${user.username}#${user.discriminator} is not a Bot Manager!`);
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
			buf += "```";
			message.channel.send(buf);
			break;
		}
		return true;
	},
};
