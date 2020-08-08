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
		for (let word of words.split(" ")) {
			word = Tools.toFilterWord(word);
			if (word.startsWith("+") && !db.filter.includes(word.substring(1))) db.filter.push(word.substring(1));
			else if (word.startsWith("-") && db.filter.includes(word.substring(1))) db.filter.splice(db.filter.indexOf(word.substring(1)), 1);
			else message.channel.send(`${word} is${db.filter.includes(word) ? "" : " not"} a banned word in this server.`);
		}
		db.filter.sort();
		Storage.exportDatabase(message.guild.id);
		return message.channel.send(`\`\`\`md\nFiltered Words in ${message.guild.name}:\n\t${db.filter.length > 0 ? db.filter.join("\n\t") : "None!"}\`\`\``);
	},
};
