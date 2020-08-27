"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	noPm: true,
	async process(reaction, user) {
		const db = Storage.getDatabase(reaction.message.guild.id);
		if (!db.reactionRoles) return;

		for (const entry of Object.keys(db.reactionRoles)) {
			if (entry === reaction.message.id) {
				const emojiName = reaction._emoji.id ? `<:${reaction._emoji.name}:${reaction._emoji.id}>` : reaction._emoji.name;
				if (Object.keys(db.reactionRoles[entry]).includes(emojiName)) {
					const role = await utilities.parseRoleId(reaction.message, db.reactionRoles[entry][emojiName]);
					const member = await reaction.message.guild.members.fetch(user.id);
					if (member._roles.includes(role.id)) {
						try {
							await member.roles.remove(role);
							break;
						} catch (e) {
							console.log(`${Tools.discordText()}${`Reaction Role Error`.brightRed}: Unable to add ${role.name} ${`(${role.id})`.grey} to ${user.name}#${user.discriminator} ${`(${user.id})`.grey}`);
						}
					}
				}
			}
		}
	},
};
