"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Gets the Friend Code(s) of a tagged user, or if no user is tagged, gets your own.",
	usage: "<@ user (optional)>, <category (optional)>",
	aliases: ["fcs", "getfc", "myfc"],
	async process(message, args) {
		utilities.checkForDb("fc", `{"fc":{}}`);

		let person = message.author.id;
		let username = message.author.username;
		let name = `${username}#${message.author.discriminator}`;

		if (message.channel.type !== "dm") {
			if (message.mentions.members.first()) {
				person = message.mentions.members.first().id;
				username = message.guild.members.cache.get(person).user.username;
				name = `${username}#${message.guild.members.get(person).user.discriminator}`;
			}
		}

		for (let i = 0; i < args.length; i++) {
			if (args[i].includes("<")) {
				args.splice(i, 1);
				break;
			}
		}

		const db = Storage.getDatabase("fc");
		let fcs = db.fc;
		let buf = "";
		let category;

		if (!(person in fcs)) return message.channel.send(`There don't seem to be any registered FCs for ${username} in my database. Use \`\`${discordConfig.commandCharacter}addfc\`\` to get started!`);

		fcs = fcs[person];

		fcs.user = name; // Update identifier
		if (!("categories" in fcs)) fcs.categories = {};

		if (args[0]) category = utilities.getFcCategory(args[0]);

		if (category) {
			if (category in fcs.categories && fcs.categories[category].length !== 0) {
				buf += `\`\`\`md\n ${username}'s ${category} Friend Code${fcs.categories[category].length !== 1 ? "s" : ""}:\n\t* ${fcs.categories[category].join("\n\t* ")}\`\`\``;
				return utilities.exportDbAndSend(message, buf, "fc");
			} else {
				message.channel.send(`There don't seem to be any registered FCs for ${category}. Use \`\`${discordConfig.commandCharacter}addfc xxxx-xxxx-xxxx, ${category}\`\` to add one.`);
				message.channel.send("Here are all the registered Friend Codes:");
			}
		}
		buf += "```md\n";
		buf += `${username}'s Friend Codes:\n`;
		const keys = Array.from(Object.keys(fcs.categories));
		for (let i = 0; i < keys.length; i++) {
			if (fcs.categories[keys[i]].length === 0) continue;
			buf += `${keys[i]}:\n\t* `;
			buf += fcs.categories[keys[i]].join("\n\t* ");
			buf += "\n\n";
		}
		buf += "```";
		return utilities.exportDbAndSend(message, buf, "fc");
	},
};
