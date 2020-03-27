"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: `Adds an FC to the provided category for the provided user, for use with ${discordConfig.commandCharacter}fc.`,
	usage: "<code>, <category>, <user id>",
	elevatedOnly: true,
	async process(message, args) {
		utilities.checkForDb("fc", `{"fc":{}}`);

		if (!(args[0])) return message.channel.send("Error: Expected valid code!");
		if (!(args[1])) return message.channel.send("Error: Expected category.");
		if (!(args[2])) return message.channel.send("Error: Expected user id.");

		const user = utilities.parseUserId(args[2]);
		if (!user) return message.channel.send("Error: Please provide a valid user id.");

		const person = user.id;
		const username = user.username;
		const name = `${username}#${user.discriminator}`;

		const db = Storage.getDatabase("fc");
		let fcs = db.fc;
		const category = utilities.getFcCategory(args[1]);
		const code = utilities.formatFc(Tools.toId(args[0]));

		if (!(person in fcs)) fcs[person] = {};

		fcs = fcs[person];
		fcs.user = name; // Update identifier

		if (!("categories" in fcs)) fcs.categories = {};

		if (category in fcs.categories) {
			if (fcs.categories[category].includes(code)) return utilities.exportDbAndSend(message, "It looks like I already have that code registered in my database...", "fc");
			fcs.categories[category].push(code);
			return utilities.exportDbAndSend(message, `Hi, <@${user.id}>! <@${message.author.id}> just added your ${category} Friend Code to my database, so now you can use \`\`${discordConfig.commandCharacter}fc\`\` to bring it up any time! Why not give it a shot right now? You can also use \`\`${discordConfig.commandCharacter}addfc\`\` to add more, or \`\`${discordConfig.commandCharacter}removefc\`\` if there was a mistake.`, "fc");
		} else {
			fcs.categories[category] = [code];
			return utilities.exportDbAndSend(message, `Hi, <@${user.id}>! <@${message.author.id}> just added your ${category} Friend Code to my database, so now you can use \`\`${discordConfig.commandCharacter}fc\`\` to bring it up any time! Why not give it a shot right now? You can also use \`\`${discordConfig.commandCharacter}addfc\`\` to add more, or \`\`${discordConfig.commandCharacter}removefc\`\` if there was a mistake.`, "fc");
		}
	},
};
