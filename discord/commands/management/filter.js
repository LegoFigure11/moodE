"use strict";

module.exports = {
	desc: "Allows configuration of the word filter.",
	usage: "<+/-word1>, <+/- word2 (optional)>, <+/-word... (optional)>",
	aliases: ["banword"],
	isManager: true,
	noPm: true,
	async process(message, args) {
		const db = Storage.getDatabase(message.guild.id);
		if (!db.filter) db.filter = [];
		const words = args.join(" ");
		const errorWords = [];
		for (let word of words.split(" ")) {
			word = Tools.toFilterWord(word);
			const w = word.substring(1);
			if (word.startsWith("+") && !db.filter.includes(w)) {
				try {
					const r = new RegExp(w); // eslint-disable-line
					db.filter.push(w);
				} catch (e) {
					errorWords.push(w);
				}
			} else if (word.startsWith("-") && db.filter.includes(word.substring(1))) {
				db.filter.splice(db.filter.indexOf(word.substring(1)), 1);
			}	else {
				if (word.length > 0) message.channel.send(`${word} is${db.filter.includes(word) ? "" : " not"} a banned word in this server.`);
			}
		}
		db.filter.sort();
		Storage.exportDatabase(message.guild.id);
		if (errorWords.length > 0) message.channel.send(`Failed to add: \`\`\`${errorWords.join("\n")}\`\`\` as ${errorWords.length === 1 ? "it" : "they"} could not be parsed as a valid regular expression!`);
		return message.channel.send(`\`\`\`md\nFiltered Words in ${message.guild.name}:\n\t${db.filter.length > 0 ? db.filter.join("\n\t") : "None!"}\`\`\``);
	},
};
