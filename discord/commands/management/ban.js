"use strict";

const TIMEOUT = 30 * 1000;

module.exports = {
	desc: "Bans a user from the server.",
	usage: "<@user|userid>, <reason (optional)>",
	isManager: true,
	noPm: true,
	async process(message, args) {
		if (!args[0]) return message.channel.send(`Syntax: \`${discordConfig.commandCharacter}ban ${this.usage}\``);

		if (!message.guild.members.cache.get(client.user.id).hasPermission("BAN_MEMBERS")) return message.channel.send(`${discordFailureEmoji} Insufficient permissions! Bot does not have the required \`BAN_MEMBERS\` permission.`);
		(args[0].includes("<") ? client.users.fetch(args[0].match(/^<@!?(\d+)>$/)[1]) : client.users.fetch(args[0])).then(user => {
			if (!user) return message.channel.send(`${discordFailureEmoji} Unable to find user: ${args[0]}!`);
			if (user.id === message.author.id) return message.channel.send(`${discordFailureEmoji} You cannot ban yourself!`);

			const member = message.guild.members.cache.get(user.id);
			let banMessage = `${message.author} Are you sure you want to ban ${user.username}#${user.discriminator}? (Y/n):`;
			if (member) {
				if (!message.guild.members.cache.get(user.id).bannable) return message.channel.send(`${discordFailureEmoji} Unable to ban ${user.username}#${user.discriminator}: Insufficient permissions! Do they have a role higher than mine?`);
			} else {
				banMessage = `${message.author} It doesn't look like ${user.username}#${user.discriminator} is in this server. Would you like to ban them anyway? (Y/n):`;
			}

			args.shift();
			const reason = args.join(", ");

			const filter = response => {
				return response.author.id === message.author.id && response.channel.id === message.channel.id && (Tools.toId(response.content) === "y" || Tools.toId(response.content) === "n");
			};

			try {
				message.channel.send(banMessage).then(() => {
					message.channel.awaitMessages(filter, {max: 1, time: TIMEOUT, errors: ["time"]}).then(collected => {
						if (Tools.toId(collected.first().content) === "y") {
							message.guild.members.ban(user, {reason: reason});
							return message.channel.send(`${discordSuccessEmoji} ${user} was banned${reason.length > 0 ? ` (Reason: ${reason})` : ""}!`);
						} else {
							message.channel.send(`${user.username}#${user.discriminator} will not be banned!`);
						}
					}).catch(collected => {
						return message.channel.send(`The command timed out! ${user.username}#${user.discriminator} will not be banned!`);
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
