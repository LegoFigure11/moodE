"use strict";

const utilities = require("../utilities.js");

module.exports = {
	usage: "<@user 1 | user id of user 1>, <@user 2 | user id of user 2> ... <@user x | user id of user x>",
	desc: "Generates a random 4-digit link code and sends it to the author and provided users.",
	longDesc: "Generates a random 4-digit link code and sends it to the author and provided users.\nPlease ensure you tag users or provide a valid user id (Right-Click/Long Press their username and press 'Copy ID' if you have developer tools enabled) as usernames alone are not understood.\nPlease also ensure that all involved parties are able to recieve Private Messages from the bot.",
	async process(message, args) {
		const code = utilities.generateRandomLinkCode(4);

		if (!(args[0])) {
			return message.channel.send(`Your random link code is: **${code}**`);
		}

		const users = [];
		const invalidUsers = [];

		for (let i = 0; i < args.length; i++) {
			const user = utilities.parseUserId(args[i]);
			if (!user) {
				invalidUsers.push(args[i]);
			} else {
				if (!(users.includes(`${user.username}#${user.discriminator}`))) {
					users.push(`${user.username}#${user.discriminator}`);
					user.send(`Your link code (sent by ${message.author.username}#${message.author.discriminator}) is: **${code}**`);
				}
			}
		}

		if (invalidUsers.length > 0) message.channel.send(`Invalid user${invalidUsers.length === 1 ? "" : "s"}: ${Tools.oxfordJoin(invalidUsers)}`);
		return message.author.send(`Your link code (sent to ${users.length > 0 ? Tools.oxfordJoin(users) : "nobody, check your inputs maybe?"}) is: **${code}**`);
	},
};
