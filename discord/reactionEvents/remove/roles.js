"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	noPm: true,
	async process(reaction, user) {
		const db = Storage.getDatabase(reaction.message.guild.id);
		if (!db.reactionRoles) return;
		for (const messageId of Object.keys(db.reactionRoles)) {
			if (messageId === reaction.message.id) {
				const emojiName = reaction._emoji.id ? `<:${reaction._emoji.name}:${reaction._emoji.id}>` : reaction._emoji.name.codePointAt(0).toString(16);
				const emojis = [];
				for (const emoji of Object.keys(db.reactionRoles[messageId])) {
					if (emoji.startsWith("<")) {
						emojis.push(emoji);
					} else {
						emojis.push(emoji.codePointAt(0).toString(16));
					}
				}
				if (emojis.includes(emojiName)) {
					const role = await utilities.parseRoleId(reaction.message, db.reactionRoles[messageId][emojiName.startsWith("<") ? emojiName : String.fromCodePoint(`0x${emojiName}`)]).catch(e => { console.log(`${Tools.discordText()}${`Reaction Role Error`.brightRed}: Unable to retrieve role: ${db.reactionRoles[messageId][emojiName.startsWith("<") ? emojiName : String.fromCodePoint(`0x${emojiName}`)]}`); });
					const member = await reaction.message.guild.members.fetch(user.id);
					if (member._roles.includes(role.id)) {
						try {
							await member.roles.remove(role);
							break;
						} catch (e) {
							console.log(`${Tools.discordText()}${`Reaction Role Error`.brightRed}: Unable to remove ${role.name} ${`(${role.id})`.grey} from ${user.name}#${user.discriminator} ${`(${user.id})`.grey}`);
						}
					}
				}
			}
		}
	},
};
