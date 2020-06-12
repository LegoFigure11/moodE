"use strict";

module.exports = {
	desc: "Removes the user's custom role color.",
	aliases: ["removecolour", "deletecolor", "deletecolour", "deletenamecolor", "deletenamecolour"],
	async process(message, args) {
		if (!message.guild.members.cache.get(client.user.id).hasPermission("MANAGE_ROLES")) return message.channel.send(`${discordConfig.failureEmoji} Insufficient permissions!`);
		const db = Storage.getDatabase(message.guild.id);
		if (!db.customRoles) db.customRoles = {};
		if (!db.customRoles[message.author.id]) db.customRoles[message.author.id] = {};
		db.customRoles[message.author.id].name = `${message.author.username}#${message.author.discriminator}`;
		if (db.customRoles[message.author.id].roleId) {
			try {
				const oldRole = message.guild.roles.cache.find(role => role.id === db.customRoles[message.author.id].roleId);
				if (oldRole) await oldRole.delete("Old custom color role");
				message.channel.send(`${discordConfig.successEmoji} Successfully removed your custom role!`);
			} catch (e) {
				message.channel.send(`${discordConfig.failureEmoji} Something went wrong deleting your old role!`);
			}
			db.customRoles[message.author.id].roleId = "";
		} else {
			return message.channel.send(`${discordConfig.failureEmoji} You don't have a custom color! Please run \`${discordConfig.commandCharacter}rolecolor\` first.`);
		}
		Storage.exportDatabase(message.guild.id);
		return true;
	},
};
