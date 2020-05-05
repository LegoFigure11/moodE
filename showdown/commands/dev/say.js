"use strict";

module.exports = {
	desc: "Makes the bot send a message.",
	usage: "<(optional) room>, <message>",
	developerOnly: true,
	async process(args, room, user) {
		if (!args[1]) return room.say(args[0]);
		const message = [];
		for (let i = 1; i < args.length; i++) {
			message.push(args[i]);
		}
		message[0] = message[0].trim(); // Clear leading whitespace to allow for entry of commands
		return psClient.send(`${args[0]}|${message.join(",")}`);
	},
};
