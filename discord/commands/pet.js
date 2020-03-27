"use strict";

module.exports = {
	desc: "/me pet",
	async process(message, args) {
		return message.channel.send(`_/me pet ${args[0] ? args[0] : ""}_`);
	},
};
