"use strict";

module.exports = {
	desc: "Gives the user a custom role color.",
	usage: "<hex code>",
	aliases: ["rolecolour", "customcolor", "customcolour", "namecolor", "namecolour"],
	async process(message, args) {
		if (!message.guild.members.cache.get(client.user.id).hasPermission("MANAGE_ROLES")) return message.channel.send(`${discordConfig.failureEmoji} Insufficient permissions!`);
		const db = Storage.getDatabase(message.guild.id);
		if (!db.customRoles) db.customRoles = {};
		if (!db.customRoles[message.author.id]) db.customRoles[message.author.id] = {};
		db.customRoles[message.author.id].name = `${message.author.username}#${message.author.discriminator}`;
		const hexRegex = /^(0[xX]){1}[A-Fa-f0-9]{6}$|^#[A-Fa-f0-9]{6}$|^[A-Fa-f0-9]{6}$/;
		let color = args[0];
		if (color.trim().length > 8) {
			color = color.trim().substr(0, 8);
		}
		color = color.replace("0x", "#");
		if (!color.startsWith("#")) color = `#${color}`;
		color = color.toUpperCase();
		if (!(hexRegex.test(color.trim()))) return message.channel.send(`${discordConfig.failureEmoji} Unable to coerce "${args[0]}" as a hex code!`);
		await message.guild.roles.create({
			data: {
				name: `${message.author.username} - ${color}`,
				color: color,
				position: message.guild.members.cache.get(client.user.id).roles.highest.position - 1,
			},
			reason: "Custom Role Color",
		}).catch(console.error);
		const newRole = message.guild.roles.cache.find(role => role.name === `${message.author.username} - ${color}`);
		await message.member.roles.add(newRole).catch(console.error);
		message.channel.send(`Successfully added ${color} to <@${message.author.id}>`);
		if (db.customRoles[message.author.id].roleId) {
			const oldRole = message.guild.roles.cache.find(role => role.id === db.customRoles[message.author.id].roleId);
			if (oldRole) await oldRole.delete("Old custom color role");
		}
		db.customRoles[message.author.id].roleId = newRole.id;
		Storage.exportDatabase(message.guild.id);
		return true;
	},
};
