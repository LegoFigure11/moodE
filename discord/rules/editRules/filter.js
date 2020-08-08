"use strict";

const glyph = require("../../sources/homoglyph.js");
const removeDiacritics = require("diacritics").remove;

const KAOMOJI = ["(* ^ ω ^)", "(o^▽^o)", "(≧◡≦)", "☆⌒ヽ(*\"､^*)chu", "( ˘⌣˘)♡(˘⌣˘ )", "(눈_눈)", "ʕ º ᴥ ºʔ"];

module.exports = {
	servers: ["614615934979801113"],
	async process(oldMessage, newMessage) {
		if (newMessage.author.bot) return;
		const db = Storage.getDatabase(newMessage.guild.id);
		if (!db.filter || db.filter.length === 0) return;

		const member = await client.guilds.cache.get(newMessage.guild.id).members.cache.get(newMessage.author.id);
		// Mods should be immune
		if (member.hasPermission("MANAGE_MESSAGES")) return;

		const banwordRegex = new RegExp(`(?:\\b|(?!\\w))(?:${glyph.replace(removeDiacritics(db.filter.join("?"))).toLowerCase().replace(/i/g, "[i|l]").replace(/\?/g, "|")})(?:\\b|\\B(?!\\w))`, "i");

		// Check for filtered words in the newMessage
		for (const word of glyph.replace(removeDiacritics(newMessage.content).replace(/[.]/g, "")).toLowerCase().split(" ")) {
			if (banwordRegex.test(word)) {
				try {
					newMessage.delete();
					newMessage.channel.send(`${discordFailureEmoji} ${newMessage.author}, your essage contained terms that are not permitted in this server, and has been deleted.`);
				} catch (e) {}
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
					} catch (e) {}
				}
			}
		}

		// Check for filtered words in username
		let inapUsername = false;
		const currentMember = await client.guilds.cache.get(newMessage.guild.id).members.cache.get(newMessage.author.id);
		if (!currentMember.nickname) {
			for (const word of glyph.replace(removeDiacritics(newMessage.author.username.replace(/[.]/g, ""))).toLowerCase().split(" ")) {
				if (banwordRegex.test(word)) {
					try {
						await member.setNickname(Tools.sampleOne(KAOMOJI));
						inapUsername = true;
					} catch (e) {}
				}
			}
		}

		if (inapUsername || inapNickname)	newMessage.channel.send(`${discordFailureEmoji} ${newMessage.author}, your user/nickname contained terms that are not permitted in this server, so your nickname has been reset.`);
	},
};
