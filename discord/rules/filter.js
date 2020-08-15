"use strict";

const glyph = require("../../sources/homoglyph.js");
const removeDiacritics = require("diacritics").remove;

const KAOMOJI = ["(* ^ ω ^)", "(o^▽^o)", "(≧◡≦)", "☆⌒ヽ(*\"､^*)chu", "( ˘⌣˘)♡(˘⌣˘ )", "(눈_눈)", "ʕ º ᴥ ºʔ"];

module.exports = {
	servers: ["614615934979801113"],
	async process(message) {
		if (message.author.bot) return;
		const db = Storage.getDatabase(message.guild.id);
		if (!db.filter || db.filter.length === 0) return;

		const member = await client.guilds.cache.get(message.guild.id).members.cache.get(message.author.id);
		// Mods should be immune
		if (member.hasPermission("MANAGE_MESSAGES")) return;

		const banwordRegex = new RegExp(`(?:\\b|(?!\\w))(?:${glyph.replace(removeDiacritics(db.filter.join("?"))).toLowerCase().replace(/[i|l]/g, "[i|l]").replace(/[ad]/g, "[ad]").replace(/\?/g, "|")})(?:\\b|\\B(?!\\w))`, "i");

		// Check for filtered words in the message
		for (const word of glyph.replace(removeDiacritics(message.content).replace(/[.]/g, "")).toLowerCase().split(" ")) {
			if (banwordRegex.test(word)) {
				try {
					await message.delete();
					message.channel.send(`${discordFailureEmoji} ${message.author}, your message contained terms that are not permitted in this server, and has been deleted.`);
				} catch (e) {
					console.log(e);
				}
			}
		}

		// Check for filtered words in user nickname
		let inapNickname = false;
		if (member.nickname) {
			for (const word of glyph.replace(removeDiacritics(member.nickname.replace(/[.]/g, ""))).toLowerCase().split(" ")) {
				if (banwordRegex.test(word)) {
					try {
						await member.setNickname("");
						inapNickname = true;
					} catch (e) {
						console.log(e);
					}
				}
			}
		}

		// Check for filtered words in username
		let inapUsername = false;
		const currentMember = await client.guilds.cache.get(message.guild.id).members.cache.get(message.author.id);
		if (!currentMember.nickname) {
			for (const word of glyph.replace(removeDiacritics(message.author.username.replace(/[.]/g, ""))).toLowerCase().split(" ")) {
				if (banwordRegex.test(word)) {
					try {
						await member.setNickname(Tools.sampleOne(KAOMOJI));
						inapUsername = true;
					} catch (e) {
						console.log(e);
					}
				}
			}
		}

		if (inapUsername || inapNickname)	message.channel.send(`${discordFailureEmoji} ${message.author}, your user/nickname contained terms that are not permitted in this server, so your nickname has been reset.`);
	},
};
