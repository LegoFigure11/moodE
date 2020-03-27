"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: `Adds an FC to the provided category, for use with ${discordConfig.commandCharacter}fc.`,
	usage: "<code>, <category>",
	aliases: ["addfcs"],
	async process(message, args) {
		utilities.checkForDb("fc", `{"fc":{}}`);

		if (!(args[0])) return message.channel.send(`Error: Expected valid code! ${discordConfig.commandCharacter}addfc code, category`);
		if (!(args[1])) return message.channel.send(`Error: Expected category! ${discordConfig.commandCharacter}addfc code, category`);

		const person = message.author.id;
		const username = message.author.username;
		const name = `${username}#${message.author.discriminator}`;

		const db = Storage.getDatabase("fc");
		let fcs = db.fc;
		const category = utilities.getFcCategory(args[1]);
		const code = utilities.formatFc(Tools.toId(args[0]), category);

		if (!(person in fcs)) fcs[person] = {};

		fcs = fcs[person];
		fcs.user = name; // Update identifier

		if (!("categories" in fcs)) fcs.categories = {};

		if (category in fcs.categories) {
			if (fcs.categories[category].includes(code)) return utilities.exportDbAndSend(message, "It looks like I already have that code registered in my database...", "fc");
			fcs.categories[category].push(code);
			return utilities.exportDbAndSend(message, `Added **${code}** in category "${category}"!`, "fc");
		} else {
			fcs.categories[category] = [code];
			return utilities.exportDbAndSend(message, `Added **${code}** in category "${category}"!`, "fc");
		}
	},
};
