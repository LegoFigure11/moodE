"use strict";

module.exports = {
	desc: "Makes the bot send a message.",
	longDesc: "Makes the bot send the provided message, and deletes the message that triggers the command.",
	usage: "<message>",
	adminOnly: true,
	async process(message, args) {
		let target = "";
		try {
			message.delete();
		} catch (e) {}
		for (let i = 0; i < args.length; i++) {
			if (i !== 0) target += ", ";
			target += args[i];
		}
		return message.channel.send(target);
	},
};
