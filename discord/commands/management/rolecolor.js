"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Gives the user a custom role color.",
	usage: "<hex code>",
	aliases: ["rolecolour", "customcolor", "customcolour", "namecolor", "namecolour"],
	async process(message, args) {
		if (!message.guild.members.cache.get(client.user.id).hasPermission("MANAGE_ROLES")) return message.channel.send(`${discordFailureEmoji} Insufficient permissions!`);
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
		if (color.includes("36393E")) return message.channel.send(`${discordFailureEmoji} Unable to set your custom color! Try a color that can be seen in all themes next time.`);
		if (!(hexRegex.test(color.trim()))) return message.channel.send(`${discordFailureEmoji} Unable to coerce "${args[0]}" as a hex code!`);

		// Check for existing custom role
		if (db.customRoles[message.author.id].roleId && utilities.parseRoleId(message, db.customRoles[message.author.id].roleId) && !utilities.parseRoleId(message, db.customRoles[message.author.id].roleId).deleted) {
			const role = utilities.parseRoleId(message, db.customRoles[message.author.id].roleId);
			await role.edit({
				name: `${message.author.username} - ${color}`,
				color: color,
				position: message.guild.members.cache.get(client.user.id).roles.highest.position - 1,
			}, "Custom Role Color (Update)").catch(console.error);
			message.channel.send(`${discordSuccessEmoji} Successfully updated <@${message.author.id}>'s color to ${color}!`);
		} else {
			// Make a new custom role
			await message.guild.roles.create({
				data: {
					name: `${message.author.username} - ${color}`,
					color: color,
					position: message.guild.members.cache.get(client.user.id).roles.highest.position - 1,
				},
				reason: "Custom Role Color",
			}).catch(console.error);

			const role = utilities.parseRoleId(message, `${message.author.username} - ${color}`);
			db.customRoles[message.author.id].roleId = role.id;

			try {
				await message.member.roles.add(role);
				message.channel.send(`${discordSuccessEmoji} Successfully added ${color} to <@${message.author.id}>`);
			} catch (e) {
				role.delete();
				message.channel.send(`${discordFailureEmoji} Something went wrong creating your role!`);
			}
		}
		Storage.exportDatabase(message.guild.id);
		return true;
	},
};
