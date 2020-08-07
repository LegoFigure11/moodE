"use strict";

module.exports = {
	desc: "Prints information about the bot's ping.",
	async process(message, args) {
		return message.channel.send(`🏓 Pong!\nBot: ${Date.now() - message.createdTimestamp}ms | API: ${client.ws.ping}ms`);
	},
};
