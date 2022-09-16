"use strict";

module.exports = {
	desc: "Undoes the effects of channelmute",
	usage: "<@user|userid>",
	aliases: ["chanunmute", "unmute"],
	isManager: true,
	noPm: true,
	async process(message, args) {
		if (!args[0]) return message.channel.send(`Syntax: \`${discordConfig.commandCharacter}channelunmute ${this.usage}\``);

		if (!message.guild.members.cache.get(client.user.id).hasPermission("MANAGE_ROLES")) return message.channel.send(`${discordFailureEmoji} Insufficient permissions! Bot does not have the required \`MANAGE_ROLES\` permission.`);
		(args[0].includes("<") ? client.users.fetch(args[0].match(/^<@!?(\d+)>$/)[1]) : client.users.fetch(args[0])).then(user => {
			if (!user) return message.channel.send(`${discordFailureEmoji} Unable to find user: ${args[0]}!`);
			try {
				message.channel.updateOverwrite(user, {
					"SEND_MESSAGES": null,
					"ADD_REACTIONS": null,
					"SPEAK": null,
					"STREAM": null,
				});
				return message.channel.send(`${discordSuccessEmoji} ${user} has been unmuted in ${message.channel}!`);
			} catch (e) {
				return message.channel.send(`${discordFailureEmoji} Unable to unmute ${user}! Do they have a role higher than mine?`);
			}
		}).catch(e => {
			console.log(e);
			return message.channel.send(`${discordFailureEmoji} Unable to find user: ${args[0]}! Please ensure you either mention the user, or provide a valid User ID.`);
		});
	},
};
