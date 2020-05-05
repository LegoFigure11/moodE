"use strict";

module.exports = {
	desc: "Makes the bot send a user a message.",
	usage: "<user>, <message>",
	developerOnly: true,
	async process(args, room, user) {
		if (!args[1]) return user.say(`${psConfig.commandCharacter}pm ${this.usage}`);
		const message = [];
		for (let i = 1; i < args.length; i++) {
			message.push(args[i]);
		}
		const target = psUsers.get(args.shift());
		if (!target) return user.say(`User "${args[0]}" not found!`);
		args[0] = args[0].trim(); // Clear leading whitespace to allow for entry of commands

		return room.say(`/pm ${target.id}, ${args.join(",")}`);
	},
};
