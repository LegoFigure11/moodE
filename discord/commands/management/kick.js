"use strict";

const TIMEOUT = 30 * 1000;

module.exports = {
	desc: "Kicks a user from the server.",
	usage: "<@user|userid>, <reason (optional)>",
	isElevated: true,
	noPm: true,
	async process(message, args) {
		if (!args[0]) return message.channel.send(`Syntax: \`${discordConfig.commandCharacter}kick ${this.usage}\``);

		if (!message.guild.members.cache.get(client.user.id).hasPermission("KICK_MEMBERS")) return message.channel.send(`${discordFailureEmoji} Insufficient permissions! Bot does not have the required \`KICK_MEMBERS\` permission.`);
		(args[0].includes("<") ? client.users.fetch(args[0].match(/^<@!?(\d+)>$/)[1]) : client.users.fetch(args[0])).then(user => {
			if (!user) return message.channel.send(`${discordFailureEmoji} Unable to find user: ${args[0]}!`);
			if (user.id === message.author.id) return message.channel.send(`${discordFailureEmoji} You cannot kick yourself!`);
			if (!message.guild.members.cache.get(user.id).bannable) return message.channel.send(`${discordFailureEmoji} Unable to kick ${user.username}#${user.discriminator}: Insufficient permissions! Do they have a role higher than mine?`);

			args.shift();
			const reason = args.join(", ");

			const filter = response => {
				return response.author.id === message.author.id && response.channel.id === message.channel.id && (Tools.toId(response.content) === "y" || Tools.toId(response.content) === "n");
			};

			try {
				message.channel.send(`${message.author} Are you sure you want to kick ${user.username}#${user.discriminator}? (Y/n):`).then(() => {
					message.channel.awaitMessages(filter, {max: 1, time: TIMEOUT, errors: ["time"]}).then(collected => {
						if (Tools.toId(collected.first().content) === "y") {
							message.guild.members.ban(user, {reason: reason});
							return message.channel.send(`${discordSuccessEmoji} ${user} was kicked${reason.length > 0 ? ` (${reason})` : ""}!`);
						} else {
							message.channel.send(`${user.username}#${user.discriminator} will not be kicked!`);
						}
					}).catch(collected => {
						return message.channel.send(`The command timed out! ${user.username}#${user.discriminator} will not be kicked!`);
					});
				});
			} catch (e) {
				console.log(e.stack);
			}
		}).catch(e => {
			return message.channel.send(`${discordFailureEmoji} Unable to find user: ${args[0]}! Please ensure you either mention the user, or provide a valid User ID.`);
		});
	},
};
