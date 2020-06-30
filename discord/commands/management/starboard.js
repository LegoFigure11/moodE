"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Configures starboard.",
	usage: "<channel>, <minimum reactions (optional - default 3)>, <emoji (optional - default \u2B50)>",
	aliases: ["sb", "port"],
	isManager: true,
	noPm: true,
	async process(message, args) {
		if (!args[0]) return message.channel.send(`${discordConfig.commandCharacter}starboard ${this.usage}`);
		const channel = utilities.parseChannelId(message, args[0]);
		if (!channel) return message.channel.send(`${discordConfig.failureEmoji} Unable to parse "${args[0]}" as a channel!"`);

		const db = Storage.getDatabase(message.guild.id);
		if (!db.starboard) db.starboard = {};
		db.starboard.channel = channel.id;
		db.starboard.requiredStars = parseInt(args[1]) || db.starboard.requiredStars || 3;
		db.starboard.emoji = args[2] || db.starboard.emoji || "\u2B50";

		Storage.exportDatabase(message.guild.id);

		return message.channel.send(`Current Starboard configuration:\nChannel: ${utilities.parseChannelId(message, db.starboard.channel)}\nRequired Stars: ${db.starboard.requiredStars}\nEmoji: ${db.starboard.emoji}`);
	},
};
