"use strict";

module.exports = {
	desc: "Pays respects.",
	async process(message, args) {
		return message.channel.send(`${message.author.username} paid their respects.`);
	},
};
