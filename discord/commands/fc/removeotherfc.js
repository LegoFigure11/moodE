"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Removes an FC from the database.",
	usage: "<code>, <category>, <user id>",
	aliases: ["deleteotherfc"],
	elevatedOnly: true,
	async process(message, args) {
		utilities.checkForDb("fc", `{"fc":{}}`);

		if (!(args[2])) return message.channel.send("Error: Expected user id.");

		const user = utilities.parseUserId(args[2]);
		if (!user) return message.channel.send(`Error: User "${args[2]}" not found.`);

		const person = user.id;
		const username = user.username;
		const name = `${username}#${user.discriminator}`;

		const db = Storage.getDatabase("fc");
		const fcs = db.fc;

		if (!(person in fcs) || !("categories" in fcs[person])) return message.channel.send("No FCs found!");
		const categories = Array.from(Object.keys(fcs[person].categories));

		if (!(args[1]) || !(categories.includes(utilities.getFcCategory(args[1])))) return message.channel.send(`Category must be one of: ${categories.join(", ")}`);
		const category = utilities.getFcCategory(args[1]);

		if (!(args[0]) || !(fcs[person].categories[category].includes(utilities.formatFc(Tools.toId(args[0]))))) return message.channel.send(`Code must be one of: ${fcs[person].categories[category].join(", ")}`);
		const code = utilities.formatFc(Tools.toId(args[0]));

		fcs[person].user = name; // Update identifier, just in case we don't delete everything

		if (fcs[person].categories[category].includes(code)) fcs[person].categories[category].splice(fcs[person].categories[category].indexOf(code), 1);
		if (fcs[person].categories[category].length === 0) delete fcs[person].categories[category];
		const keys = Array.from(Object.keys(fcs[person].categories));
		if (keys.length === 0) delete fcs[person];
		return utilities.exportDbAndSend(message, `Deleted ${name}'s code **${code}** from category "${category}"!`, "fc");
	},
};
