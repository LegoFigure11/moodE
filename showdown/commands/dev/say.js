"use strict";

module.exports = {
	desc: "Makes the bot send a message.",
	developerOnly: true,
	async process(args, room, user) {
		if (!args[1]) return room.say(args[0]);
		const message = [];
		for (let i = 1; i < args.length; i++) {
			message.push(args[i]);
		}
		return psClient.send(`${args[0]}|${message.join(",")}`);
	},
};
