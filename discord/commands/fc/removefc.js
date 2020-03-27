"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Removes an FC from the database.",
	usage: "<code>, <category>",
	aliases: ["deletefc", "removefcs", "deletefcs"],
	async process(message, args) {
		utilities.checkForDb("fc", `{"fc":{}}`);

		const person = message.author.id;
		const username = message.author.username;
		const name = `${username}#${message.author.discriminator}`;

		const db = Storage.getDatabase("fc");
		const fcs = db.fc;

		if (!(person in fcs) || !("categories" in fcs[person])) return message.channel.send("No FCs found!");
		const categories = Array.from(Object.keys(fcs[person].categories));

		if (!(args[1]) || !(categories.includes(utilities.getFcCategory(args[1])))) return message.channel.send(`Category must be one of: ${categories.join(", ")}`);
		const category = utilities.getFcCategory(args[1]);

		if (!(args[0]) || !(fcs[person].categories[category].includes(utilities.formatFc(Tools.toId(args[0]))))) return message.channel.send(`Code must be one of: ${fcs[person].categories[category].join(", ")}`);
		const code = utilities.formatFc(Tools.toId(args[0]));

		fcs[person].user = name; // Update identifier

		if (fcs[person].categories[category].includes(code)) fcs[person].categories[category].splice(fcs[person].categories[category].indexOf(code), 1);
		if (fcs[person].categories[category].length === 0) delete fcs[person].categories[category];
		const keys = Array.from(Object.keys(fcs[person].categories));
		if (keys.length === 0) delete fcs[person];
		return utilities.exportDbAndSend(message, `Deleted **${code}** from category "${category}"!`, "fc");
	},
};
