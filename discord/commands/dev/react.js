"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Makes the react to a message.",
	usage: "<message id>, <emoji>",
	adminOnly: true,
	async process(message, args) {
		if (!args[1]) return;
		try {
			const msg = await utilities.parseMessageId(message, args[0].trim());
			await msg.react(args[1].trim());
			return message.channel.send(`${discordSuccessEmoji} Reaction added!`);
		} catch (e) {
			console.log(e.stack);
		}
	},
};
