"use strict";

module.exports = {
	desc: "Forces the bot to crash.",
	adminOnly: true,
	async process(message, args) {
		const x = null;
		message.channel.send(x["foo"]);
	},
};
