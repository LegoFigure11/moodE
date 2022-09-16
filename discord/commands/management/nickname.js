"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Sets the nickname of the provided user, or if none is provided, the bot.",
	usage: "<nickname>, <@user|user id> (optional)",
	aliases: ["nick", "setnick", "setnickname"],
	isManager: true,
	noPm: true,
	async process(message, args) {
		let user;
		if (args[1]) {
			user = utilities.parseUserId(args[1]);
			if (user) user = user.id;
		}
		let failed;
		if (user) {
			await message.guild.members.cache.get(user).setNickname(args[0].trim()).catch(function () { failed = true; });
			if (!failed) {
				return message.channel.send(`${discordSuccessEmoji} Set <@${user}>'s nickname to "${args[0].trim()}"!`);
			} else {
				return message.channel.send(`${discordFailureEmoji} Unable to set nickname!`);
			}
		} else {
			await message.guild.members.cache.get(client.user.id).setNickname(args[0].trim()).catch(function () { failed = true; });
			if (!failed) {
				return message.channel.send(`${discordSuccessEmoji} Set <@${client.user.id}>'s nickname to "${args[0].trim()}"!`);
			} else {
				return message.channel.send(`${discordFailureEmoji} Unable to set nickname!`);
			}
		}
	},
};
