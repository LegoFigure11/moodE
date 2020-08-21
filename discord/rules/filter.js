"use strict";

const glyph = require("../../sources/homoglyph.js");
const removeDiacritics = require("diacritics").remove;

const KAOMOJI = ["(* ^ ω ^)", "(o^▽^o)", "(≧◡≦)", "☆⌒ヽ(*\"､^*)chu", "( ˘⌣˘)♡(˘⌣˘ )", "(눈_눈)", "ʕ º ᴥ ºʔ"];

module.exports = {
	async process(message) {
		if (message.author.bot) return;
		const db = Storage.getDatabase(message.guild.id);
		if (!db.filter || db.filter.length === 0) return;

		const member = await client.guilds.cache.get(message.guild.id).members.cache.get(message.author.id);
		// Mods should be immune
		if (member.hasPermission("MANAGE_MESSAGES")) return;

		const filterWords = [];
		for (const word of db.filter) {
			const newWord = [];
			const openIndexes = [];
			const closeIndexes = [];
			let lastChar = "";
			let i = 0;
			for (const char of word) {
				if (char === "[" && lastChar !== "\\") openIndexes.push(i);
				if (char === "]" && lastChar !== "\\") closeIndexes.push(i);
				lastChar = char;
				i++;
			}
			i = 0;
			let j = 0;
			for (let char of word) {
				if (i > openIndexes[j] && i < closeIndexes[j]) {
					if (char === "a" || char === "d") char = "a|d";
					if (char === "i" || char === "l" || char === "j") char = "i|\||l|j"; // eslint-disable-line
					if (char === "n" || char === "x") char = "n|x";
					newWord.push(char);
				} else {
					if (char === "a" || char === "d") char = "[ad]";
					if (char === "i" || char === "l" || char === "j") char = "[i|lj]";
					if (char === "n" || char === "x") char = "[nx]";
					newWord.push(char);
				}
				if (char === "]") j++;
				i++;
			}
			filterWords.push(newWord.join(""));
		}

		const banwordRegex = new RegExp(`(?:\\b|(?!\\w))(?:${filterWords.join("<<<sep>>>").toLowerCase().replace(/<<<sep>>>/g, "|")/* .replace(/[ilj]/g, "[i|lj]").replace(/[ad]/g, "[ad]").replace(/[nx]/g, "[nx]").replace(/<<<sep>>>/g, "|")}*/})(?:\\b|\\B(?!\\w))`, "i");

		// Check for filtered words in the message
		for (const word of glyph.replace(removeDiacritics(message.content).replace(/[.]/g, "")).toLowerCase().split(" ")) {
			if (banwordRegex.test(word)) {
				try {
					await message.delete();
					message.channel.send(`${discordFailureEmoji} ${message.author}, your message contained terms that are not permitted in this server, and has been deleted.`);
					break;
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
